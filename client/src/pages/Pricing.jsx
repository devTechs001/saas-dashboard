import React from 'react';
import {
  Box, Typography, Stack, Grid, Container, Chip, Card, CardContent, Button, Switch,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, useTheme,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { LandingNav, Footer } from '../components/layout';
import { GradientText } from '../components/ui';
import { plans } from '../data/marketing';

const COMPARISON = [
  { feature: 'Team members', starter: '5', pro: '25', business: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Events / month', starter: '10k', pro: '250k', business: '2M', enterprise: 'Unlimited' },
  { feature: 'Dashboards', starter: true, pro: true, business: true, enterprise: true },
  { feature: 'Advanced analytics & funnels', starter: false, pro: true, business: true, enterprise: true },
  { feature: 'AI insights & anomaly alerts', starter: false, pro: 'Basic', business: true, enterprise: true },
  { feature: 'Scheduled reports', starter: false, pro: true, business: true, enterprise: true },
  { feature: 'SSO (SAML / OIDC)', starter: false, pro: false, business: true, enterprise: true },
  { feature: 'Audit logs', starter: false, pro: false, business: true, enterprise: true },
  { feature: 'Custom SLAs & contracts', starter: false, pro: false, business: false, enterprise: true },
  { feature: 'Dedicated CSM', starter: false, pro: false, business: true, enterprise: true },
];

const CellValue = ({ v }) =>
  v === true ? <CheckIcon sx={{ color: 'success.main', fontSize: 20 }} />
    : v === false ? <CloseIcon sx={{ color: 'text.disabled', fontSize: 18 }} />
      : <Typography variant="body2" fontWeight={600}>{v}</Typography>;

const Pricing = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [annual, setAnnual] = React.useState(true);

  return (
    <Box sx={{ bgcolor: 'background.default' }}>
      <LandingNav />

      {/* Header */}
      <Box sx={{
        pt: { xs: 14, md: 17 }, pb: { xs: 4, md: 6 }, px: 2,
        background: theme.palette.mode === 'dark'
          ? 'radial-gradient(900px 420px at 50% -10%, rgba(245,158,11,0.14), transparent 65%)'
          : 'radial-gradient(900px 420px at 50% -10%, rgba(245,158,11,0.1), transparent 65%)',
      }}>
        <Container maxWidth="md">
          <Stack alignItems="center" spacing={2.5}>
            <Chip label="PRICING" color="primary" variant="outlined" sx={{ fontWeight: 700, borderRadius: 3 }} />
            <Typography variant="h1" align="center" sx={{ fontSize: { xs: '2.25rem', md: '3.35rem' }, lineHeight: 1.12 }}>
              Simple, transparent <GradientText>pricing</GradientText>
            </Typography>
            <Typography variant="h6" align="center" color="text.secondary" sx={{ maxWidth: 560, fontWeight: 400, lineHeight: 1.75 }}>
              Start free for 14 days. Upgrade, downgrade, or cancel whenever you want.
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1 }}>
              <Typography fontWeight={700} color={!annual ? 'primary.main' : 'text.secondary'}>Monthly</Typography>
              <Switch checked={annual} onChange={(e) => setAnnual(e.target.checked)} color="primary" />
              <Typography fontWeight={700} color={annual ? 'primary.main' : 'text.secondary'}>Annual</Typography>
              <Chip size="small" label="Save 20%" color="success" sx={{ fontWeight: 700 }} />
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Plans */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 7 } }}>
        <Grid container spacing={3} alignItems="stretch">
          {plans.map((p) => {
            const price = typeof p.price === 'number' ? (annual ? Math.round(p.price * 0.8) : p.price) : p.price;
            return (
              <Grid item xs={12} sm={6} md={3} key={p.id}>
                <Card sx={{
                  height: '100%', position: 'relative',
                  border: p.current ? '2px solid' : '1px solid',
                  borderColor: p.current ? 'primary.main' : 'divider',
                  display: 'flex', flexDirection: 'column',
                }}>
                  {p.id === 'pro' && (
                    <Chip label="MOST POPULAR" color="primary" size="small" sx={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', fontWeight: 800, zIndex: 1 }} />
                  )}
                  <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <Typography variant="h6" fontWeight={800}>{p.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ minHeight: 32 }}>{p.tagline}</Typography>
                    <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ my: 2 }}>
                      <Typography variant="h3" fontWeight={800}>
                        {typeof price === 'number' ? `$${price}` : price}
                      </Typography>
                      {typeof price === 'number' && <Typography variant="body2" color="text.secondary">/ mo{annual ? ', billed yearly' : ''}</Typography>}
                    </Stack>
                    <Stack spacing={1} sx={{ mb: 2.5, flex: 1 }}>
                      {p.features.map((f) => (
                        <Stack key={f} direction="row" spacing={1} alignItems="flex-start">
                          <CheckIcon sx={{ fontSize: 17, color: 'success.main', mt: 0.25 }} />
                          <Typography variant="body2">{f}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                    <Button
                      fullWidth
                      variant={p.current ? 'outlined' : 'contained'}
                      onClick={() => navigate(p.id === 'enterprise' ? '/contact' : '/register')}
                      sx={{ borderRadius: 2.5 }}
                    >
                      {p.current ? 'Your current plan' : p.id === 'enterprise' ? 'Contact sales' : 'Start free trial'}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

      {/* Comparison table */}
      <Box sx={{ py: { xs: 4, md: 7 }, px: 2, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Stack alignItems="center" spacing={2} sx={{ mb: 4 }}>
            <Typography variant="h2" sx={{ fontSize: { xs: '1.8rem', md: '2.3rem' } }}>Compare plans</Typography>
            <Typography variant="body1" color="text.secondary">Every detail, side by side.</Typography>
          </Stack>
          <TableContainer component={Paper} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'auto' }}>
            <Table sx={{ minWidth: 720 }}>
              <TableHead>
                <TableRow sx={{ '& th': { fontWeight: 800, fontSize: 14, bgcolor: 'action.hover' } }}>
                  <TableCell>Feature</TableCell>
                  <TableCell align="center">Starter</TableCell>
                  <TableCell align="center">Pro</TableCell>
                  <TableCell align="center">Business</TableCell>
                  <TableCell align="center">Enterprise</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {COMPARISON.map((row) => (
                  <TableRow key={row.feature} hover>
                    <TableCell sx={{ fontWeight: 600 }}>{row.feature}</TableCell>
                    <TableCell align="center"><CellValue v={row.starter} /></TableCell>
                    <TableCell align="center"><CellValue v={row.pro} /></TableCell>
                    <TableCell align="center"><CellValue v={row.business} /></TableCell>
                    <TableCell align="center"><CellValue v={row.enterprise} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>

      {/* CTA */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 }, textAlign: 'center' }}>
        <Typography variant="h2" sx={{ fontSize: { xs: '1.85rem', md: '2.5rem' } }}>
          Try Nexus free for 14 days
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2, fontWeight: 400, maxWidth: 520, mx: 'auto' }}>
          Full access to every feature. No credit card required.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <Button variant="contained" size="large" component={Link} to="/register" sx={{ px: 4, py: 1.5, borderRadius: 3 }}>
            Start your trial
          </Button>
          <Button variant="outlined" size="large" component={Link} to="/contact" sx={{ px: 4, py: 1.5, borderRadius: 3 }}>
            Talk to sales
          </Button>
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
};

export default Pricing;
