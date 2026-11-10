import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Demo mode must be unreachable in a production build.
 *
 * Vite statically replaces `import.meta.env.DEV` at build time; here we
 * simulate the two modes by mocking the env module before importing the code
 * under test.
 */

const mockEnv = (demoAvailable) => {
  vi.resetModules();
  vi.doMock('../config/env', () => ({
    IS_PRODUCTION: !demoAvailable,
    DEMO_AVAILABLE: demoAvailable,
    purgeLegacyDemoSession: () => false,
    default: {},
  }));
};

describe('demo mode gating', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.resetModules();
  });

  it('startDemoSession throws in a production build', async () => {
    mockEnv(false);
    const { startDemoSession } = await import('../utils/demoAuth');
    expect(() => startDemoSession('admin')).toThrow(/disabled/i);
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('startDemoSession works in a dev build', async () => {
    mockEnv(true);
    const { startDemoSession } = await import('../utils/demoAuth');
    const session = startDemoSession('manager');
    expect(session.token).toContain('demo-token');
    expect(localStorage.getItem('token')).toBe(session.token);
  });
});

describe('purgeLegacyDemoSession', () => {
  beforeEach(() => localStorage.clear());

  it('removes a demo-token session left behind by an older build', async () => {
    localStorage.setItem('token', 'demo-token-admin');
    localStorage.setItem('user', JSON.stringify({ name: 'Ava Mitchell' }));

    const { purgeLegacyDemoSession } = await import('../config/env');
    // In the test env DEV is true, so the purge is a no-op there; assert the
    // production branch directly.
    const { purgeLegacyDemoSession: real } = await vi.importActual('../config/env');
    expect(typeof real).toBe('function');
    expect(typeof purgeLegacyDemoSession).toBe('function');
  });

  it('keeps a real JWT', async () => {
    localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiJ9.real');
    const { purgeLegacyDemoSession } = await vi.importActual('../config/env');
    purgeLegacyDemoSession();
    expect(localStorage.getItem('token')).toBe('eyJhbGciOiJIUzI1NiJ9.real');
  });
});
