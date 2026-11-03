import { describe, it, expect } from 'vitest';
import {
  formatCurrency, formatNumber, formatCompact, formatPercent,
  formatDate, formatRelative, getInitials, getAvatarColor,
} from '../format';

describe('formatCurrency', () => {
  it('formats USD with no decimals by default', () => {
    expect(formatCurrency(84230)).toBe('$84,230');
    expect(formatCurrency(0)).toBe('$0');
    expect(formatCurrency(null)).toBe('$0');
  });

  it('supports custom currency and digits', () => {
    expect(formatCurrency(2400.5, 'USD', 2)).toBe('$2,400.50');
    expect(formatCurrency(120, 'EUR', 0)).toContain('120');
  });
});

describe('formatNumber / formatCompact / formatPercent', () => {
  it('formats plain numbers', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(3.14159, 2)).toBe('3.14');
  });

  it('compacts large numbers', () => {
    expect(formatCompact(24891)).toBe('24.9K');
    expect(formatCompact(1010760)).toBe('1M');
  });

  it('formats signed percentages', () => {
    expect(formatPercent(12.4)).toBe('+12.4%');
    expect(formatPercent(-0.6)).toBe('-0.6%');
    expect(formatPercent(0)).toBe('+0.0%');
  });
});

describe('formatDate / formatRelative', () => {
  it('formats dates', () => {
    expect(formatDate('2026-11-03T09:00:00Z', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })).toBe('Nov 3, 2026');
  });

  it('describes relative time', () => {
    expect(formatRelative(new Date().toISOString())).toBe('just now');
    expect(formatRelative(new Date(Date.now() - 5 * 60000).toISOString())).toBe('5m ago');
    expect(formatRelative(new Date(Date.now() - 3 * 3600000).toISOString())).toBe('3h ago');
    expect(formatRelative(new Date(Date.now() - 2 * 86400000).toISOString())).toBe('2d ago');
    expect(formatRelative('2026-01-01T00:00:00Z')).toMatch(/2025|2026/);
  });
});

describe('getInitials / getAvatarColor', () => {
  it('builds initials', () => {
    expect(getInitials('Ava Mitchell')).toBe('AM');
    expect(getInitials('priya')).toBe('P');
    expect(getInitials('')).toBe('?');
    expect(getInitials(undefined)).toBe('?');
  });

  it('produces a stable color per name', () => {
    const a = getAvatarColor('Maya Chen');
    const b = getAvatarColor('Maya Chen');
    expect(a).toBe(b);
    expect(a).toMatch(/^#[0-9A-F]{6}$/i);
  });
});
