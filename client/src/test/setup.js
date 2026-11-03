import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Ensure the DOM is torn down between tests (RTL auto-cleanup doesn't
// register reliably under this vitest setup — without this, components
// accumulate across tests and queries collide).
afterEach(() => {
  cleanup();
});
