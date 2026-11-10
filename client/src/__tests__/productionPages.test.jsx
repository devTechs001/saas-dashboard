import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider, createTheme } from '@mui/material/styles';

/**
 * Production builds have no sample data: every sample array/object is `[]`/`{}`.
 * These pages used to index into it (`aiInsights[0]`, `revenueSeries[11]`,
 * `usage[0]`), which crashed the whole route. This suite renders each page with
 * demo disabled and empty API responses to prove the empty states hold.
 */

vi.mock('../config/env', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, DEMO_AVAILABLE: false, IS_PRODUCTION: true };
});

// No network in tests: every service resolves to an empty payload.
vi.mock('../services', () => {
  const empty = { data: { data: [] } };
  const fn = () => Promise.resolve(empty);
  const svc = {
    getAll: fn, getById: fn, create: fn, update: fn, delete: fn,
    getStats: fn, search: fn, getDashboardStats: fn, getByDate: fn,
    getTopPages: fn, getDeviceBreakdown: fn, markAsRead: fn,
    markAllAsRead: fn,
  };
  return {
    default: {},
    authService: svc,
    customerService: svc,
    analyticsService: svc,
    reportService: svc,
    notificationService: svc,
  };
});

import store from '../store';

const pages = {
  Dashboard: () => import('../pages/Dashboard'),
  Analytics: () => import('../pages/Analytics'),
  Billing: () => import('../pages/Billing'),
  Admin: () => import('../pages/Admin'),
  Profile: () => import('../pages/Profile'),
  Team: () => import('../pages/Team'),
  Chat: () => import('../pages/Chat'),
  Developers: () => import('../pages/Developers'),
  AIAssistant: () => import('../pages/AIAssistant'),
  Settings: () => import('../pages/Settings'),
};

const renderPage = async (loader) => {
  const mod = await loader();
  const Page = mod.default;
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, refetchOnWindowFocus: false } },
  });
  return render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider theme={createTheme()}>
          <MemoryRouter>
            <Page />
          </MemoryRouter>
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  );
};

describe('pages render in a production build (no sample data)', () => {
  beforeEach(() => localStorage.clear());

  Object.entries(pages).forEach(([name, loader]) => {
    it(`${name} mounts without crashing`, async () => {
      await expect(renderPage(loader)).resolves.toBeTruthy();
    });
  });
});
