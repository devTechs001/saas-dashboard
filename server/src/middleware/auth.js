import jwt from 'jsonwebtoken';
import ApiError from '../utils/apiError.js';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';

export const protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('You are not logged in');
  }

  // Demo-session tokens (issued by the client demoAuth) resolve against the
  // in-memory store so previews work without a database. Disabled in
  // production deployments (NODE_ENV=production).
  if (token.startsWith('demo-token-') || token.startsWith('demo-user-')) {
    if (process.env.NODE_ENV === 'production') {
      throw ApiError.unauthorized('Demo sessions are disabled in production');
    }
    const { memoryStore } = await import('../store/memoryStore.js');
    let user = null;
    if (token.startsWith('demo-user-')) {
      user = memoryStore.findUser(token.slice('demo-user-'.length));
    } else {
      const role = token.slice('demo-token-'.length);
      user =
        memoryStore.db.users.find((u) => u.role === role) ||
        (role === 'admin' ? memoryStore.db.users[0] : null);
    }
    if (!user || user.isActive === false) {
      throw ApiError.unauthorized('Invalid demo session');
    }
    req.user = user;
    req.tenantId = user.tenantId || 'default';
    return next();
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    throw ApiError.unauthorized('User no longer exists or is inactive');
  }

  req.user = user;
  req.tenantId = decoded.tenantId;
  next();
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        `User role ${req.user.role} is not authorized to access this route`
      );
    }
    next();
  };
};

export const checkPermission = (...permissions) => {
  return (req, res, next) => {
    const userPermissions = req.user.permissions || [];
    const hasPermission = permissions.some((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasPermission) {
      throw ApiError.forbidden(
        'User does not have the required permissions'
      );
    }
    next();
  };
};
