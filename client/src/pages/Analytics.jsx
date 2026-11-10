import React from 'react';
import {
  Box, Typography, Grid, Stack, Chip, Tabs, Tab, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, LinearProgress, MenuItem, TextField,
} from '@mui/material';
import {
  PageHeader, SectionCard, KpiCard,
} from '../components/ui';
import {
  AreaTrendChart, DonutChart, BarTrendChart, FunnelBars, RadialGauge, HorizontalBarList,
} from '../components/charts';
import { DEMO_AVAILABLE } from '../config/env';
import { useDashboardStats, useDeviceBreakdown, useTopPages } from '../hooks/useAnalytics';
// Sample dataset: dev builds only. Vite replaces DEMO_AVAILABLE with a
// literal, so the whole `mock*` import is tree-shaken out of production.
import { kpis as mockKpis, trafficSeries as mockTrafficSeries, deviceBreakdown as mockDeviceBreakdown, trafficSources as mockTrafficSources, revenueByPlan as mockRevenueByPlan, funnel as mockFunnel, cohort as mockCohort, topPages as mockTopPages, revenueSeries as mockRevenueSeries } from '../data/sampleData';
const trafficSeries = DEMO_AVAILABLE ? mockTrafficSeries : [];
const deviceBreakdown = DEMO_AVAILABLE ? mockDeviceBreakdown : [];
const trafficSources = DEMO_AVAILABLE ? mockTrafficSources : [];
const revenueByPlan = DEMO_AVAILABLE ? mockRevenueByPlan : [];
const funnel = DEMO_AVAILABLE ? mockFunnel : [];
const cohort = DEMO_AVAILABLE ? mockCohort : [];
const topPages = DEMO_AVAILABLE ? mockTopPages : [];
const revenueSeries = DEMO_AVAILABLE ? mockRevenueSeries : [];
const kpis = DEMO_AVAILABLE ? mockKpis : {};
// Secondary headline numbers for the sample dashboard — dev only.
const demoKpis = DEMO_AVAILABLE
  ? { uniqueVisitors: 116200, avgSession: '4m 12s', revenuePerUser: 3.38, sessionsLabel: '312k' }
  : {};
import { formatCurrency, formatCompact, formatNumber } from '../utils/format';

const TabPanel = ({ value, index, children }) => (
  <Box hidden={value !== index} sx={{ pt: 2.5 }}>{value === index && children}</Box>
);

const retentionColor = (v) => {
  if (v === 0) return 'transparent';
  const a = Math.max(0.08, v / 130);
  return `rgba(79,70,229,${a})`;
};

