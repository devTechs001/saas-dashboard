import { describe, it, expect, beforeEach } from 'vitest';
import { DEMO_USERS, startDemoSession } from '../demoAuth';

describe('demoAuth', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defines demo users for all three roles', () => {
    expect(Object.keys(DEMO_USERS).sort()).toEqual(['admin', 'manager', 'viewer']);
    expect(DEMO_USERS.admin.role).toBe('admin');
    expect(DEMO_USERS.viewer.name).toBe('Priya Nair');
  });

  it('starts a session and persists it', () => {
    const session = startDemoSession('manager');
    expect(session.user.role).toBe('manager');
    expect(session.token).toContain('manager');
    expect(localStorage.getItem('token')).toBe(session.token);
    expect(JSON.parse(localStorage.getItem('user')).email).toBe(DEMO_USERS.manager.email);
  });

  it('falls back to the admin session for unknown roles', () => {
    const session = startDemoSession('wat');
    expect(session.user.role).toBe('admin');
  });
});
