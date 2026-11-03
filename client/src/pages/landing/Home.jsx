import React from 'react';
import {
  Box, Typography, Button, Stack, Grid, Card, CardContent, Container,
  Avatar, useTheme, Accordion, AccordionSummary, AccordionDetails, Chip, Rating,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import InsightsIcon from '@mui/icons-material/InsightsOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeOutlined';
import PeopleAltIcon from '@mui/icons-material/PeopleAltOutlined';
import GroupWorkIcon from '@mui/icons-material/GroupWorkOutlined';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import SecurityIcon from '@mui/icons-material/SecurityOutlined';
import CreditCardIcon from '@mui/icons-material/CreditCardOutlined';
import CodeIcon from '@mui/icons-material/CodeOutlined';
import PaletteIcon from '@mui/icons-material/PaletteOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { LandingNav, Footer } from '../../components/layout';
import { GradientText } from '../../components/ui';
import { featureCards, testimonials, clientLogos, statsBar, plans, faqs } from '../../data/mockData';

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

const HERO_IMAGE = '/images/hero-dashboard.png';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <LandingNav />

      {/* ============ HERO ============ */}
      <Box sx={{
        pt: { xs: 14, md: 18 }, pb: { xs: 6, md: 10 }, px: 2, position: 'relative', overflow: 'hidden',
        background: theme.palette.mode === 'dark'
          ? 'radial-gradient(1000px 500px at 70% -10%, rgba(99,102,241,0.22), transparent 60%)'
          : 'radial-gradient(1000px 500px at 70% -10%, rgba(99,102,241,0.12), transparent 60%)',
      }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" spacing={3}>
            <Chip
              icon={<AutoAwesomeIcon sx={{ fontSize: '16px !important' }} />}
              label="New — AI insights & anomaly detection are live"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600, borderRadius: 3, px: 1 }}
            />
            <Typography variant="h1" align="center" sx={{ fontSize: { xs: '2.35rem', sm: '3.25rem', md: '4.15rem' }, lineHeight: 1.06, maxWidth: 900 }}>
              Run your entire SaaS on{' '}
              <GradientText>one intelligent platform</GradientText>
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" sx={{ maxWidth: 660, fontWeight: 400, lineHeight: 1.7 }}>
              Analytics, CRM, billing, team collaboration, and an AI copilot — unified in a
              beautiful workspace your whole company will actually enjoy using.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ pt: 1 }}>
              <Button variant="contained" size="large" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/register')} sx={{ px: 4, py: 1.5, fontSize: '1.05rem', borderRadius: 3 }}>
                Start free trial
              </Button>
              <Button variant="outlined" size="large" onClick={() => navigate('/login')} sx={{ px: 4, py: 1.5, fontSize: '1.05rem', borderRadius: 3 }}>
                Explore live demo
              </Button>
            </Stack>
            <Typography variant="caption" color="text.secondary">
              Free 14-day trial · No credit card required · Cancel anytime
            </Typography>

            {/* Hero image */}
            <Box sx={{
              mt: 4, width: '100%', maxWidth: 1060, borderRadius: 5, overflow: 'hidden',
              border: '1px solid', borderColor: 'divider',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 40px 90px rgba(2,6,23,0.65)'
                : '0 40px 90px rgba(79,70,229,0.18)',
            }}>
              <Box component="img" src={HERO_IMAGE} alt="Nexus analytics dashboard preview" sx={{ width: '100%', display: 'block' }} />
            </Box>
          </Stack>
        </Container>
      </Box>

      {/* ============ LOGOS ============ */}
      <Box sx={{ py: 5, px: 2, borderTop: '1px solid', borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography variant="overline" color="text.secondary" sx={{ display: 'block', textAlign: 'center', letterSpacing: 2 }}>
            Trusted by high-growth teams worldwide
          </Typography>
          <Stack direction="row" spacing={{ xs: 3, md: 6 }} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mt: 3 }}>
            {clientLogos.map((name) => (
              <Typography key={name} variant="h6" color="text.disabled" sx={{ fontWeight: 800, letterSpacing: '-0.01em', opacity: 0.75 }}>
                {name}
              </Typography>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* ============ STATS ============ */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Grid container spacing={3}>
          {statsBar.map((s) => (
            <Grid item xs={6} md={3} key={s.label}>
              <Card sx={{ textAlign: 'center', py: 1 }}>
                <CardContent>
                  <Typography variant="h3" fontWeight={800} sx={{ background: 'linear-gradient(120deg, #6366F1, #A78BFA)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {s.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>{s.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* ============ FEATURES ============ */}
      <Box sx={{ py: { xs: 6, md: 9 }, px: 2, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" spacing={2} sx={{ mb: 6 }}>
            <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={2}>EVERYTHING YOU NEED</Typography>
            <Typography variant="h2" align="center" sx={{ fontSize: { xs: '1.9rem', md: '2.6rem' }, maxWidth: 720 }}>
              One platform. <GradientText>Every workflow.</GradientText>
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" sx={{ maxWidth: 620, fontWeight: 400 }}>
              Stop stitching together six tools. Nexus brings your data, customers, team, and revenue together.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {featureCards.map((f, i) => (
              <Grid item xs={12} sm={6} md={4} key={f.title}>
                <Card sx={{ height: '100%', transition: '0.25s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 18px 40px rgba(79,70,229,0.16)' } }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Box sx={{
                      width: 56, height: 56, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.25,
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
      </Box>

      {/* ============ AI HIGHLIGHT ============ */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Grid container spacing={5} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box sx={{
              borderRadius: 5, overflow: 'hidden', border: '1px solid', borderColor: 'divider',
              boxShadow: '0 30px 70px rgba(124,58,237,0.25)',
            }}>
              <Box sx={{
                height: { xs: 300, md: 420 },
                backgroundImage: `url(${new URL('../../assets/ai-visual.png', import.meta.url).href})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
              }} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Chip icon={<AutoAwesomeIcon sx={{ fontSize: '16px !important' }} />} label="AI POWERED" color="secondary" sx={{ fontWeight: 700, mb: 2 }} />
            <Typography variant="h2" sx={{ fontSize: { xs: '1.85rem', md: '2.45rem' }, lineHeight: 1.18 }}>
              Insights that find <GradientText>you</GradientText>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2, lineHeight: 1.85, fontSize: '1.05rem' }}>
              Nexus AI watches every metric around the clock. It flags churn risk before it happens,
              surfaces upsell moments, forecasts revenue, and answers questions in plain English —
              right inside your dashboard.
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 3 }}>
              {['Churn risk scoring with 87% precision', 'Natural-language queries across your data', 'Anomaly alerts delivered in real time'].map((t) => (
                <Stack key={t} direction="row" spacing={1.25} alignItems="center">
                  <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'secondary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckIcon sx={{ fontSize: 15 }} />
                  </Box>
                  <Typography variant="body1" fontWeight={600}>{t}</Typography>
                </Stack>
              ))}
            </Stack>
            <Button variant="contained" color="secondary" size="large" endIcon={<ArrowForwardIcon />} component={Link} to="/ai" sx={{ mt: 3.5, borderRadius: 3, px: 3.5 }}>
              Meet your AI copilot
            </Button>
          </Grid>
        </Grid>
      </Container>

      {/* ============ TESTIMONIALS ============ */}
      <Box sx={{ py: { xs: 6, md: 9 }, px: 2, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" spacing={2} sx={{ mb: 5 }}>
            <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={2}>CUSTOMER STORIES</Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.9rem', md: '2.5rem' }, textAlign: 'center' }}>
              Loved by teams who <GradientText>move fast</GradientText>
            </Typography>
          </Stack>
          <Grid container spacing={3}>
            {testimonials.map((t) => (
              <Grid item xs={12} md={4} key={t.name}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 3.5 }}>
                    <Rating value={5} readOnly size="small" sx={{ mb: 2, color: '#F59E0B' }} />
                    <Typography variant="body1" sx={{ lineHeight: 1.8, fontStyle: 'italic' }}>“{t.quote}”</Typography>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 3 }}>
                      <Avatar sx={{ bgcolor: '#6366F1', fontWeight: 700 }}>{t.name.charAt(0)}</Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>{t.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{t.role}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* ============ PRICING PREVIEW ============ */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Stack alignItems="center" spacing={2} sx={{ mb: 5 }}>
          <Typography variant="overline" color="primary" fontWeight={800} letterSpacing={2}>SIMPLE PRICING</Typography>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.9rem', md: '2.5rem' } }}>
            Plans that scale <GradientText>with you</GradientText>
          </Typography>
        </Stack>
        <Grid container spacing={3} alignItems="stretch">
          {plans.slice(0, 3).map((p) => (
            <Grid item xs={12} md={4} key={p.id}>
              <Card sx={{ height: '100%', position: 'relative', border: p.id === 'pro' ? '2px solid' : '1px solid', borderColor: p.id === 'pro' ? 'primary.main' : 'divider' }}>
                {p.id === 'pro' && (
                  <Chip label="MOST POPULAR" color="primary" size="small" sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontWeight: 800 }} />
                )}
                <CardContent sx={{ p: 3.5 }}>
                  <Typography variant="h6" fontWeight={800}>{p.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{p.tagline}</Typography>
                  <Stack direction="row" alignItems="baseline" spacing={0.5}>
                    <Typography variant="h3" fontWeight={800}>${p.price}</Typography>
                    <Typography variant="body2" color="text.secondary">/ {p.period}</Typography>
                  </Stack>
                  <Stack spacing={1} sx={{ my: 2.5 }}>
                    {p.features.slice(0, 4).map((f) => (
                      <Stack key={f} direction="row" spacing={1} alignItems="center">
                        <CheckIcon sx={{ fontSize: 17, color: 'success.main' }} />
                        <Typography variant="body2">{f}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                  <Button fullWidth variant={p.id === 'pro' ? 'contained' : 'outlined'} component={Link} to="/register" sx={{ borderRadius: 2.5 }}>
                    Get started
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
        <Stack alignItems="center" sx={{ mt: 3 }}>
          <Button endIcon={<ArrowForwardIcon />} component={Link} to="/pricing">Compare all plans</Button>
        </Stack>
      </Container>

      {/* ============ FAQ ============ */}
      <Box sx={{ py: { xs: 6, md: 9 }, px: 2, bgcolor: 'background.paper' }}>
        <Container maxWidth="md">
          <Stack alignItems="center" spacing={2} sx={{ mb: 4 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.3rem' } }}>Frequently asked questions</Typography>
            <Typography variant="body1" color="text.secondary">Everything you need to know about the platform.</Typography>
          </Stack>
          {faqs.map((f) => (
            <Accordion key={f.q} disableGutters sx={{ borderRadius: 3, mb: 1.5, border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={700}>{f.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>{f.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>

      {/* ============ CTA ============ */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 9 } }}>
        <Box sx={{
          borderRadius: 5, p: { xs: 4, md: 7 }, textAlign: 'center', color: '#fff',
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 55%, #A78BFA 100%)',
          boxShadow: '0 30px 80px rgba(99,102,241,0.4)',
        }}>
          <Typography variant="h2" sx={{ fontSize: { xs: '1.85rem', md: '2.6rem' }, fontWeight: 800 }}>
            Ready to unify your stack?
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mt: 1.5, fontWeight: 400, maxWidth: 640, mx: 'auto' }}>
            Join 4,200+ teams shipping faster with Nexus. Get started in minutes — free for 14 days.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            <Button size="large" variant="contained" onClick={() => navigate('/register')} sx={{ bgcolor: '#fff', color: '#4F46E5', fontWeight: 800, px: 4, py: 1.5, '&:hover': { bgcolor: '#EEF2FF' } }}>
              Start your free trial
            </Button>
            <Button size="large" variant="outlined" onClick={() => navigate('/contact')} sx={{ borderColor: 'rgba(255,255,255,0.65)', color: '#fff', px: 4, py: 1.5, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.12)' } }}>
              Talk to sales
            </Button>
          </Stack>
        </Box>
      </Container>

      <Footer />
    </Box>
  );
};

export default Home;
