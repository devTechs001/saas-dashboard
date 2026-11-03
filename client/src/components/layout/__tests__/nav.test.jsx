import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { createAppTheme } from '../../../theme';
import store from '../../../store';
import { loginSuccess, logout } from '../../../store/slices/authSlice.jsx';
import { setMobileSidebarOpen, setSidebarOpen } from '../../../store/slices/themeSlice';
import { DEMO_USERS, startDemoSession } from '../../../utils/demoAuth';
import MainLayout from '../MainLayout';
import { SidebarContent } from '../Sidebar';

// ---- controllable matchMedia (useMediaQuery depends on it) ----
let mobileMatches = false;
window.matchMedia = vi.fn().mockImplementation((query) => ({
  get matches() {
    return mobileMatches && /max-width/.test(query);
  },
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
}));

// Renders the current route so we can assert navigation happened
const LocationProbe = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

const renderLayout = (initialPath = '/dashboard') => {
  return render(
    <Provider store={store}>
      <ThemeProvider theme={createAppTheme('light')}>
        <MemoryRouter initialEntries={[initialPath]}>
          <MainLayout>
            <LocationProbe />
          </MainLayout>
        </MemoryRouter>
      </ThemeProvider>
    </Provider>
  );
};

const loginAs = (role) => {
  const session = startDemoSession(role);
  store.dispatch(loginSuccess(session));
};

