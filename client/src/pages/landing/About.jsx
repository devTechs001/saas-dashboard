import React from 'react';
import {
  Box, Typography, Stack, Grid, Container, Chip, Card, CardContent, Button, Avatar, useTheme,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunchOutlined';
import VisibilityIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteIcon from '@mui/icons-material/FavoriteBorderOutlined';
import PublicIcon from '@mui/icons-material/PublicOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { LandingNav, Footer } from '../../components/layout';
import { GradientText, KpiCard } from '../../components/ui';
import { DEMO_AVAILABLE } from '../../config/env';
// Sample dataset: dev builds only. Vite replaces DEMO_AVAILABLE with a
// literal, so the whole `mock*` import is tree-shaken out of production.
import { statsBar } from '../../data/marketing';
import { teamMembers as mockTeamMembers } from '../../data/sampleData';
// Sample team members — dev only. Production stats are left blank and filled
// by the landing-page metrics (see `stats` below).
const teamMembers = DEMO_AVAILABLE ? mockTeamMembers : [];

const VALUES = [
  { icon: <RocketLaunchIcon fontSize="large" />, title: 'Ship with conviction', desc: 'We bias toward action, measure everything, and iterate relentlessly. Small teams with sharp focus beat big teams with big plans.' },
  { icon: <VisibilityIcon fontSize="large" />, title: 'Default to transparency', desc: 'Roadmaps, metrics, and decisions are open to every teammate. Trust compounds when information flows freely.' },
  { icon: <FavoriteIcon fontSize="large" />, title: 'Customers are co-builders', desc: 'Every feature starts as a customer problem. We build with our users, not just for them.' },
  { icon: <PublicIcon fontSize="large" />, title: 'Global by design', desc: 'We are a remote-first team across four continents. Diversity of perspective is our unfair advantage.' },
];

const About = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <LandingNav />

      {/* Header */}
      <Box sx={{
        pt: { xs: 14, md: 17 }, pb: { xs: 5, md: 7 }, px: 2,
        background: theme.palette.mode === 'dark'
          ? 'radial-gradient(900px 420px at 50% -10%, rgba(16,185,129,0.16), transparent 65%)'
          : 'radial-gradient(900px 420px at 50% -10%, rgba(16,185,129,0.1), transparent 65%)',
      }}>
        <Container maxWidth="md">
          <Stack alignItems="center" spacing={2.5}>
            <Chip label="OUR STORY" color="primary" variant="outlined" sx={{ fontWeight: 700, borderRadius: 3 }} />
            <Typography variant="h1" align="center" sx={{ fontSize: { xs: '2.25rem', md: '3.35rem' }, lineHeight: 1.1 }}>
              We're building the platform <GradientText>we always wanted</GradientText>
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" sx={{ maxWidth: 660, fontWeight: 400, lineHeight: 1.75 }}>
              Nexus started in 2023 when three operators got tired of switching between six dashboards
              to answer one question. Today, 4,200+ teams run their entire operation on our platform.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* Team image + stats */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Box sx={{
          borderRadius: 5, overflow: 'hidden', border: '1px solid', borderColor: 'divider',
          boxShadow: '0 30px 70px rgba(15,23,42,0.18)',
        }}>
          <Box
            component="img"
            src={new URL('../../assets/about-team.png', import.meta.url).href}
            alt="The Nexus team collaborating"
            sx={{ width: '100%', display: 'block', maxHeight: 480, objectFit: 'cover' }}
          />
        </Box>
        <Grid container spacing={2.5} sx={{ mt: 1 }}>
          {statsBar.map((s) => (
            <Grid item xs={6} md={3} key={s.label}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent>
                  <Typography variant="h4" fontWeight={800} color="primary.main">{s.value}</Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>{s.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Values */}
      <Box sx={{ py: { xs: 5, md: 8 }, px: 2, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" spacing={2} sx={{ mb: 5 }}>
            <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={2}>OUR VALUES</Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.85rem', md: '2.45rem' } }}>
              The principles behind <GradientText>every decision</GradientText>
            </Typography>
          </Stack>
          <Grid container spacing={3}>
            {VALUES.map((v, i) => (
              <Grid item xs={12} sm={6} key={v.title}>
                <Box sx={{ p: 3.5, borderRadius: 4, height: '100%', border: '1px solid', borderColor: 'divider', bgcolor: 'background.default', display: 'flex', gap: 2.5 }}>
                  <Box sx={{
                    width: 56, height: 56, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    background: `linear-gradient(135deg, ${['#EEF2FF', '#ECFDF5', '#FFF7ED', '#F5F3FF'][i % 4]}, transparent)`,
                    color: ['#4F46E5', '#059669', '#EA580C', '#7C3AED'][i % 4],
                  }}>
                    {v.icon}
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>{v.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>{v.desc}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Team */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Stack alignItems="center" spacing={2} sx={{ mb: 5 }}>
          <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={2}>LEADERSHIP</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.85rem', md: '2.45rem' } }}>
            The humans of <GradientText>Nexus</GradientText>
          </Typography>
        </Stack>
        <Grid container spacing={3} justifyContent="center">
          {teamMembers.slice(0, 4).map((m) => (
            <Grid item xs={12} sm={6} md={3} key={m.id}>
              <Card sx={{ textAlign: 'center', height: '100%' }}>
                <CardContent sx={{ p: 3.5 }}>
                  <Avatar sx={{ width: 84, height: 84, mx: 'auto', mb: 2, bgcolor: '#6366F1', fontSize: '1.7rem', fontWeight: 800 }}>
                    {m.name.split(' ').map((p) => p[0]).join('')}
                  </Avatar>
                  <Typography variant="h6" fontWeight={700}>{m.name}</Typography>
                  <Typography variant="body2" color="primary.main" fontWeight={600}>{m.title}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>{m.location}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 9 }, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontSize: { xs: '1.85rem', md: '2.5rem' } }}>
          Come build with us
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2, fontWeight: 400, maxWidth: 560, mx: 'auto' }}>
          Whether you want to join the team or join the platform — we'd love to hear from you.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/register')} sx={{ px: 4, py: 1.5, borderRadius: 3 }}>
            Get started
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate('/contact')} sx={{ px: 4, py: 1.5, borderRadius: 3 }}>
            Contact us
          </Button>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
};

export default About;
