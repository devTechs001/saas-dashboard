/**
 * Brute / adversarial edge-case battery.
 * Every util must survive hostile input — null, NaN, Infinity, prototype
 * pollution keys, XSS payloads, giant strings — without throwing.
 */
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';
import {
  formatCurrency, formatNumber, formatCompact, formatPercent,
  formatDate, formatRelative, getInitials, getAvatarColor,
} from '../utils/format';
import { can, hasRole, permissionsForRole, ROLES, PERMISSIONS } from '../utils/rbac';
import { SafeText, stripTags } from '../utils/safeText';
import { DEMO_USERS, startDemoSession } from '../utils/demoAuth';
import { createAppTheme, ACCENTS } from '../theme';
import themeReducer, { setAccent, setMode, setSoundEnabled } from '../store/slices/themeSlice';
import notificationReducer, { addNotification, markAsRead, markAllAsRead } from '../store/slices/notificationSlice';
import { isSoundEnabled, setSoundEnabled as setSoundPref, playNotificationSound, playErrorSound } from '../utils/sound';

const EVIL_VALUES = [null, undefined, NaN, Infinity, -Infinity, '', 'garbage', -0, 0, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MAX_VALUE, -Number.MAX_VALUE, {}, [], true, false];

describe('brute: formatters never throw', () => {
  it('formatCurrency survives everything', () => {
    for (const v of EVIL_VALUES) {
      expect(() => formatCurrency(v)).not.toThrow();
      expect(typeof formatCurrency(v)).toBe('string');
    }
    expect(formatCurrency(NaN)).toBe('$0');
    expect(formatCurrency(Infinity)).toBe('$0');
    expect(formatCurrency(null)).toBe('$0');
    expect(formatCurrency(1234.5, 'USD', 2)).toBe('$1,234.50');
  });

  it('formatCurrency survives invalid currency codes', () => {
    expect(() => formatCurrency(1, 'NOT_A_CURRENCY')).not.toThrow();
    expect(() => formatCurrency(1, '')).not.toThrow();
    expect(() => formatCurrency(1, null)).not.toThrow();
  });

  it('formatNumber / formatCompact survive everything', () => {
    for (const v of EVIL_VALUES) {
      expect(() => formatNumber(v)).not.toThrow();
      expect(() => formatCompact(v)).not.toThrow();
    }
    expect(formatCompact(Number.MAX_SAFE_INTEGER)).toBe('9007.2T');
  });

  it('formatPercent returns a dash for non-finite input', () => {
    for (const v of [NaN, Infinity, -Infinity, null, undefined, 'x', {}]) {
      expect(formatPercent(v)).toBe('—');
    }
    expect(formatPercent(12.345, 2)).toBe('+12.35%');
    expect(formatPercent(-0.5)).toBe('-0.5%');
  });

  it('formatDate / formatRelative survive invalid dates', () => {
    for (const v of ['garbage', null, undefined, NaN, '', '9999-99-99', {}, []]) {
      expect(() => formatDate(v)).not.toThrow();
      expect(() => formatRelative(v)).not.toThrow();
      expect(formatDate(v)).toBe('—');
      expect(formatRelative(v)).toBe('—');
    }
    // valid dates still format
    expect(formatRelative(new Date().toISOString())).toBe('just now');
    expect(formatDate('2026-06-14T00:00:00Z', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })).toBe('Jun 14, 2026');
  });

  it('getInitials / getAvatarColor survive hostile names', () => {
    for (const v of EVIL_VALUES) {
      expect(() => getInitials(v)).not.toThrow();
      expect(() => getAvatarColor(v)).not.toThrow();
    }
    expect(getInitials(123)).toBe('?');
    expect(getInitials('🎉🎉')).toBe('🎉'); // code-point safe
    expect(getInitials(null)).toBe('?');
    expect(getAvatarColor('__proto__')).toMatch(/^#[0-9A-F]{6}$/i);
    const giant = 'a'.repeat(100000);
    expect(() => getAvatarColor(giant)).not.toThrow();
  });
});

