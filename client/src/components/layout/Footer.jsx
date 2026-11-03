import React from 'react';
import { Box, Typography, Stack, Link as MLink, Divider, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunchOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';

const COLUMNS = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/features' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Analytics', to: '/analytics' },
      { label: 'AI Assistant', to: '/ai' },
      { label: 'Integrations', to: '/settings' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About us', to: '/about' },
      { label: 'Careers', to: '/about' },
      { label: 'Blog', to: '/features' },
      { label: 'Press kit', to: '/about' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Documentation', to: '/developers' },
      { label: 'API reference', to: '/developers' },
      { label: 'Community', to: '/contact' },
      { label: 'Status', to: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', to: '/contact' },
      { label: 'Terms of service', to: '/contact' },
      { label: 'Security', to: '/about' },
      { label: 'DPA', to: '/contact' },
    ],
  },
];

const Footer = ({ compact = false }) => (
  <Box component="footer" sx={{ mt: compact ? 4 : 0, pt: compact ? 3 : 8, pb: 4, px: { xs: 2, md: 6 }, bgcolor: compact ? 'transparent' : 'background.paper', borderTop: compact ? '1px solid' : 'none', borderColor: 'divider' }}>
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      spacing={{ xs: 4, md: 8 }}
      justifyContent="space-between"
      sx={{ maxWidth: 1280, mx: 'auto' }}
    >
      <Box sx={{ maxWidth: 320 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box sx={{
            width: 38, height: 38, borderRadius: 2.25, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)', color: '#fff',
          }}>
            <RocketLaunchIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} lineHeight={1.1}>Nexus</Typography>
            <Typography variant="caption" color="text.secondary">SaaS Platform</Typography>
          </Box>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, lineHeight: 1.7 }}>
          The analytics, CRM, and collaboration platform for modern software teams.
          Ship decisions faster with real-time data and AI-assisted insights.
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mt: 2.5 }}>
          {[GitHubIcon, TwitterIcon, LinkedInIcon].map((Icon, i) => (
            <Box key={i} component="a" href="#" sx={{
              width: 36, height: 36, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: 'action.hover', color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'action.selected' },
            }}>
              <Icon fontSize="small" />
            </Box>
          ))}
        </Stack>
      </Box>

      <Stack direction="row" spacing={{ xs: 4, sm: 6, md: 8 }} flexWrap="wrap" useFlexGap>
        {COLUMNS.map((col) => (
          <Box key={col.title}>
            <Typography variant="overline" fontWeight={800} color="text.primary" sx={{ letterSpacing: 1 }}>{col.title}</Typography>
            <Stack spacing={1.25} sx={{ mt: 1.5 }}>
              {col.links.map((l) => (
                <MLink
                  key={l.label}
                  component={Link}
                  to={l.to}
                  underline="none"
                  variant="body2"
                  color="text.secondary"
                  sx={{ '&:hover': { color: 'primary.main' } }}
                >
                  {l.label}
                </MLink>
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Stack>

    <Divider sx={{ maxWidth: 1280, mx: 'auto', mt: 6, mb: 3 }} />

    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      justifyContent="space-between"
      alignItems="center"
      sx={{ maxWidth: 1280, mx: 'auto' }}
    >
      <Typography variant="caption" color="text.secondary">
        © {new Date().getFullYear()} Nexus SaaS Platform. All rights reserved.
      </Typography>
      <Chip
        size="small"
        icon={<CheckCircleIcon sx={{ fontSize: '16px !important', color: 'success.main !important' }} />}
        label="All systems operational"
        variant="outlined"
        sx={{ color: 'text.secondary', borderColor: 'divider' }}
      />
    </Stack>
  </Box>
);

export default Footer;
