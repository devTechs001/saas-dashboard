import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunchOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * Last-resort UI safety net: if any component throws during render, users see
 * a styled recovery screen (with the error in dev) instead of a blank page.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // eslint-disable-next-line no-console
    console.error('App render error:', error, info?.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          bgcolor: 'background.default',
          background: 'radial-gradient(900px 420px at 50% 20%, rgba(220,38,38,0.12), transparent 65%)',
        }}
      >
        <Stack alignItems="center" spacing={2.5} sx={{ textAlign: 'center', maxWidth: 560 }}>
          <Box
            sx={{
              width: 84, height: 84, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #FEE2E2, transparent)', color: '#DC2626',
            }}
          >
            <RocketLaunchIcon sx={{ fontSize: 42 }} />
          </Box>
          <Typography variant="h3" fontWeight={800}>Something went wrong</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
            The app hit an unexpected error while rendering. Your data is safe —
            reloading usually fixes it. If it keeps happening, send us the details below.
          </Typography>
          {import.meta.env.DEV && (
            <Typography
              variant="caption"
              sx={{
                display: 'block', p: 1.5, borderRadius: 2, width: '100%',
                bgcolor: 'action.hover', fontFamily: 'ui-monospace, monospace',
                overflowWrap: 'anywhere', textAlign: 'left',
              }}
            >
              {String(error?.message || error)}
            </Typography>
          )}
          <Button
            variant="contained"
            size="large"
            startIcon={<RefreshIcon />}
            onClick={() => window.location.reload()}
            sx={{ borderRadius: 3, px: 4 }}
          >
            Reload the app
          </Button>
        </Stack>
      </Box>
    );
  }
}

export default ErrorBoundary;