describe('brute: RBAC resists prototype pollution and fuzzing', () => {
  it('all role/permission pairs form the exact expected matrix', () => {
    const expected = {
      admin: new Set(Object.values(PERMISSIONS)),
      manager: new Set([
        PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.CUSTOMERS_VIEW, PERMISSIONS.CUSTOMERS_WRITE,
        PERMISSIONS.ANALYTICS_VIEW, PERMISSIONS.REPORTS_VIEW, PERMISSIONS.REPORTS_DOWNLOAD,
        PERMISSIONS.TEAM_VIEW, PERMISSIONS.TEAM_MANAGE, PERMISSIONS.CHAT_USE, PERMISSIONS.AI_USE,
        PERMISSIONS.BILLING_VIEW, PERMISSIONS.SETTINGS_VIEW,
      ]),
      viewer: new Set([
        PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.CUSTOMERS_VIEW, PERMISSIONS.ANALYTICS_VIEW,
        PERMISSIONS.REPORTS_VIEW, PERMISSIONS.CHAT_USE, PERMISSIONS.AI_USE, PERMISSIONS.SETTINGS_VIEW,
      ]),
    };
    for (const [role, perms] of Object.entries(expected)) {
      for (const p of Object.values(PERMISSIONS)) {
        expect(can(role, p)).toBe(perms.has(p));
      }
    }
  });

  it('prototype-pollution role keys neither crash nor grant access', () => {
    for (const role of ['__proto__', 'constructor', 'prototype', 'toString', 'hasOwnProperty']) {
      expect(() => can(role, PERMISSIONS.DASHBOARD_VIEW)).not.toThrow();
      expect(can(role, PERMISSIONS.DASHBOARD_VIEW)).toBe(false);
      expect(permissionsForRole(role)).toEqual([]);
    }
    // user objects with poisoned fields
    expect(can({ role: '__proto__', permissions: ['__proto__'] }, PERMISSIONS.ADMIN_USERS)).toBe(false);
    expect(can({ role: 'viewer', permissions: 'not-an-array' }, PERMISSIONS.CUSTOMERS_WRITE)).toBe(false);
    expect(can({ permissions: [PERMISSIONS.CUSTOMERS_WRITE] }, PERMISSIONS.CUSTOMERS_WRITE)).toBe(false); // no role
  });

  it('permission overrides grant exactly what is listed — nothing more', () => {
    const user = { role: 'viewer', permissions: [PERMISSIONS.CUSTOMERS_WRITE, 'made:up'] };
    expect(can(user, PERMISSIONS.CUSTOMERS_WRITE)).toBe(true);
    expect(can(user, 'made:up')).toBe(true);
    expect(can(user, PERMISSIONS.BILLING_MANAGE)).toBe(false);
  });

  it('hasRole fuzzing', () => {
    expect(hasRole(undefined, ['admin'])).toBe(false);
    expect(hasRole({}, [])).toBe(false);
    expect(hasRole({ role: 'admin' }, 'admin')).toBe(false); // roles must be an array
    expect(hasRole('__proto__', ['__proto__'])).toBe(true);
    expect(hasRole(ROLES.ADMIN, [ROLES.ADMIN, ROLES.MANAGER])).toBe(true);
  });
});

const XSS_PAYLOADS = [
  '<script>alert(1)</script>',
  '<img src=x onerror="alert(1)">',
  '<b onclick="evil()">bold</b>',
  '<b>ok</b><script>bad()</script>',
  '<a href="javascript:alert(1)">click</a>',
  '"><svg/onload=alert(1)>',
  '<iframe src="evil.com"></iframe>',
  '&lt;script&gt;alert(1)&lt;/script&gt;',
  '<b><b>nested</b></b>',
  '<b>unclosed',
  'closed</b>',
  '<b onmouseover=alert(1)>attrs</b>',
  '<B>case</B>',
  '🔥'.repeat(1000),
  '<b></b>'.repeat(500),
];