const Analytics = () => {
  const [tab, setTab] = React.useState(0);
  const [range, setRange] = React.useState('30');
  const rangeParams = React.useMemo(() => {
    const end = new Date();
    const start = new Date(end.getTime() - (Number(range) - 1) * 86400000);
    return { startDate: start.toISOString(), endDate: end.toISOString() };
  }, [range]);

  // Real metrics for the selected range. Production shows an em dash while
  // loading or when the workspace has no analytics yet.
  const { data: stats } = useDashboardStats(rangeParams);
  const { data: devices } = useDeviceBreakdown(rangeParams);
  const { data: remoteTopPages } = useTopPages(10);
  const totals = stats?.totals;

  const kpiValues = totals
    ? {
        revenue: totals.revenue,
        uniqueVisitors: totals.uniqueVisitors,
        avgSession: totals.avgSessionDuration ? `${Math.floor(totals.avgSessionDuration / 60)}m ${Math.round(totals.avgSessionDuration % 60)}s` : '—',
        revenuePerUser: totals.uniqueVisitors ? totals.revenue / totals.uniqueVisitors : 0,
      }
    : null;

  const trafficData = (stats?.chartData || []).length
    ? stats.chartData.map((d) => ({
        date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        visitors: d.uniqueVisitors,
        pageViews: d.pageViews,
      }))
    : trafficSeries;

  const deviceData = devices
    ? [
        { name: 'Desktop', value: Math.round(devices.desktop.percentage), color: '#4F46E5' },
        { name: 'Mobile', value: Math.round(devices.mobile.percentage), color: '#8B5CF6' },
        { name: 'Tablet', value: Math.round(devices.tablet.percentage), color: '#0EA5E9' },
      ].filter((d) => d.value > 0)
    : deviceBreakdown;

  // Top pages: API rows carry { path, views } only — enrich with sample columns
  // (avg time / bounce) in dev builds, leave them blank in production.
  const topPagesData = remoteTopPages?.length
    ? remoteTopPages.map((p) => ({ ...p, avgTime: '—', bounce: null }))
    : topPages;

  const sessionsLabel = totals?.sessions ? formatCompact(totals.sessions) : (demoKpis.sessionsLabel || '—');

  return (
    <Box>
      <PageHeader
        title="Analytics"
        subtitle="Understand acquisition, activation, and revenue in one place."
        actions={[
          <TextField key="range" select size="small" value={range} onChange={(e) => setRange(e.target.value)} sx={{ minWidth: 160, borderRadius: 2 }}>
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 90 days</MenuItem>
            <MenuItem value="365">Last 12 months</MenuItem>
          </TextField>,
          <Chip key="live" label="● Live" color="success" variant="outlined" sx={{ fontWeight: 700 }} />,
        ]}
      />

      {/* Top KPIs */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Total revenue" value={kpiValues ? formatCurrency(kpiValues.revenue) : (revenueSeries.length ? formatCurrency(revenueSeries[revenueSeries.length - 1].revenue) : '—')} delta={stats?.growth?.revenue ?? 12.4} hint="vs previous period" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Unique visitors" value={kpiValues ? formatCompact(kpiValues.uniqueVisitors) : (demoKpis.uniqueVisitors ? formatCompact(demoKpis.uniqueVisitors) : '—')} delta={stats?.growth?.uniqueVisitors ?? 9.2} hint="vs previous period" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Avg. session" value={kpiValues ? kpiValues.avgSession : (demoKpis.avgSession || '—')} delta={3.8} hint="vs previous period" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Revenue per visitor" value={kpiValues ? formatCurrency(kpiValues.revenuePerUser, 'USD', 2) : (demoKpis.revenuePerUser ? formatCurrency(demoKpis.revenuePerUser, 'USD', 2) : '—')} delta={-1.4} hint="vs previous period" />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ mt: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Overview" />
          <Tab label="Funnels & cohorts" />
          <Tab label="Audience" />
          <Tab label="Revenue" />
        </Tabs>
      </Box>

      {/* ===== Overview ===== */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={8}>
            <SectionCard title="Traffic trend" subtitle="Visitors and page views, last 30 days">
              <AreaTrendChart
                data={trafficData}
                xKey="date"
                height={300}
                series={[
                  { key: 'visitors', name: 'Visitors', color: '#4F46E5' },
                  { key: 'pageViews', name: 'Page views', color: '#0EA5E9' },
                ]}
                formatValue={(v) => formatCompact(v)}
              />
            </SectionCard>
          </Grid>
          <Grid item xs={12} lg={4}>
            <SectionCard title="Device breakdown" subtitle="Share of sessions">
              <DonutChart data={deviceData} centerValue={sessionsLabel} centerLabel="sessions" height={250} innerRadius={64} />
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Traffic sources" subtitle="Where your visitors come from">
              <HorizontalBarList data={trafficSources} height={280} formatValue={(v) => formatCompact(v)} />
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Top pages" subtitle="Most visited content">
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Page</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Views</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Avg. time</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Bounce</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {topPagesData.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                          No page data for this period yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {topPagesData.map((p) => (
                      <TableRow key={p.path} hover>
                        <TableCell><Typography variant="body2" fontWeight={600}>{p.path}</Typography></TableCell>
                        <TableCell align="right">{formatNumber(p.views)}</TableCell>
                        <TableCell align="right">{p.avgTime}</TableCell>
                        <TableCell align="right">
                          {p.bounce == null
                            ? <Typography variant="body2" color="text.secondary">—</Typography>
                            : <Chip size="small" label={`${p.bounce}%`} color={p.bounce > 35 ? 'warning' : 'default'} variant={p.bounce > 35 ? 'filled' : 'outlined'} />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ===== Funnels & cohorts ===== */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <SectionCard title="Conversion funnel" subtitle="Visitor → renewed, current quarter">
              <FunnelBars data={funnel} />
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Activation health" subtitle="Share of signups reaching key milestones">
              <Grid container spacing={2} sx={{ pt: 1 }}>
                <Grid item xs={6}><RadialGauge value={72} label="Connected data" color="#4F46E5" /></Grid>
                <Grid item xs={6}><RadialGauge value={58} label="Invited team" color="#0EA5E9" /></Grid>
                <Grid item xs={6}><RadialGauge value={41} label="First report" color="#34D399" /></Grid>
                <Grid item xs={6}><RadialGauge value={86} label="Week-1 retention" color="#F59E0B" /></Grid>
              </Grid>
            </SectionCard>
          </Grid>
          <Grid item xs={12}>
            <SectionCard title="Cohort retention" subtitle="Percentage of each signup cohort still active after N months">
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Cohort</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Size</TableCell>
                      {[0, 1, 2, 3, 4, 5].map((m) => (
                        <TableCell key={m} align="center" sx={{ fontWeight: 700 }}>M{m}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {cohort.map((c) => (
                      <TableRow key={c.cohort} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{c.cohort} 2026</TableCell>
                        <TableCell align="center">{c.size}</TableCell>
                        {c.retention.map((v, i) => (
                          <TableCell key={i} align="center" sx={{ bgcolor: retentionColor(v), color: v > 55 ? '#fff' : 'text.primary', fontWeight: v ? 700 : 400 }}>
                            {v ? `${v}%` : '—'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ===== Audience ===== */}
      <TabPanel value={tab} index={2}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <SectionCard title="Visitors & signups" subtitle="Daily, last 30 days">
              <AreaTrendChart
                data={trafficData}
                xKey="date"
                height={300}
                series={[
                  { key: 'visitors', name: 'Visitors', color: '#4F46E5' },
                  { key: 'signups', name: 'Signups', color: '#34D399' },
                ]}
                formatValue={(v) => formatCompact(v)}
              />
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="New vs returning" subtitle="Share of sessions">
              <DonutChart
                data={[
                  { name: 'New visitors', value: 62, color: '#4F46E5' },
                  { name: 'Returning', value: 38, color: '#0EA5E9' },
                ]}
                centerValue="62%"
                centerLabel="new"
                height={300}
                innerRadius={72}
              />
            </SectionCard>
          </Grid>
          <Grid item xs={12}>
            <SectionCard title="Engagement by segment" subtitle="Average session duration (minutes)">
              <BarTrendChart
                data={[
                  { segment: 'Enterprise', minutes: 8.2 },
                  { segment: 'Business', minutes: 6.4 },
                  { segment: 'Pro', minutes: 4.9 },
                  { segment: 'Starter', minutes: 3.1 },
                  { segment: 'Trial', minutes: 2.2 },
                ]}
                xKey="segment"
                height={280}
                series={[{ key: 'minutes', name: 'Avg. minutes', color: '#7C3AED' }]}
              />
            </SectionCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ===== Revenue ===== */}
      <TabPanel value={tab} index={3}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={8}>
            <SectionCard title="Monthly recurring revenue" subtitle="MRR with subscription count">
              <AreaTrendChart
                data={revenueSeries}
                xKey="month"
                height={300}
                series={[
                  { key: 'revenue', name: 'MRR', color: '#4F46E5' },
                  { key: 'expenses', name: 'Expenses', color: '#F43F5E' },
                ]}
                formatValue={(v) => formatCompact(v)}
              />
            </SectionCard>
          </Grid>
          <Grid item xs={12} lg={4}>
            <SectionCard title="Revenue by plan" subtitle="Current month">
              <DonutChart data={revenueByPlan} height={300} innerRadius={70} centerValue={kpiValues ? formatCurrency(kpiValues.revenue) : (kpis.mrr ? formatCurrency(kpis.mrr.value) : '—')} centerLabel="total revenue" />
            </SectionCard>
          </Grid>
          <Grid item xs={12}>
            <SectionCard title="Subscriptions growth" subtitle="Active subscriptions, last 12 months">
              <BarTrendChart
                data={revenueSeries}
                xKey="month"
                height={280}
                series={[{ key: 'subscriptions', name: 'Subscriptions', color: '#0EA5E9' }]}
                formatValue={(v) => formatCompact(v)}
              />
            </SectionCard>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default Analytics;
