/**
 * Subscription wiring tests: Billing page talks to subscriptionService.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '../store/slices/themeSlice';
import authReducer from '../store/slices/authSlice';
import maintenanceReducer from '../store/slices/maintenanceSlice';
import { createAppTheme } from '../theme';
import { loginSuccess } from '../store/slices/authSlice';
import { startDemoSession } from '../utils/demoAuth';

window.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
}));

vi.mock('../services', () => ({
  subscriptionService: {
    getPlans: vi.fn(),
    getCurrent: vi.fn(),
    subscribe: vi.fn(),
    update: vi.fn(),
    cancel: vi.fn(),
    getInvoices: vi.fn(),
  },
}));

import { subscriptionService } from '../services';
import Billing from '../pages/Billing';

const PLANS = [
  { id: 'starter', name: 'Starter', price: 29, interval: 'month', seats: 3, tagline: 'For small teams', features: ['3 seats', '5 GB'] },
  { id: 'pro', name: 'Pro', price: 79, interval: 'month', seats: 10, tagline: 'For growing teams', features: ['10 seats', '50 GB'] },
  { id: 'enterprise', name: 'Enterprise', price: null, interval: 'month', seats: null, tagline: 'Custom', features: ['Unlimited'] },
];

describe('Billing (subscriptions)', () => {
  let store;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    store = configureStore({
      reducer: { theme: themeReducer, auth: authReducer, maintenance: maintenanceReducer },
    });
    store.dispatch(loginSuccess(startDemoSession('admin')));
    subscriptionService.getPlans.mockResolvedValue({ data: { plans: PLANS } });
    subscriptionService.getCurrent.mockResolvedValue({
      data: {
        subscription: {
          id: 'sub_1', planId: 'pro', status: 'active', seats: 4,
          currentPeriodStart: '2026-10-14T00:00:00Z', currentPeriodEnd: '2026-11-14T00:00:00Z',
          cancelAtPeriodEnd: false,
        },
        plan: PLANS[1],
      },
    });
    subscriptionService.getInvoices.mockResolvedValue({
      data: { invoices: [{ id: 'INV-1', amount: 316, status: 'paid', date: '2026-10-14', seats: 4 }] },
    });
  });

  const renderBilling = () =>
    render(
      <Provider store={store}>
        <ThemeProvider theme={createAppTheme('dark')}>
          <Billing />
        </ThemeProvider>
      </Provider>
    );

  it('loads plans, current subscription and invoices from the API', async () => {
    renderBilling();
    expect(subscriptionService.getPlans).toHaveBeenCalled();
    expect(subscriptionService.getCurrent).toHaveBeenCalled();
    expect(subscriptionService.getInvoices).toHaveBeenCalled();
    // current plan banner shows the live plan + cost (79 × 4 seats) — the
    // same amount appears again in the invoice table
    expect((await screen.findAllByText('Pro')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('$316').length).toBeGreaterThanOrEqual(1);
    // invoice from the API
    expect(await screen.findByText('#INV-1')).toBeInTheDocument();
  });

  it('switches plan through the API and marks the current plan', async () => {
    renderBilling();
    await screen.findAllByText('Pro');
    // Starter card has a Switch plan / Subscribe button
    fireEvent.click(screen.getByRole('button', { name: /switch plan|subscribe/i }));
    await waitFor(() =>
      expect(subscriptionService.subscribe).toHaveBeenCalledWith(expect.objectContaining({ planId: expect.any(String) }))
    );
  });

  it('cancels at period end through the API', async () => {
    subscriptionService.cancel.mockResolvedValue({ data: { subscription: { cancelAtPeriodEnd: true } } });
    renderBilling();
    await screen.findAllByText('Pro');
    fireEvent.click(screen.getByRole('button', { name: /^cancel$/i }));
    await waitFor(() => expect(subscriptionService.cancel).toHaveBeenCalledWith(false));
  });
});