describe('brute: SafeText XSS battery', () => {
  it('never produces executable markup for any payload', () => {
    for (const payload of XSS_PAYLOADS) {
      const { container, unmount } = renderSafe(payload);
      // No dangerous elements ever appear
      expect(container.querySelector('script')).toBeNull();
      expect(container.querySelector('img')).toBeNull();
      expect(container.querySelector('iframe')).toBeNull();
      expect(container.querySelector('svg')).toBeNull();
      expect(container.querySelector('a')).toBeNull();
      // onclick-style attributes never land on elements
      for (const el of container.querySelectorAll('*')) {
        for (const attr of el.attributes || []) {
          expect(attr.name.startsWith('on')).toBe(false);
        }
      }
      unmount();
    }
  });

  it('plain <b> still renders bold, stripTags removes all tags', () => {
    const { container } = renderSafe('closed <b>Acme</b> deal');
    expect(container.querySelector('b')?.textContent).toBe('Acme');
    expect(stripTags('<b>x</b><script>y</script>')).toBe('xy');
    expect(() => stripTags(null)).not.toThrow();
    expect(stripTags(undefined)).toBe('');
  });

  it('giant input does not hang (no catastrophic regex)', () => {
    const giant = '<b>x</b>'.repeat(20000);
    const start = Date.now();
    renderSafe(giant);
    expect(Date.now() - start).toBeLessThan(3000);
  });
});

// Small helper so payloads render through the real SafeText component.
function renderSafe(text) {
  return render(<SafeText text={text} />);
}

describe('brute: demoAuth & theme slice', () => {
  it('startDemoSession falls back safely for anything thrown at it', () => {
    for (const role of ['__proto__', 'constructor', '', null, undefined, 42, {}, []]) {
      expect(() => startDemoSession(role)).not.toThrow();
      const s = startDemoSession(role);
      expect(DEMO_USERS[s.user.role]).toBeTruthy();
    }
  });

  it('theme slice stores junk but theme creation stays safe', () => {
    let state = themeReducer(undefined, setAccent('__proto__'));
    expect(state.accent).toBe('__proto__'); // stored as-is…
    // …but theme factory must fall back to a valid accent
    const theme = createAppTheme('dark', '__proto__');
    expect(theme.palette.primary.main).toBe(ACCENTS.indigo.main);
    expect(theme.palette.mode).toBe('dark');

    for (const junk of ['', null, undefined, 'purple', 'constructor', {}]) {
      expect(() => createAppTheme(junk, junk)).not.toThrow();
    }
    expect(createAppTheme('dark', 'emerald').palette.primary.main).toBe(ACCENTS.emerald.main);

    state = themeReducer(state, setSoundEnabled('yes'));
    expect(typeof state.soundEnabled).toBe('boolean');
  });
});

describe('brute: notification slice & sound', () => {
  it('addNotification rejects garbage payloads', () => {
    let state = notificationReducer(undefined, { type: '@@INIT' });
    for (const junk of [null, undefined, 'text', 42, [], {}]) {
      state = notificationReducer(state, addNotification(junk));
    }
    // only the plain object passes… ({} accepted as object — count is small and finite)
    expect(state.notifications.length).toBeLessThanOrEqual(1);
    expect(state.notifications.every((n) => n && typeof n === 'object')).toBe(true);

    // marking inexistent ids / double marking never throws or goes negative
    state = notificationReducer(state, markAsRead('nope'));
    state = notificationReducer(state, markAsRead(undefined));
    state = notificationReducer(state, markAllAsRead());
    state = notificationReducer(state, markAllAsRead());
    expect(state.unreadCount).toBeGreaterThanOrEqual(0);
  });

  it('sound prefs and playback survive hostile environments', () => {
    setSoundPref(false);
    expect(isSoundEnabled()).toBe(false);
    expect(() => playNotificationSound()).not.toThrow();
    expect(() => playErrorSound()).not.toThrow();
    setSoundPref(true);
    expect(() => playNotificationSound()).not.toThrow();
    // localStorage disabled?
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
    expect(() => isSoundEnabled()).not.toThrow();
    spy.mockRestore();
  });
});
