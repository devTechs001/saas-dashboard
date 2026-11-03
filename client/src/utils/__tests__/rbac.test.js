import { describe, it, expect } from 'vitest';
import { can, hasRole, permissionsForRole, ROLES, PERMISSIONS } from '../rbac';

describe('rbac.can', () => {
  it('grants admins every permission', () => {
    Object.values(PERMISSIONS).forEach((p) => {
      expect(can(ROLES.ADMIN, p)).toBe(true);
    });
  });

  it('restricts viewers from writing customers and managing billing', () => {
    expect(can(ROLES.VIEWER, PERMISSIONS.CUSTOMERS_VIEW)).toBe(true);
    expect(can(ROLES.VIEWER, PERMISSIONS.CUSTOMERS_WRITE)).toBe(false);
    expect(can(ROLES.VIEWER, PERMISSIONS.BILLING_MANAGE)).toBe(false);
    expect(can(ROLES.VIEWER, PERMISSIONS.ADMIN_USERS)).toBe(false);
  });

  it('lets managers write customers but not manage users', () => {
    expect(can(ROLES.MANAGER, PERMISSIONS.CUSTOMERS_WRITE)).toBe(true);
    expect(can(ROLES.MANAGER, PERMISSIONS.ADMIN_USERS)).toBe(false);
  });

  it('accepts a user object and honours permission overrides', () => {
    const viewer = { role: 'viewer', permissions: ['customers:write'] };
    expect(can(viewer, PERMISSIONS.CUSTOMERS_WRITE)).toBe(true);
    expect(can(viewer, PERMISSIONS.BILLING_MANAGE)).toBe(false);
  });

  it('denies unknown roles and missing input', () => {
    expect(can('superuser', PERMISSIONS.DASHBOARD_VIEW)).toBe(false);
    expect(can(null, PERMISSIONS.DASHBOARD_VIEW)).toBe(false);
    expect(can({}, PERMISSIONS.DASHBOARD_VIEW)).toBe(false);
  });
});

describe('rbac.hasRole', () => {
  it('matches roles from strings and user objects', () => {
    expect(hasRole('admin', ['admin'])).toBe(true);
    expect(hasRole({ role: 'manager' }, ['admin', 'manager'])).toBe(true);
    expect(hasRole({ role: 'viewer' }, ['admin'])).toBe(false);
    expect(hasRole(undefined, ['admin'])).toBe(false);
  });
});

describe('rbac.permissionsForRole', () => {
  it('returns a non-empty list per role and empty for unknown', () => {
    expect(permissionsForRole(ROLES.ADMIN).length).toBeGreaterThan(5);
    expect(permissionsForRole(ROLES.VIEWER).length).toBeGreaterThan(0);
    expect(permissionsForRole('nope')).toEqual([]);
  });
});
