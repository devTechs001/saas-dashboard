import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';

import store from './store';
import { createAppTheme } from './theme';

// Splash Screen
import { Splash } from './components/common';

// Public pages
import LandingHome from './pages/landing/Home';
import Features from './pages/landing/Features';
import About from './pages/landing/About';
import Contact from './pages/landing/Contact';
import Pricing from './pages/Pricing';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// App pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Billing from './pages/Billing';
import Admin from './pages/Admin';
import Developers from './pages/Developers';
import Team from './pages/Team';
import Chat from './pages/Chat';
import AIAssistant from './pages/AIAssistant';
import NotFound from './pages/NotFound';

// Onboarding
import Onboarding from './pages/onboarding/Onboarding';

// Layout + guards
import { MainLayout } from './components/layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { PERMISSIONS } from './utils/rbac';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Splash Screen Wrapper - rendered inside providers
function SplashWrapper({ onComplete }) {
  const mode = useSelector((state) => state.theme.mode);
  return <Splash duration={2500} onComplete={onComplete} mode={mode} />;
}

// Wraps a protected page in the app shell (sidebar + header + footer)
function AppShell({ children, roles, permission }) {
  return (
    <ProtectedRoute roles={roles} permission={permission}>
      <MainLayout>{children}</MainLayout>
    </ProtectedRoute>
  );
}

// Inner component that uses Redux hooks
function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const mode = useSelector((state) => state.theme.mode);
  const accent = useSelector((state) => state.theme.accent);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    localStorage.getItem('onboardingCompleted') === 'true'
  );

  const muiTheme = createAppTheme(mode, accent);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('onboardingCompleted', 'true');
    setHasCompletedOnboarding(true);
  };

  if (showSplash) {
    return <SplashWrapper onComplete={handleSplashComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        <Toaster position="top-right" />
        <BrowserRouter>
          <Routes>
            {/* ============ Public / Landing ============ */}
            <Route path="/" element={<LandingHome />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* ============ Auth ============ */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* ============ Onboarding ============ */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding onComplete={handleOnboardingComplete} />
                </ProtectedRoute>
              }
            />

            {/* ============ App (protected, role-based) ============ */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {!hasCompletedOnboarding ? (
                    <Onboarding onComplete={handleOnboardingComplete} />
                  ) : (
                    <MainLayout>
                      <Dashboard />
                    </MainLayout>
                  )}
                </ProtectedRoute>
              }
            />
            <Route path="/customers" element={<AppShell permission={PERMISSIONS.CUSTOMERS_VIEW}><Customers /></AppShell>} />
            <Route path="/analytics" element={<AppShell permission={PERMISSIONS.ANALYTICS_VIEW}><Analytics /></AppShell>} />
            <Route path="/reports" element={<AppShell permission={PERMISSIONS.REPORTS_VIEW}><Reports /></AppShell>} />
            <Route path="/team" element={<AppShell permission={PERMISSIONS.TEAM_VIEW}><Team /></AppShell>} />
            <Route path="/chat" element={<AppShell permission={PERMISSIONS.CHAT_USE}><Chat /></AppShell>} />
            <Route path="/ai" element={<AppShell permission={PERMISSIONS.AI_USE}><AIAssistant /></AppShell>} />
            <Route path="/billing" element={<AppShell permission={PERMISSIONS.BILLING_VIEW}><Billing /></AppShell>} />
            <Route path="/developers" element={<AppShell permission={PERMISSIONS.DEVELOPERS_VIEW}><Developers /></AppShell>} />
            <Route path="/admin" element={<AppShell roles={['admin']}><Admin /></AppShell>} />
            <Route path="/settings" element={<AppShell permission={PERMISSIONS.SETTINGS_VIEW}><Settings /></AppShell>} />
            <Route path="/profile" element={<AppShell><Profile /></AppShell>} />

            {/* Legacy redirect */}
            <Route path="/users" element={<Navigate to="/admin" replace />} />

            {/* ============ 404 ============ */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
