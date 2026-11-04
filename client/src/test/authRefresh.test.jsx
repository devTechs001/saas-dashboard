/**
 * Auth session-refresh tests for the axios interceptor (services/api.jsx).
 * Uses a mock axios adapter — the transport is faked, the interceptor
 * machinery (refresh-once, retry, auth-path skip, hard logout) is what's
 * under test.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import api, { hardLogout } from '../services/api';

const ok = (config, data = { ok: true }) => Promise.resolve({ data, status: 200, statusText: 'OK', headers: {}, config });
const fail401 = (config) =>
  Promise.reject(
    Object.assign(new Error('Request failed with status code 401'), {
      config,
      response: { status: 401, data: { message: 'Token expired' }, headers: {}, config },
      isAxiosError: true,
    })
  );

const installAdapter = (handler) => {
  const calls = [];
  api.defaults.adapter = (config) => {
    calls.push({ url: config.url, headers: { ...config.headers } });
    return handler(config, calls);
  };
  return calls;
};

describe('auth refresh machinery', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('token', 'expired-access');
    localStorage.setItem('refreshToken', 'valid-refresh');
  });

  it('refreshes once and replays the original request on 401', async () => {
    let workspacesCalls = 0;
    const calls = installAdapter((config) => {
      if (config.url.includes('/auth/refresh')) {
        expect(config.data).toContain('valid-refresh');
        return ok(config, { data: { token: 'fresh-access', refreshToken: 'fresh-refresh' } });
      }
      if (config.url.includes('/workspaces')) {
        workspacesCalls += 1;
        return workspacesCalls === 1 ? fail401(config) : ok(config, { data: { workspaces: [] } });
      }
      return ok(config);
    });

    const res = await api.get('/workspaces');
    expect(res.status).toBe(200);
    // one refresh + first 401 + one replay
    expect(calls.filter((c) => c.url.includes('/auth/refresh'))).toHaveLength(1);
    expect(workspacesCalls).toBe(2);
    // new tokens persisted
    expect(localStorage.getItem('token')).toBe('fresh-access');
    expect(localStorage.getItem('refreshToken')).toBe('fresh-refresh');
    // replay carried the new access token
    const replay = calls.filter((c) => c.url.includes('/workspaces'))[1];
    expect(replay.headers.Authorization).toBe('Bearer fresh-access');
  });

  it('logs out when refresh fails', async () => {
    const calls = installAdapter((config) => {
      if (config.url.includes('/auth/refresh')) return fail401(config);
      return fail401(config);
    });

    await expect(api.get('/workspaces')).rejects.toThrow();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(calls.filter((c) => c.url.includes('/auth/refresh'))).toHaveLength(1);
  });

  it('never refreshes or logs out on a failed login (auth paths skipped)', async () => {
    const calls = installAdapter((config) => {
      if (config.url.includes('/auth/login')) return fail401(config); // wrong password
      return ok(config);
    });

    await expect(api.post('/auth/login', { email: 'x', password: 'bad' })).rejects.toThrow();
    // session intact — no refresh attempted, no logout
    expect(localStorage.getItem('token')).toBe('expired-access');
    expect(localStorage.getItem('refreshToken')).toBe('valid-refresh');
    expect(calls.filter((c) => c.url.includes('/auth/refresh'))).toHaveLength(0);
  });

  it('deduplicates concurrent 401s into a single refresh round-trip', async () => {
    let refreshCalls = 0;
    const gates = {};
    const calls = installAdapter((config) => {
      if (config.url.includes('/auth/refresh')) {
        refreshCalls += 1;
        return new Promise((resolve) => {
          setTimeout(() => resolve({ data: { data: { token: 'fresh-access', refreshToken: 'fresh-refresh' } }, status: 200, statusText: 'OK', headers: {}, config }), 20);
        });
      }
      // first attempt on each protected URL fails, replay succeeds
      const key = config.url;
      gates[key] = (gates[key] || 0) + 1;
      return gates[key] === 1 ? fail401(config) : ok(config);
    });

    const results = await Promise.allSettled([api.get('/workspaces'), api.get('/admin/stats')]);
    expect(results.every((r) => r.status === 'fulfilled')).toBe(true);
    expect(refreshCalls).toBe(1);
  });

  it('retries at most once — a 401 on replay logs out instead of looping', async () => {
    let attempts = 0;
    installAdapter((config) => {
      if (config.url.includes('/auth/refresh')) {
        return ok(config, { data: { token: 'fresh-access', refreshToken: 'fresh-refresh' } });
      }
      attempts += 1;
      return fail401(config); // always 401
    });

    await expect(api.get('/workspaces')).rejects.toThrow();
    expect(attempts).toBe(2); // original + exactly one retry
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('hardLogout clears every session key', () => {
    localStorage.setItem('user', '{}');
    hardLogout();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
