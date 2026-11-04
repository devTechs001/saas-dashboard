/**
 * Maintenance system tests: level semantics, banner, login blocking,
 * and the admin control surface.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import themeReducer from '../store/slices/themeSlice';
import authReducer from '../store/slices/authSlice';
import maintenanceReducer, { setMaintenanceState } from '../store/slices/maintenanceSlice';
import { createAppTheme } from '../theme';

window.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
}));

vi.mock('../services', () => ({
  authService: {
    login: vi.fn(),
    updateProfile: vi.fn(),
    logout: vi.fn(),
    refresh: vi.fn(),
    register: vi.fn(),
    getProfile: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
  adminService: {
    getStats: vi.fn(),
    getUsers: vi.fn(),
    inviteUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    getAuditLogs: vi.fn(),
  },
  userService: { getDashboard: vi.fn() },
  maintenanceService: { getStatus: vi.fn(), set: vi.fn() },
  subscriptionService: {
    getPlans: vi.fn(), getCurrent: vi.fn(), subscribe: vi.fn(),
    update: vi.fn(), cancel: vi.fn(), getInvoices: vi.fn(),
  },
  workspaceService: {},
}));

import { maintenanceService, adminService, authService } from '../services';
import MaintenanceBanner from '../components/common/MaintenanceBanner';
import Login from '../pages/Login';
import Admin from '../pages/Admin';

const makeStore = (maintenance) =>
  configureStore({
    reducer: { theme: themeReducer, auth: authReducer, maintenance: maintenanceReducer },
    preloadedState: { maintenance },
  });

const ACTIVE = {
  loaded: true, level: 'partial', allowLogin: false, allowRegistration: false,
  allowWrites: true, message: 'Upgrading the billing ledger', until: null,
  effective: { loginBlocked: true, registrationBlocked: true, writesBlocked: false },
};

describe('maintenanceSlice level semantics', () => {
  const reduce = (payload) => maintenanceReducer(undefined, setMaintenanceState(payload));

  it('computes effective flags for partial maintenance', () => {
    const s = reduce({ level: 'partial', allowLogin: true, allowRegistration: false, allowWrites: true });
    expect(s.effective).toEqual({ loginBlocked: false, registrationBlocked: true, writesBlocked: false });
  });

  it('full level blocks everything regardless of flags', () => {
    const s = reduce({ level: 'full', allowLogin: true, allowRegistration: true, allowWrites: true });
    expect(s.effective).toEqual({ loginBlocked: true, registrationBlocked: true, writesBlocked: true });
  });

  it('none level allows everything', () => {
    const s = reduce({ level: 'none', allowLogin: false, allowRegistration: false, allowWrites: false });
    expect(s.effective).toEqual({ loginBlocked: false, registrationBlocked: false, writesBlocked: false });
  });

  it('uses server-provided effective values when present', () => {
    const s = reduce({ level: 'partial', effective: { loginBlocked: true, registrationBlocked: true, writesBlocked: true } });
    expect(s.effective.loginBlocked).toBe(true);
    expect(s.effective.writesBlocked).toBe(true);
  });
});

describe('MaintenanceBanner', () => {
  it('renders the admin message and level when active', () => {
    const store = makeStore(ACTIVE);
    render(
      <Provider store={store}>
        <ThemeProvider theme={createAppTheme('dark')}>
          <MaintenanceBanner />
        </ThemeProvider>
      </Provider>
    );
    expect(screen.getByText(/upgrading the billing ledger/i)).toBeInTheDocument();
    expect(screen.getByText('Partial maintenance')).toBeInTheDocument();
  });

  it('renders nothing when maintenance is off', () => {
    const store = makeStore({
      loaded: true, level: 'none', allowLogin: true, allowRegistration: true,
      allowWrites: true, message: '', effective: { loginBlocked: false, registrationBlocked: false, writesBlocked: false },
    });
    const { container } = render(
      <Provider store={store}>
        <ThemeProvider theme={createAppTheme('dark')}>
          <MaintenanceBanner />
        </ThemeProvider>
      </Provider>
    );
    expect(container.textContent).not.toMatch(/partial maintenance/i);
  });
});

describe('Login blocking', () => {
  it('disables sign-in and shows the maintenance message when login is blocked', async () => {
    const store = makeStore(ACTIVE);
    render(
      <Provider store={store}>
        <ThemeProvider theme={createAppTheme('dark')}>
          <MemoryRouter>
            <Login />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
    const button = screen.getByRole('button', { name: /login disabled/i });
    expect(button).toBeDisabled();
    expect(screen.getByText(/upgrading the billing ledger/i)).toBeInTheDocument();
    // clicking does nothing — no login call
    fireEvent.click(button);
    expect(authService.login).not.toHaveBeenCalled();
  });
});

describe('Admin maintenance console', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    adminService.getUsers.mockResolvedValue({ data: { users: [] } });
    adminService.getAuditLogs.mockResolvedValue({ data: { logs: [] } });
    adminService.getStats.mockResolvedValue({ data: { users: {}, security: {}, roleMix: [], logins: [] } });
    maintenanceService.getStatus.mockResolvedValue({
      data: {
        level: 'none', allowLogin: true, allowRegistration: true, allowWrites: true,
        message: '', effective: { loginBlocked: false, registrationBlocked: false, writesBlocked: false },
      },
    });
    maintenanceService.set.mockResolvedValue({ data: { level: 'partial' } });
  });

  it('saves maintenance settings through the API', async () => {
    const store = makeStore({ loaded: true, level: 'none', effective: {} });
    render(
      <Provider store={store}>
        <ThemeProvider theme={createAppTheme('dark')}>
          <Admin />
        </ThemeProvider>
      </Provider>
    );
    fireEvent.click(screen.getByRole('tab', { name: /maintenance/i }));
    // switch level to Partial + turn login off
    fireEvent.click(await screen.findByRole('radio', { name: /partial/i }));
    fireEvent.click(screen.getByRole('checkbox', { name: /allow login/i }));
    fireEvent.change(screen.getByLabelText(/message shown to users/i), {
      target: { value: 'DB repair in progress' },
    });
    fireEvent.click(screen.getByRole('button', { name: /apply maintenance settings/i }));
    await waitFor(() =>
      expect(maintenanceService.set).toHaveBeenCalledWith(
        expect.objectContaining({ level: 'partial', allowLogin: false, message: 'DB repair in progress' })
      )
    );
  });
});
