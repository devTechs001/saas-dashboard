import React from 'react';
import {
  Box, Typography, Grid, Stack, Button, Chip, Avatar, List, ListItem,
  ListItemAvatar, ListItemText, IconButton, Tooltip, useTheme,
} from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoneyOutlined';
import GroupIcon from '@mui/icons-material/GroupOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUpOutlined';
import TrendingDownIcon from '@mui/icons-material/TrendingDownOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesomeOutlined';
import DescriptionIcon from '@mui/icons-material/DescriptionOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAddAltOutlined';
import RocketIcon from '@mui/icons-material/RocketLaunchOutlined';
import PaymentIcon from '@mui/icons-material/PaymentOutlined';
import InsightsIcon from '@mui/icons-material/InsightsOutlined';
import BoltIcon from '@mui/icons-material/BoltOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  PageHeader, SectionCard, KpiCard, ProgressBar, MetricDelta, AppAvatar, StatusChip, EmptyState,
} from '../components/ui';
import {
  AreaTrendChart, DonutChart, ComposedTrendChart, Sparkline, HorizontalBarList,
} from '../components/charts';
import {
  kpis, revenueSeries, deviceBreakdown, trafficSeries, trafficSources,
  activityFeed, goals, aiInsights,
} from '../data/mockData';
import { formatCurrency, formatCompact, formatRelative } from '../utils/format';
import { SafeText } from '../utils/safeText';

const ACTIVITY_ICONS = {
  deal: { icon: <AttachMoneyIcon fontSize="small" />, color: '#059669' },
  report: { icon: <DescriptionIcon fontSize="small" />, color: '#D97706' },
  user: { icon: <PersonAddIcon fontSize="small" />, color: '#2563EB' },
  ai: { icon: <AutoAwesomeIcon fontSize="small" />, color: '#7C3AED' },
  deploy: { icon: <RocketIcon fontSize="small" />, color: '#DB2777' },
  billing: { icon: <PaymentIcon fontSize="small" />, color: '#0EA5E9' },
};

