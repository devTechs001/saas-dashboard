/**
 * Maintenance enforcement middleware.
 *
 * Applied at the API router root (before auth), so admin identity is taken
 * from the bearer token itself (role is a signed JWT claim; demo tokens carry
 * it too). Blocks the request classes the admin has disabled while repairs
 * are in progress:
 *   - registration lock   (allowRegistration=false)
 *   - read-only mode      ("block controls": allowWrites=false → no POST/PUT/
 *                          PATCH/DELETE for non-admins)
 *   - full lockdown       (non-admins blocked everywhere except health,
 *                          maintenance status, login and session refresh —
 *                          login is checked per-user in the controller so
 *                          admins can still sign in and turn maintenance off)
 */
import jwt from 'jsonwebtoken';
import ApiError from '../utils/apiError.js';
import { getMaintenance, isRegistrationBlocked, isWriteBlocked } from '../store/maintenanceStore.js';

const ALWAYS_OPEN = [
  { method: 'GET', path: '/health' },
  { method: 'GET', path: '/ready' },
  { method: 'GET', path: '/maintenance' },
  { method: 'GET', path: '/' },
  { method: 'POST', path: '/auth/login' }, // per-user check in controller
  { method: 'POST', path: '/auth/refresh' }, // keep sessions alive to recover
];

const isOpenRoute = (method, path) =>
  ALWAYS_OPEN.some((r) => r.method === method && path === r.path);

/** Best-effort role from the bearer token — no DB round-trip. */
const peekRole = (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return null;
  const token = header.split(' ')[1];
  if (token.startsWith('demo-')) {
    // demo-token-<role> / demo-refresh-token-<role> carry the role directly
    const role = token.replace(/^demo-(refresh-)?(token-)?/, '').split('-')[0];
    return ['admin', 'manager', 'viewer'].includes(role) ? role : null;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded.role || null;
  } catch {
    return null;
  }
};

const maintenanceError = (message) => {
  const err = new ApiError(503, message || 'System maintenance in progress — please check back soon');
  err.code = 'MAINTENANCE';
  return err;
};

export const maintenanceGuard = (req, res, next) => {
  const m = getMaintenance();
  if (m.level === 'none') return next();

  const method = req.method;
  const path = req.path.replace(/\/+$/, '') || '/';
  const role = peekRole(req);

  if (isOpenRoute(method, path)) return next();
  if (role === 'admin') return next();

  // Registration lock
  if (method === 'POST' && path === '/auth/register') {
    if (isRegistrationBlocked()) {
      return next(maintenanceError(m.message || 'Registration is temporarily disabled — maintenance in progress'));
    }
    return next();
  }

  // Read-only enforcement ("block controls"): non-admin writes blocked
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && isWriteBlocked()) {
    return next(maintenanceError(m.message || 'The workspace is read-only — maintenance in progress'));
  }

  // Full lockdown: non-admins cannot read beyond the open routes either
  if (m.level === 'full') {
    return next(maintenanceError(m.message));
  }

  return next();
};

export default maintenanceGuard;
