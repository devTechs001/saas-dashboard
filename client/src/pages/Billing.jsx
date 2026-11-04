import React from 'react';
import {
  Box, Typography, Grid, Stack, Chip, Card, CardContent, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Switch, List, ListItem, ListItemIcon,
  ListItemText, Divider, Alert,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CreditCardIcon from '@mui/icons-material/CreditCardOutlined';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import UpgradeIcon from '@mui/icons-material/UpgradeOutlined';
import ReceiptIcon from '@mui/icons-material/ReceiptOutlined';
import { useSelector } from 'react-redux';
import {
  PageHeader, SectionCard, KpiCard, StatusChip, ProgressBar,
} from '../components/ui';
import { BarTrendChart } from '../components/charts';
import { plans as mockPlans, invoices as mockInvoices, usage, revenueSeries } from '../data/mockData';
import { subscriptionService } from '../services';
import { formatCurrency, formatDate } from '../utils/format';
import { can, PERMISSIONS } from '../utils/rbac';
import toast from 'react-hot-toast';

const Billing = () => {
  const user = useSelector((state) => state.auth.user);
  const manage = can(user, PERMISSIONS.BILLING_MANAGE);
  const [annual, setAnnual] = React.useState(true);

  // Real subscription data (falls back to demo data when the API is down).
  const [planList, setPlanList] = React.useState(mockPlans);
  const [invoiceList, setInvoiceList] = React.useState(mockInvoices);
  const [currentSub, setCurrentSub] = React.useState(null);
  const [notice, setNotice] = React.useState(null);
  const [busy, setBusy] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const [p, c, i] = await Promise.all([
        subscriptionService.getPlans(),
        subscriptionService.getCurrent(),
        subscriptionService.getInvoices(),
      ]);
      if (p?.data?.plans?.length) setPlanList(p.data.plans);
      setCurrentSub(c?.data?.subscription || null);
      if (i?.data?.invoices?.length) setInvoiceList(i.data.invoices);
    } catch {
      /* API unreachable — keep demo data */
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const handleSwitchPlan = async (planId) => {
    if (planId === 'enterprise') {
      toast('Enterprise is handled by sales — contact us for a custom contract', { icon: '📞' });
      return;
    }
    setBusy(true);
    try {
      await subscriptionService.subscribe({ planId, seats: currentSub?.seats || undefined });
      setNotice({ type: 'success', text: 'Subscription updated — an invoice was generated' });
      await load();
    } catch (e) {
      setNotice({ type: 'error', text: e?.response?.data?.message || 'Could not update subscription' });
    }
    setBusy(false);
  };

  const handleCancel = async () => {
    setBusy(true);
    try {
      await subscriptionService.cancel(false);
      setNotice({ type: 'warning', text: 'Subscription will cancel at the end of the billing period' });
      await load();
    } catch (e) {
      setNotice({ type: 'error', text: e?.response?.data?.message || 'Could not cancel subscription' });
    }
    setBusy(false);
  };

  const currentPlan = currentSub ? planList.find((p) => p.id === currentSub.planId) : null;
  const displayPlan = currentPlan || { name: 'Enterprise', price: 2400, features: ['Unlimited events', 'Custom SLA', 'Dedicated CSM'] };
  const renewsOn = currentSub?.currentPeriodEnd || '2026-12-01';
  const monthlyCost = currentPlan ? currentPlan.price * (currentSub?.seats || 1) : 2400;
  const activePlanId = currentSub?.planId || null;

  return (
    <Box>
      <PageHeader
        title="Billing & Plan"
        subtitle="Manage your subscription, payment methods, and usage."
        actions={[
          manage
            ? <Button key="upgrade" variant="contained" startIcon={<UpgradeIcon />} sx={{ borderRadius: 2.5 }}>Change plan</Button>
            : <Chip key="view" label="View only — ask an admin to make changes" variant="outlined" />,
        ]}
      />

      {notice && (
        <Alert severity={notice.type} sx={{ mb: 2.5, borderRadius: 2.5 }} onClose={() => setNotice(null)}>
          {notice.text}
        </Alert>
      )}

      {/* Current plan banner */}
      <Box sx={{
        p: { xs: 2.5, md: 3.5 }, borderRadius: 3.5, mb: 2.5,
        background: 'linear-gradient(120deg, #4F46E5 0%, #7C3AED 60%, #A78BFA 100%)',
        color: '#fff',
      }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ md: 'center' }}>
          <Box>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Typography variant="h4" fontWeight={800}>{displayPlan.name}</Typography>
              <Chip label={currentSub?.cancelAtPeriodEnd ? 'CANCELS AT PERIOD END' : 'CURRENT PLAN'} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.22)', color: '#fff', fontWeight: 800, letterSpacing: 0.5 }} />
            </Stack>
            <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.75 }}>
              {(displayPlan.features || []).slice(0, 3).join(' · ')} · Renews on {formatDate(renewsOn)}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>Monthly cost</Typography>
              <Typography variant="h4" fontWeight={800}>{formatCurrency(monthlyCost)}</Typography>
            </Box>
            {manage && currentSub && !currentSub.cancelAtPeriodEnd && (
              <Button
                variant="outlined"
                onClick={handleCancel}
                disabled={busy}
                sx={{ borderColor: 'rgba(255,255,255,0.6)', color: '#fff', fontWeight: 700, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.12)' } }}
              >
                Cancel
              </Button>
            )}
            <Button variant="contained" sx={{ bgcolor: '#fff', color: '#4F46E5', fontWeight: 700, '&:hover': { bgcolor: '#EEF2FF' } }} disabled={!manage}>
              Manage
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Usage + payment */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <SectionCard title="Usage this billing period" subtitle="Nov 1 – Nov 30, 2026">
            {usage.map((u) => (
              <ProgressBar
                key={u.label}
                label={u.label}
                current={u.used}
                target={typeof u.quota === 'number' ? u.quota : 1}
                unit=""
                color={typeof u.quota === 'number' && u.used / u.quota > 0.85 ? 'warning' : 'primary'}
              />
            ))}
            {typeof usage[0].quota === 'number' && (
              <Typography variant="caption" color="text.secondary">
                Quotas reset monthly. Need more capacity? Talk to your CSM about add-on packs.
              </Typography>
            )}
          </SectionCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <SectionCard title="Payment method" subtitle="Default card on file">
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.75, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ width: 52, height: 34, borderRadius: 1.5, background: 'linear-gradient(135deg, #1e3a8a, #2563EB)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, letterSpacing: 1 }}>
                VISA
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight={700}>•••• •••• •••• 4242</Typography>
                <Typography variant="caption" color="text.secondary">Expires 08 / 2028</Typography>
              </Box>
              {manage && <Button size="small" variant="outlined" sx={{ borderRadius: 2 }}>Update</Button>}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1.5} alignItems="center">
              <CreditCardIcon color="action" />
              <Box>
                <Typography variant="body2" fontWeight={600}>Billing email</Typography>
                <Typography variant="caption" color="text.secondary">finance@nexus.io</Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 1.75 }}>
              <ReceiptIcon color="action" />
              <Box>
                <Typography variant="body2" fontWeight={600}>Tax ID</Typography>
                <Typography variant="caption" color="text.secondary">VAT · KE-1284-9920</Typography>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Spend trend */}
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <SectionCard title="Spend & growth" subtitle="Your subscription vs your MRR growth, last 12 months">
            <BarTrendChart
              data={revenueSeries.map((r) => ({ month: r.month, spend: 2400, revenue: r.revenue / 10 }))}
              xKey="month"
              height={250}
              series={[
                { key: 'revenue', name: 'Your MRR (scaled)', color: '#4F46E5' },
                { key: 'spend', name: 'Nexus spend', color: '#F59E0B' },
              ]}
              formatValue={(v) => formatCurrency(v)}
            />
          </SectionCard>
        </Grid>
      </Grid>

      {/* Plans */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3.5, mb: 1.5 }}>
        <Typography variant="h5" fontWeight={800}>Available plans</Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" fontWeight={700} color="text.secondary">Annual</Typography>
          <Switch checked={annual} onChange={(e) => setAnnual(e.target.checked)} size="small" />
          <Chip size="small" label="Save 20%" color="success" />
        </Stack>
      </Stack>
      <Grid container spacing={2.5}>
        {planList.map((p) => {
          const isCurrent = activePlanId === p.id;
          return (
          <Grid item xs={12} sm={6} md={3} key={p.id}>
            <Card sx={{ height: '100%', border: isCurrent ? '2px solid' : '1px solid', borderColor: isCurrent ? 'primary.main' : 'divider', position: 'relative' }}>
              {isCurrent && <Chip label="CURRENT" size="small" color="primary" sx={{ position: 'absolute', top: -12, left: 16, fontWeight: 800, zIndex: 1 }} />}
              <CardContent>
                <Typography variant="h6" fontWeight={800}>{p.name}</Typography>
                <Typography variant="caption" color="text.secondary">{p.tagline}</Typography>
                <Stack direction="row" alignItems="baseline" spacing={0.5} sx={{ my: 1.5 }}>
                  <Typography variant="h4" fontWeight={800}>
                    {typeof p.price === 'number' ? `$${annual ? Math.round(p.price * 0.8) : p.price}` : p.price}
                  </Typography>
                  {typeof p.price === 'number' && <Typography variant="caption" color="text.secondary">/ mo</Typography>}
                </Stack>
                <List dense disablePadding sx={{ mb: 1.5 }}>
                  {p.features.slice(0, 4).map((f) => (
                    <ListItem key={f} disablePadding sx={{ py: 0.35 }}>
                      <ListItemIcon sx={{ minWidth: 26 }}><CheckIcon fontSize="small" color="success" /></ListItemIcon>
                      <ListItemText primary={f} primaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }} />
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth size="small" variant={isCurrent ? 'outlined' : 'contained'}
                  disabled={isCurrent || !manage || busy} onClick={() => handleSwitchPlan(p.id)} sx={{ borderRadius: 2.5 }}
                >
                  {isCurrent ? 'Current plan' : p.id === 'enterprise' ? 'Contact sales' : activePlanId ? 'Switch plan' : 'Subscribe'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
          );
        })}
      </Grid>

      {/* Invoices */}
      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12}>
          <SectionCard title="Invoice history" subtitle="Download past invoices for your records" contentSx={{ pt: 1 }}>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Invoice</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Period</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Amount</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Receipt</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoiceList.map((inv) => (
                    <TableRow key={inv.id} hover>
                      <TableCell><Typography variant="body2" fontWeight={700}>#{inv.id}</Typography></TableCell>
                      <TableCell>{inv.period || (inv.seats ? `${inv.seats} seats` : '—')}</TableCell>
                      <TableCell>{formatDate(inv.date)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatCurrency(inv.amount)}</TableCell>
                      <TableCell align="center"><StatusChip status={inv.status} /></TableCell>
                      <TableCell align="right">
                        <Button size="small" startIcon={<DownloadIcon fontSize="small" />} sx={{ borderRadius: 2 }}>PDF</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Billing;