describe('navigation system', () => {
  beforeEach(() => {
    localStorage.clear();
    mobileMatches = false;
    store.dispatch(logout());
    store.dispatch(setSidebarOpen(true));
    store.dispatch(setMobileSidebarOpen(false));
  });

  // ---------- Desktop sidebar ----------

  it('renders desktop sidebar links and navigates on click', () => {
    loginAs('admin');
    renderLayout('/dashboard');

    // Sidebar link exists and navigation works
    const sidebar = document.querySelector('.MuiDrawer-paper');
    expect(sidebar).toBeTruthy();

    const customersLink = within(sidebar).getByText('Customers');
    fireEvent.click(customersLink);
    expect(screen.getByTestId('location').textContent).toBe('/customers');

    const analyticsLink = within(sidebar).getByText('Analytics');
    fireEvent.click(analyticsLink);
    expect(screen.getByTestId('location').textContent).toBe('/analytics');
  });

  it('shows all sections for admin, filters for viewer (RBAC)', () => {
    loginAs('admin');
    const { unmount } = renderLayout('/dashboard');
    const sidebar = document.querySelector('.MuiDrawer-paper');
    expect(within(sidebar).getByText('Admin')).toBeInTheDocument();
    expect(within(sidebar).getByText('Developers')).toBeInTheDocument();
    expect(within(sidebar).getByText('Billing')).toBeInTheDocument();
    unmount();

    loginAs('viewer');
    renderLayout('/dashboard');
    const viewerSidebar = document.querySelector('.MuiDrawer-paper');
    expect(within(viewerSidebar).queryByText('Admin')).not.toBeInTheDocument();
    expect(within(viewerSidebar).queryByText('Developers')).not.toBeInTheDocument();
    // Viewer keeps core pages
    expect(within(viewerSidebar).getByText('Dashboard')).toBeInTheDocument();
    expect(within(viewerSidebar).getByText('Customers')).toBeInTheDocument();
  });

  it('filters admin-only items for manager but shows billing', () => {
    loginAs('manager');
    renderLayout('/dashboard');
    const sidebar = document.querySelector('.MuiDrawer-paper');
    expect(within(sidebar).queryByText('Admin')).not.toBeInTheDocument();
    expect(within(sidebar).getByText('Billing')).toBeInTheDocument();
    expect(within(sidebar).getByText('Collaboration')).toBeInTheDocument();
  });

  it('collapses and expands via the toggle button', () => {
    loginAs('admin');
    renderLayout('/dashboard');
    expect(store.getState().theme.sidebarOpen).toBe(true);

    // The collapse chevron lives in the sidebar header
    const sidebar = document.querySelector('.MuiDrawer-paper');
    const buttons = within(sidebar).getAllByRole('button');
    fireEvent.click(buttons[0]); // first button is the collapse toggle
    expect(store.getState().theme.sidebarOpen).toBe(false);
    fireEvent.click(within(document.querySelector('.MuiDrawer-paper')).getAllByRole('button')[0]);
    expect(store.getState().theme.sidebarOpen).toBe(true);
  });

  // ---------- Mobile drawer nav ----------

  it('opens the mobile drawer from the hamburger and navigates + closes', () => {
    mobileMatches = true;
    loginAs('admin');
    renderLayout('/dashboard');

    // Hamburger in the app bar
    const hamburger = screen.getByTestId('nav-toggle');
    fireEvent.click(hamburger);
    expect(store.getState().theme.mobileSidebarOpen).toBe(true);

    // Drawer content must contain nav links (regression: nested-Drawer bug)
    const drawer = document.querySelector('.MuiDrawer-paper');
    expect(drawer).toBeTruthy();
    const chatLink = within(drawer).getByText('Team Chat');
    fireEvent.click(chatLink);

    // Navigated and auto-closed the drawer
    expect(screen.getByTestId('location').textContent).toBe('/chat');
    expect(store.getState().theme.mobileSidebarOpen).toBe(false);
  });

  it('mobile drawer navigates to every visible item', () => {
    mobileMatches = true;
    loginAs('admin');
    renderLayout('/dashboard');
    fireEvent.click(screen.getByTestId('nav-toggle'));

    const drawer = document.querySelector('.MuiDrawer-paper');
    for (const [label, path] of [
      ['Dashboard', '/dashboard'],
      ['Customers', '/customers'],
      ['Analytics', '/analytics'],
      ['Reports', '/reports'],
      ['Collaboration', '/team'],
      ['AI Assistant', '/ai'],
      ['Billing', '/billing'],
      ['Developers', '/developers'],
      ['Admin', '/admin'],
      ['Profile', '/profile'],
      ['Settings', '/settings'],
    ]) {
      fireEvent.click(within(drawer).getByText(label));
      expect(screen.getByTestId('location').textContent).toBe(path);
      // re-open the drawer (clicking an item closes it)
      if (path !== '/settings') fireEvent.click(screen.getByTestId('nav-toggle'));
    }
  });

  it('collapsible sections toggle without breaking navigation', async () => {
    loginAs('admin');
    renderLayout('/dashboard');
    const sidebar = document.querySelector('.MuiDrawer-paper');

    // Collapse "Workspace" section (Collapse animates out before unmounting)
    fireEvent.click(within(sidebar).getByText('Workspace'));
    await waitFor(() => expect(within(sidebar).queryByText('Customers')).not.toBeInTheDocument());

    // Expand again
    fireEvent.click(within(sidebar).getByText('Workspace'));
    await waitFor(() => expect(within(sidebar).getByText('Customers')).toBeInTheDocument());
    fireEvent.click(within(sidebar).getByText('Customers'));
    expect(screen.getByTestId('location').textContent).toBe('/customers');
  });

  // ---------- SidebarContent in isolation (used by mobile drawer) ----------

  it('SidebarContent renders standalone (no nested Drawer) and reports navigation', () => {
    loginAs('admin');
    const onNavigate = vi.fn();
    render(
      <Provider store={store}>
        <ThemeProvider theme={createAppTheme('light')}>
          <MemoryRouter initialEntries={['/dashboard']}>
            <SidebarContent isOpen onNavigate={onNavigate} />
            <LocationProbe />
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    // No Drawer wrapper inside SidebarContent itself
    expect(document.querySelector('.MuiDrawer-paper')).toBeNull();

    fireEvent.click(screen.getByText('Reports'));
    expect(onNavigate).toHaveBeenCalled();
    expect(screen.getByTestId('location').textContent).toBe('/reports');
  });
});
