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
import {
  kpis, trafficSeries, deviceBreakdown, trafficSources, revenueByPlan,
  funnel, cohort, topPages, revenueSeries,
} from '../data/mockData';
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
          <KpiCard label="Total revenue" value={formatCurrency(revenueSeries[11].revenue)} delta={12.4} hint="vs previous month" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Unique visitors" value={formatCompact(116200)} delta={9.2} hint="vs previous month" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Avg. session" value="4m 12s" delta={3.8} hint="vs previous month" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Revenue per user" value={formatCurrency(3.38, 'USD', 2)} delta={-1.4} hint="vs previous month" />
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
                data={trafficSeries}
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
              <DonutChart data={deviceBreakdown} centerValue="312k" centerLabel="sessions" height={250} innerRadius={64} />
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
                    {topPages.map((p) => (
                      <TableRow key={p.path} hover>
                        <TableCell><Typography variant="body2" fontWeight={600}>{p.path}</Typography></TableCell>
                        <TableCell align="right">{formatNumber(p.views)}</TableCell>
                        <TableCell align="right">{p.avgTime}</TableCell>
                        <TableCell align="right">
                          <Chip size="small" label={`${p.bounce}%`} color={p.bounce > 35 ? 'warning' : 'default'} variant={p.bounce > 35 ? 'filled' : 'outlined'} />
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
                data={trafficSeries}
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
              <DonutChart data={revenueByPlan} height={300} innerRadius={70} centerValue={formatCurrency(84230)} centerLabel="total MRR" />
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