const Dashboard = ({ isLive = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const user = useSelector((state) => state.auth.user);
  const firstName = (user?.name || 'there').split(' ')[0];

  return (
    <Box>
      <PageHeader
        title={`Welcome back, ${firstName} 👋`}
        subtitle="Here's what's happening across your workspace today."
        actions={[
          <Chip
            key="live"
            label={isLive ? '● Live sync' : '○ Offline'}
            color={isLive ? 'success' : 'default'}
            variant="outlined"
            sx={{ fontWeight: 700 }}
          />,
          <Button key="refresh" variant="outlined" startIcon={<RefreshIcon />} sx={{ borderRadius: 2.5 }}>Refresh</Button>,
          <Button key="report" variant="contained" startIcon={<DescriptionIcon />} onClick={() => navigate('/reports')} sx={{ borderRadius: 2.5 }}>
            New report
          </Button>,
        ]}
      />

      {/* AI insight banner */}
      <Box sx={{
        mb: 3, p: 2.5, borderRadius: 3,
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(120deg, rgba(124,58,237,0.22), rgba(79,70,229,0.14))'
          : 'linear-gradient(120deg, rgba(124,58,237,0.10), rgba(79,70,229,0.06))',
        border: '1px solid', borderColor: theme.palette.mode === 'dark' ? 'rgba(167,139,250,0.35)' : 'rgba(124,58,237,0.25)',
      }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
          <Stack direction="row" spacing={1.75} alignItems="center">
            <Box sx={{
              width: 46, height: 46, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, #7C3AED, #6366F1)', color: '#fff', flexShrink: 0,
            }}>
              <AutoAwesomeIcon />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>
                AI insight — {aiInsights[0].title}
              </Typography>
              <Typography variant="body2" color="text.secondary">{aiInsights[0].detail}</Typography>
            </Box>
          </Stack>
          <Button variant="contained" color="secondary" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/ai')} sx={{ whiteSpace: 'nowrap', borderRadius: 2.5 }}>
            View insights
          </Button>
        </Stack>
      </Box>

      {/* KPI cards */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Monthly recurring revenue" value={formatCurrency(kpis.mrr.value)} delta={kpis.mrr.delta} icon={<AttachMoneyIcon />} color="#059669" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Active users" value={formatCompact(kpis.activeUsers.value)} delta={kpis.activeUsers.delta} icon={<GroupIcon />} color="#2563EB" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Conversion rate" value={`${kpis.conversion.value}%`} delta={kpis.conversion.delta} icon={<TrendingUpIcon />} color="#7C3AED" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Churn rate" value={`${kpis.churn.value}%`} delta={kpis.churn.delta} icon={<TrendingDownIcon />} color="#E11D48" />
        </Grid>
      </Grid>

      {/* Main charts row */}
      <Grid container spacing={2.5} sx={{ mt: 0 }}>
        <Grid item xs={12} lg={8}>
          <SectionCard
            title="Revenue overview"
            subtitle="Monthly revenue vs operating expenses"
            action={<Chip size="small" label="Last 12 months" variant="outlined" />}
          >
            <ComposedTrendChart data={revenueSeries} formatValue={(v) => formatCompact(v)} />
          </SectionCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <SectionCard title="Traffic by device" subtitle="Sessions, last 30 days">
            <DonutChart
              data={deviceBreakdown}
              centerValue="312k"
              centerLabel="sessions"
              innerRadius={62}
              height={240}
            />
          </SectionCard>
        </Grid>
      </Grid>

      {/* Secondary row: visitors + goals + quick actions */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <SectionCard title="Visitors & signups" subtitle="Daily trend, last 30 days">
            <AreaTrendChart
              data={trafficSeries}
              xKey="date"
              height={260}
              series={[
                { key: 'visitors', name: 'Visitors', color: '#4F46E5' },
                { key: 'signups', name: 'Signups', color: '#34D399' },
              ]}
              formatValue={(v) => formatCompact(v)}
            />
          </SectionCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <SectionCard title="Quarter goals" subtitle="Q4 2026 progress">
            {goals.map((g) => (
              <ProgressBar key={g.label} label={g.label} current={g.current} target={g.target} unit={g.unit === '$' ? '$' : ''} />
            ))}
            <Button fullWidth variant="outlined" size="small" onClick={() => navigate('/analytics')} sx={{ mt: 1, borderRadius: 2.5 }}>
              Open analytics
            </Button>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Bottom row: activity + traffic sources + top customers sparkline */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6} lg={4}>
          <SectionCard title="Recent activity" subtitle="Across your workspace" contentSx={{ pt: 1 }}>
            <List disablePadding>
              {activityFeed.slice(0, 5).map((a) => {
                const t = ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.billing;
                return (
                  <ListItem key={a.id} disablePadding sx={{ py: 0.75 }}>
                    <ListItemAvatar sx={{ minWidth: 46 }}>
                      <Avatar sx={{ width: 36, height: 36, bgcolor: `${t.color}1A`, color: t.color }}>
                        {t.icon}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2"><b>{a.actor}</b> <SafeText text={a.text} /></Typography>
                      }
                      secondary={formatRelative(a.time)}
                      secondaryTypographyProps={{ fontSize: 11 }}
                    />
                  </ListItem>
                );
              })}
            </List>
            <Button fullWidth variant="text" size="small" endIcon={<ArrowForwardIcon />} onClick={() => navigate('/team')} sx={{ mt: 1 }}>
              View all activity
            </Button>
          </SectionCard>
        </Grid>

        <Grid item xs={12} md={6} lg={4}>
          <SectionCard title="Traffic sources" subtitle="Sessions by acquisition channel">
            <HorizontalBarList data={trafficSources} height={252} formatValue={(v) => formatCompact(v)} />
          </SectionCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <SectionCard title="MRR momentum" subtitle="Trailing 12 months">
            <Box sx={{ px: 1, pt: 1 }}>
              <Typography variant="h3" fontWeight={800}>{formatCurrency(kpis.mrr.value)}</Typography>
              <MetricDelta value={kpis.mrr.delta} />
            </Box>
            <Sparkline
              data={revenueSeries.map((r) => ({ value: r.revenue }))}
              height={92}
              color="#4F46E5"
            />
            <Stack direction="row" justifyContent="space-between" sx={{ px: 1, pb: 1 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">ARR</Typography>
                <Typography variant="subtitle2" fontWeight={800}>{formatCurrency(kpis.arr.value)}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">NPS</Typography>
                <Typography variant="subtitle2" fontWeight={800}>{kpis.nps.value}</Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">Net retention</Typography>
                <Typography variant="subtitle2" fontWeight={800}>118%</Typography>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
