import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import App from '../App';

/**
 * Regression guard: useRealtime() calls useQueryClient(), so every component
 * that renders during app startup must sit inside QueryClientProvider.
 * If the provider is misplaced (e.g. below useRealtime, or skipped while the
 * splash screen shows) this throws
 * "No QueryClient set, use QueryClientProvider to set one".
 */
describe('App bootstrap', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('mounts without a missing QueryClientProvider error', () => {
    expect(() => render(<App />)).not.toThrow();
  });

  it('renders the splash screen on first paint', () => {
    render(<App />);
    expect(screen.getByText('Nexus')).toBeInTheDocument();
    expect(screen.getByText(/Analytics · CRM · AI Copilot/)).toBeInTheDocument();
  });
});
