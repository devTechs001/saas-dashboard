import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isSoundEnabled, setSoundEnabled,
  playNotificationSound, playMessageSound, playSuccessSound, playErrorSound,
} from '../sound';

describe('sound utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('is enabled by default and persists the preference', () => {
    expect(isSoundEnabled()).toBe(true);
    setSoundEnabled(false);
    expect(isSoundEnabled()).toBe(false);
    expect(localStorage.getItem('soundEnabled')).toBe('false');
    setSoundEnabled(true);
    expect(isSoundEnabled()).toBe(true);
  });

  it('does not throw when playing sounds without an AudioContext', () => {
    // jsdom has no Web Audio API — the guards must swallow that.
    expect(() => playNotificationSound()).not.toThrow();
    expect(() => playMessageSound()).not.toThrow();
    expect(() => playSuccessSound()).not.toThrow();
    expect(() => playErrorSound()).not.toThrow();
  });

  it('respects the disabled preference', () => {
    setSoundEnabled(false);
    // When disabled, sounds short-circuit before touching audio APIs.
    expect(() => playNotificationSound()).not.toThrow();
  });
});
