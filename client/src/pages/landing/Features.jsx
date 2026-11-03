import React from 'react';
import {
  Box, Typography, Stack, Grid, Container, Chip, Card, CardContent, Button, useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import InsightsIcon from '@mui/icons-material/InsightsOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeOutlined';
import PeopleAltIcon from '@mui/icons-material/PeopleAltOutlined';
import GroupWorkIcon from '@mui/icons-material/GroupWorkOutlined';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import SecurityIcon from '@mui/icons-material/SecurityOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCardOutlined';
import CodeIcon from '@mui/icons-material/CodeOutlined';
import PaletteIcon from '@mui/icons-material/PaletteOutlined';
import BoltIcon from '@mui/icons-material/BoltOutlined';
import LockIcon from '@mui/icons-material/LockOutlined';
import SpeedIcon from '@mui/icons-material/SpeedOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { LandingNav, Footer } from '../../components/layout';
import { GradientText } from '../../components/ui';
import { featureCards } from '../../data/mockData';

const ICON_MAP = {
  analytics: <InsightsIcon fontSize="large" />,
  ai: <AutoAwesomeIcon fontSize="large" />,
  crm: <PeopleAltIcon fontSize="large" />,
  team: <GroupWorkIcon fontSize="large" />,
  reports: <DescriptionIcon fontSize="large" />,
  shield: <SecurityIcon fontSize="large" />,
  billing: <CreditCardIcon fontSize="large" />,
  code: <CodeIcon fontSize="large" />,
  theme: <PaletteIcon fontSize="large" />,
};

const HIGHLIGHTS = [
  { icon: <BoltIcon />, title: 'Blazing performance', desc: 'A Rust-powered edge gateway and pre-aggregated metrics keep every dashboard under one second, even at millions of events per day.' },
  { icon: <LockIcon />, title: 'Secure by default', desc: 'Multi-tenant isolation at every layer, role-based access control, SSO, audit trails, and SOC 2-ready controls out of the box.' },
  { icon: <SpeedIcon />, title: 'Built to scale', desc: 'Microservices architecture with event-driven workflows. From ten users to ten thousand, Nexus grows without breaking a sweat.' },
];

const Features = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <LandingNav />

      {/* Header */}
      <Box sx={{
        pt: { xs: 14, md: 17 }, pb: { xs: 5, md: 7 }, px: 2,
        background: theme.palette.mode === 'dark'
          ? 'radial-gradient(900px 420px at 50% -10%, rgba(99,102,241,0.2), transparent 65%)'
          : 'radial-gradient(900px 420px at 50% -10%, rgba(99,102,241,0.1), transparent 65%)',
      }}>
        <Container maxWidth="md">
          <Stack alignItems="center" spacing={2.5}>
            <Chip label="PLATFORM FEATURES" color="primary" variant="outlined" sx={{ fontWeight: 700, borderRadius: 3 }} />
            <Typography variant="h1" align="center" sx={{ fontSize: { xs: '2.25rem', md: '3.35rem' }, lineHeight: 1.1 }}>
              Everything your team needs, <GradientText>nothing it doesn't</GradientText>
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" sx={{ maxWidth: 640, fontWeight: 400, lineHeight: 1.75 }}>
              Each module is powerful on its own and unstoppable together. Pick what you need today —
              flip on the rest whenever you're ready.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Feature grid */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Grid container spacing={3}>
          {featureCards.map((f, i) => (
            <Grid item xs={12} sm={6} md={4} key={f.title}>
              <Card sx={{ height: '100%', transition: '0.25s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 18px 40px rgba(79,70,229,0.16)' } }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Box sx={{
                    width: 58, height: 58, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.25,
                    background: `linear-gradient(135deg, ${['#EEF2FF', '#E0F2FE', '#ECFDF5', '#FFF7ED', '#FEF2F2', '#F5F3FF'][i % 6]}, transparent)`,
                    color: ['#4F46E5', '#0284C7', '#059669', '#EA580C', '#DC2626', '#7C3AED'][i % 6],
                  }}>
                    {ICON_MAP[f.icon]}
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.75 }}>{f.desc}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Highlights */}
      <Box sx={{ py: { xs: 5, md: 8 }, px: 2, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" spacing={2} sx={{ mb: 5 }}>
            <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={2}>WHY NEXUS</Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.85rem', md: '2.45rem' }, textAlign: 'center' }}>
              Enterprise-grade, <GradientText>startup-simple</GradientText>
            </Typography>
          </Stack>
          <Grid container spacing={3}>
            {HIGHLIGHTS.map((h) => (
              <Grid item xs={12} md={4} key={h.title}>
                <Box sx={{ p: 3.5, borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'divider', bgcolor: 'background.default' }}>
                  <Box sx={{
                    width: 52, height: 52, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: 'primary.main', color: '#fff', mb: 2,
                  }}>
                    {h.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>{h.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>{h.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 9 }, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontSize: { xs: '1.85rem', md: '2.5rem' } }}>
          See every feature <GradientText>in action</GradientText>
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2, fontWeight: 400, maxWidth: 560, mx: 'auto' }}>
          Spin up a fully-loaded demo workspace in under a minute — no setup, no credit card.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/register')} sx={{ px: 4, py: 1.5, borderRadius: 3 }}>
            Start free
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate('/contact')} sx={{ px: 4, py: 1.5, borderRadius: 3 }}>
            Book a demo
          </Button>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
};

export default Features;
