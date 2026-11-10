import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';

import store from './store';
import { createAppTheme } from './theme';
import { useRealtime } from './hooks/useRealtime';

// Static core (loading UX must not depend on a network chunk)
import { Splash, LoadingSpinner } from './components/common';
import { MainLayout } from './components/layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { PERMISSIONS } from './utils/rbac';

// Lazily loaded SPA pages — each route is its own chunk.
const LandingHome = lazy(() => import('./pages/landing/Home'));
const Features = lazy(() => import('./pages/landing/Features'));
const About = lazy(() => import('./pages/landing/About'));
const Contact = lazy(() => import('./pages/landing/Contact'));
const Pricing = lazy(() => import('./pages/Pricing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Customers = lazy(() => import('./pages/Customers'));
const Analytics = lazy(() => import('./pages/Analytics'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const Billing = lazy(() => import('./pages/Billing'));
const Admin = lazy(() => import('./pages/Admin'));
const Developers = lazy(() => import('./pages/Developers'));
const Team = lazy(() => import('./pages/Team'));
const Chat = lazy(() => import('./pages/Chat'));
const AIAssistant = lazy(() => import('./pages/AIAssistant'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Onboarding = lazy(() => import('./pages/onboarding/Onboarding'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Resolves 'system' theme mode against the OS preference.
const useResolvedMode = (mode) => {
  const [systemDark, setSystemDark] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  );

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return mode === 'system' ? (systemDark ? 'dark' : 'light') : mode;
};

const PageFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <LoadingSpinner size={54} message="Loading…" />
  </div>
);

// Splash Screen Wrapper - rendered inside providers
function SplashWrapper({ onComplete }) {
  const mode = useSelector((state) => state.theme.mode);
  const resolved = useResolvedMode(mode);
  return <Splash duration={2500} onComplete={onComplete} mode={resolved} />;
}

// Wraps a protected page in the app shell (sidebar + header + footer)
function AppShell({ children, roles, permission }) {
  return (
    <ProtectedRoute roles={roles} permission={permission}>
      <MainLayout>
        <Suspense fallback={<PageFallback />}>{children}</Suspense>
      </MainLayout>
    </ProtectedRoute>
  );
}

// Inner component that uses Redux hooks. Rendered *inside* QueryClientProvider
// so hooks like useRealtime() can access the client on every render.
function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const mode = useSelector((state) => state.theme.mode);
  const accent = useSelector((state) => state.theme.accent);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    localStorage.getItem('onboardingCompleted') === 'true'
  );

  const resolvedMode = useResolvedMode(mode);
  const muiTheme = createAppTheme(resolvedMode, accent);

  // Realtime sync: notifications + dashboard/customer refresh + sounds.
  // Safe here: AppContent is always rendered under QueryClientProvider.
  const isLive = useRealtime();

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
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <Toaster position="top-right" />
      <BrowserRouter>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* ============ Public / Landing (SPA routes, lazy chunks) ============ */}
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
                    <Suspense fallback={<PageFallback />}>
                      <Onboarding onComplete={handleOnboardingComplete} />
                    </Suspense>
                  ) : (
                    <MainLayout>
                      <Suspense fallback={<PageFallback />}>
                        <Dashboard isLive={isLive} />
                      </Suspense>
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
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
