// Role-Based Access Control utilities.
// Roles mirror the core-api User model: admin > manager > viewer.

export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  VIEWER: 'viewer',
};

export const ROLE_LABELS = {
  admin: 'Admin',
  manager: 'Manager',
  viewer: 'Viewer',
};

export const PERMISSIONS = {
  DASHBOARD_VIEW: 'dashboard:view',
  CUSTOMERS_VIEW: 'customers:view',
  CUSTOMERS_WRITE: 'customers:write',
  ANALYTICS_VIEW: 'analytics:view',
  REPORTS_VIEW: 'reports:view',
  REPORTS_DOWNLOAD: 'reports:download',
  TEAM_VIEW: 'team:view',
  TEAM_MANAGE: 'team:manage',
  CHAT_USE: 'chat:use',
  AI_USE: 'ai:use',
  BILLING_VIEW: 'billing:view',
  BILLING_MANAGE: 'billing:manage',
  ADMIN_USERS: 'admin:users',
  DEVELOPERS_VIEW: 'developers:view',
  SETTINGS_VIEW: 'settings:view',
  SETTINGS_MANAGE: 'settings:manage',
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MANAGER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.CUSTOMERS_WRITE,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.REPORTS_DOWNLOAD,
    PERMISSIONS.TEAM_VIEW,
    PERMISSIONS.TEAM_MANAGE,
    PERMISSIONS.CHAT_USE,
    PERMISSIONS.AI_USE,
    PERMISSIONS.BILLING_VIEW,
    PERMISSIONS.SETTINGS_VIEW,
  ],
  [ROLES.VIEWER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.CUSTOMERS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.CHAT_USE,
    PERMISSIONS.AI_USE,
    PERMISSIONS.SETTINGS_VIEW,
  ],
};

/**
 * Check whether a user (or role string) holds a permission.
 * Users may also carry explicit `permissions[]` overrides.
 * Hardened against prototype-chain lookups ('__proto__', 'constructor'…).
 */
export const can = (userOrRole, permission) => {
  const role = typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;
  const extra = typeof userOrRole === 'object' && userOrRole ? userOrRole.permissions || [] : [];
  if (typeof role !== 'string' || !role) return false;
  const rolePerms = Object.hasOwn(ROLE_PERMISSIONS, role) ? ROLE_PERMISSIONS[role] : [];
  const extraPerms = Array.isArray(extra) ? extra : [];
  return rolePerms.includes(permission) || extraPerms.includes(permission);
};

/** Check whether a user has one of the given roles. */
export const hasRole = (userOrRole, roles = []) => {
  const role = typeof userOrRole === 'string' ? userOrRole : userOrRole?.role;
  return Array.isArray(roles) && roles.includes(role);
};

/** All permissions for a role (useful for UI capability previews). */
export const permissionsForRole = (role) =>
  typeof role === 'string' && Object.hasOwn(ROLE_PERMISSIONS, role) ? ROLE_PERMISSIONS[role] : [];
