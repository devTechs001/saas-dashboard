import React from 'react';
import { Box, Typography, Stack, useTheme, Chip, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunchOutlined';
import CheckIcon from '@mui/icons-material/Check';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMode } from '../../store/slices/themeSlice';

const BULLETS = [
  'Real-time analytics with AI-powered insights',
  'CRM, billing, and collaboration in one place',
  'Enterprise-grade security & role-based access',
];

const AuthLayout = ({ title, subtitle, children, footer }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const mode = useSelector((state) => state.theme.mode);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Form side */}
      <Box sx={{ flex: { xs: 1, md: '0 0 52%' }, display: 'flex', flexDirection: 'column', px: { xs: 2.5, sm: 6 }, py: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack component={Link} to="/" direction="row" spacing={1.25} alignItems="center" sx={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{
              width: 40, height: 40, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', color: '#fff',
            }}>
              <RocketLaunchIcon sx={{ fontSize: 21 }} />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800} lineHeight={1.1}>Nexus</Typography>
              <Typography variant="caption" color="text.secondary" lineHeight={1}>SaaS Platform</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              size="small"
              color="inherit"
              startIcon={mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
              onClick={() => dispatch(toggleMode())}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              {mode === 'dark' ? 'Light' : 'Dark'}
            </Button>
            <Button component={Link} to="/" size="small" startIcon={<ArrowBackIcon />} color="inherit">
              Home
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 460, width: '100%', mx: 'auto', py: 4 }}>
          <Typography variant="h3" fontWeight={800} sx={{ fontSize: { xs: '1.85rem', md: '2.25rem' }, letterSpacing: '-0.02em' }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1.25, lineHeight: 1.75 }}>
              {subtitle}
            </Typography>
          )}
          <Box sx={{ mt: 3.5 }}>{children}</Box>
          {footer && <Box sx={{ mt: 3 }}>{footer}</Box>}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', pb: 1 }}>
          © {new Date().getFullYear()} Nexus SaaS Platform · Privacy · Terms
        </Typography>
      </Box>

      {/* Visual side */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: `linear-gradient(160deg, rgba(49,46,129,0.88), rgba(79,70,229,0.78)), url(${new URL('../../assets/auth-visual.png', import.meta.url).href})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#fff',
          px: 6,
        }}
      >
        <Box sx={{ maxWidth: 480 }}>
          <Chip label="TRUSTED BY 4,200+ TEAMS" sx={{ bgcolor: 'rgba(255,255,255,0.16)', color: '#fff', fontWeight: 700, borderRadius: 2, mb: 3 }} />
          <Typography variant="h3" sx={{ fontWeight: 800, lineHeight: 1.25, letterSpacing: '-0.02em' }}>
            “We replaced four tools with Nexus. The AI churn alerts alone paid for the subscription.”
          </Typography>
          <Typography variant="body1" sx={{ mt: 2.5, opacity: 0.85, fontWeight: 600 }}>
            Sofia Alvarez — VP Revenue Ops, Helios Retail
          </Typography>
          <Stack spacing={1.5} sx={{ mt: 5 }}>
            {BULLETS.map((b) => (
              <Stack key={b} direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckIcon sx={{ fontSize: 15 }} />
                </Box>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>{b}</Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
