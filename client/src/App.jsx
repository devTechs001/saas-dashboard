import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider, useSelector } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';

import store from './store';

// Splash Screen
import { Splash } from './components/common';

// Landing Pages
import LandingHome from './pages/landing/Home';
import Features from './pages/landing/Features';
import About from './pages/landing/About';
import Contact from './pages/landing/Contact';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';

// Dashboard Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';

// Onboarding
import Onboarding from './pages/onboarding/Onboarding';

// Layout
import { MainLayout } from './components/layout';

// Auth Guard
import ProtectedRoute from './components/auth/ProtectedRoute';

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

// Inner component that uses Redux hooks
function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const mode = useSelector((state) => state.theme.mode);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    localStorage.getItem('onboardingCompleted') === 'true'
  );

  const muiTheme = createTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: 'none',
          },
        },
      },
    },
  });

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
            {/* Landing Pages */}
            <Route path="/" element={<LandingHome />} />
            <Route path="/features" element={<Features />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Auth Pages */}
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} />

            {/* Onboarding */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Onboarding />
                </ProtectedRoute>
              }
            />

            {/* Dashboard Pages */}
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
            <Route
              path="/customers"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Customers />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Analytics />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Reports />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Settings />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <Profile />
                  </MainLayout>
                </ProtectedRoute>
              }
            />

            {/* Redirects */}
            <Route path="*" element={<Navigate to="/" replace />} />
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
