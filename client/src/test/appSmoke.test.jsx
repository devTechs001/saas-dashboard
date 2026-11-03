import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render } from '@testing-library/react';

// Polyfills a real browser provides
window.matchMedia = window.matchMedia || vi.fn().mockImplementation((q) => ({
  matches: false, media: q, addEventListener: vi.fn(), removeEventListener: vi.fn(),
}));

describe('full app boot', () => {
  it('mounts <App /> without crashing', async () => {
    const { default: App } = await import('../App.jsx');
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });
});
