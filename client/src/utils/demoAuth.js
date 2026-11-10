// Demo-mode authentication: lets the UI be explored without a live core-api.
// DEV ONLY — every caller must be gated behind DEMO_AVAILABLE (see config/env).
import { DEMO_AVAILABLE } from '../config/env';

export const DEMO_USERS = {
  admin: {
    _id: 'demo_admin',
    name: 'Ava Mitchell',
    email: 'ava@nexus.io',
    role: 'admin',
    permissions: [],
  },
  manager: {
    _id: 'demo_manager',
    name: 'Maya Chen',
    email: 'maya@nexus.io',
    role: 'manager',
    permissions: [],
  },
  viewer: {
    _id: 'demo_viewer',
    name: 'Priya Nair',
    email: 'priya@nexus.io',
    role: 'viewer',
    permissions: [],
  },
};

/**
 * Start a local, fake session. Throws if demo mode is disabled so a stray
 * call can never silently authenticate someone in a production build.
 */
export const startDemoSession = (role = 'admin') => {
  if (!DEMO_AVAILABLE) {
    // Production builds never create a fake session.
    throw new Error('Demo mode is disabled in this build.');
  }
  const user = DEMO_USERS[role] || DEMO_USERS.admin;
  localStorage.setItem('token', `demo-token-${role}`);
  localStorage.setItem('user', JSON.stringify(user));
  return { token: `demo-token-${role}`, user };
};
