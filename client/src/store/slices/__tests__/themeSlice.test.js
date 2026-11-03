import { describe, it, expect, beforeEach } from 'vitest';
import themeReducer, {
  toggleMode, setMode, setAccent, toggleSidebar, setSidebarOpen,
  toggleMobileSidebar, setMobileSidebarOpen,
} from '../themeSlice';

describe('themeSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has sensible defaults', () => {
    const state = themeReducer(undefined, { type: '@@INIT' });
    expect(state.mode).toBe('light');
    expect(state.accent).toBe('indigo');
    expect(state.sidebarOpen).toBe(true);
    expect(state.mobileSidebarOpen).toBe(false);
  });

  it('toggles and sets mode, persisting to localStorage', () => {
    let state = themeReducer(undefined, toggleMode());
    expect(state.mode).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    state = themeReducer(state, setMode('light'));
    expect(state.mode).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('sets accent and persists it', () => {
    const state = themeReducer(undefined, setAccent('emerald'));
    expect(state.accent).toBe('emerald');
    expect(localStorage.getItem('accent')).toBe('emerald');
  });

  it('toggles sidebar state', () => {
    let state = themeReducer(undefined, toggleSidebar());
    expect(state.sidebarOpen).toBe(false);
    state = themeReducer(state, setSidebarOpen(true));
    expect(state.sidebarOpen).toBe(true);
  });

  it('toggles mobile sidebar state', () => {
    let state = themeReducer(undefined, toggleMobileSidebar());
    expect(state.mobileSidebarOpen).toBe(true);
    state = themeReducer(state, setMobileSidebarOpen(false));
    expect(state.mobileSidebarOpen).toBe(false);
  });
});
