import React from 'react';
import {
  Box, Typography, Grid, Stack, Chip, List, ListItem, ListItemIcon, ListItemText,
  Alert, LinearProgress, Divider, Button,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/GroupOutlined';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import WarningIcon from '@mui/icons-material/WarningAmberOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import HistoryIcon from '@mui/icons-material/HistoryOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useSelector } from 'react-redux';
import { PageHeader, SectionCard, KpiCard, AppAvatar, StatusChip, EmptyState } from '../components/ui';
import { BarTrendChart, DonutChart } from '../components/charts';
import { workspaceService } from '../services';
import { formatRelative, formatDate, formatNumber } from '../utils/format';

const STATUS_LABELS = { todo: 'To do', in_progress: 'In progress', review: 'In review', done: 'Done' };
const STATUS_COLORS = { todo: '#64748B', in_progress: '#2563EB', review: '#D97706', done: '#059669' };

/**
 * Pure aggregation across workspaces — exported for unit tests.
 * membersByWs / tasksByWs / activityByWs are maps: workspaceId -> array.
 */
export const aggregateManagerData = (workspaces = [], membersByWs = {}, tasksByWs = {}, activityByWs = {}) => {
  const memberMap = new Map();
  for (const ws of workspaces) {
    for (const m of membersByWs[ws.id] || []) {
      const prev = memberMap.get(m.userId);
      memberMap.set(m.userId, {
        ...m,
        openTasks: (prev?.openTasks || 0),
      });
    }
  }

  const allTasks = workspaces.flatMap((ws) =>
    (tasksByWs[ws.id] || []).map((t) => ({ ...t, workspaceName: ws.name }))
  );

  // Per-member open-task counts
  for (const t of allTasks) {
    if (t.assignee && t.status !== 'done' && memberMap.has(t.assignee)) {
      memberMap.get(t.assignee).openTasks += 1;
    }
  }

  const today = new Date().setHours(0, 0, 0, 0);
  const isOverdue = (t) => t.status !== 'done' && t.dueDate && new Date(t.dueDate).getTime() < today;

  const statusCounts = { todo: 0, in_progress: 0, review: 0, done: 0 };
  for (const t of allTasks) statusCounts[t.status] = (statusCounts[t.status] || 0) + 1;

  const done = statusCounts.done;
  const total = allTasks.length;

  return {
    members: [...memberMap.values()],
    teamSize: memberMap.size,
    tasks: {
      total,
      open: total - done,
      done,
      overdue: allTasks.filter(isOverdue),
      inReview: allTasks.filter((t) => t.status === 'review'),
      completionRate: total ? Math.round((done / total) * 100) : 0,
    },
    workload: [...memberMap.values()].map((m) => ({ name: m.name.split(' ')[0], open: m.openTasks })),
    statusMix: Object.entries(statusCounts).map(([key, value]) => ({
      name: STATUS_LABELS[key] || key,
      value,
      color: STATUS_COLORS[key] || '#64748B',
    })),
    attention: [
      ...allTasks.filter(isOverdue).map((t) => ({ ...t, reason: 'Overdue' })),
      ...allTasks.filter((t) => t.status === 'review').map((t) => ({ ...t, reason: 'Awaiting review' })),
    ].slice(0, 6),
    activity: workspaces.flatMap((ws) => activityByWs[ws.id] || []).slice(0, 6),
    workspaceHealth: workspaces.map((ws) => {
      const ts = tasksByWs[ws.id] || [];
      const d = ts.filter((t) => t.status === 'done').length;
      return { name: ws.name, open: ts.length - d, done: d, total: ts.length };
    }),
  };
};

// Compact offline fallback so the page still renders without the API.
const FALLBACK_WS = [
  { id: 'ws_1', name: 'Acme HQ' },
  { id: 'ws_2', name: 'Nimbus Labs' },
];
const FALLBACK_MEMBERS = {
  ws_1: [
    { userId: 'usr_2', name: 'Maya Chen', role: 'admin', status: 'online', title: 'Head of Sales' },
    { userId: 'usr_3', name: 'Jordan Lee', role: 'member', status: 'away', title: 'Customer Success' },
    { userId: 'usr_4', name: 'Sam Okoro', role: 'member', status: 'online', title: 'Account Executive' },
    { userId: 'usr_5', name: 'Priya Nair', role: 'member', status: 'offline', title: 'Growth Analyst' },
  ],
  ws_2: [
    { userId: 'usr_6', name: 'Luca Rossi', role: 'admin', status: 'online', title: 'Platform Lead' },
    { userId: 'usr_5', name: 'Priya Nair', role: 'member', status: 'offline', title: 'Growth Analyst' },
  ],
};
const FALLBACK_TASKS = {
  ws_1: [
    { id: 'tsk_1', title: 'Q4 enterprise renewal deck', status: 'todo', priority: 'high', assignee: 'usr_2', assigneeName: 'Maya Chen', dueDate: '2026-11-08' },
    { id: 'tsk_3', title: 'Pricing experiment: annual toggle', status: 'in_progress', priority: 'low', assignee: 'usr_5', assigneeName: 'Priya Nair', dueDate: '2026-11-20' },
    { id: 'tsk_4', title: 'Vertex Health expansion proposal', status: 'in_progress', priority: 'high', assignee: 'usr_4', assigneeName: 'Sam Okoro', dueDate: '2026-11-06' },
    { id: 'tsk_2', title: 'Onboarding flow for Helios', status: 'review', priority: 'medium', assignee: 'usr_3', assigneeName: 'Jordan Lee', dueDate: '2026-10-30' },
    { id: 'tsk_5', title: 'Migrate billing to new ledger', status: 'done', priority: 'high', assignee: 'usr_2', assigneeName: 'Maya Chen', dueDate: '2026-10-28' },
  ],
  ws_2: [
    { id: 'tsk_6', title: 'Realtime presence service', status: 'in_progress', priority: 'high', assignee: 'usr_6', assigneeName: 'Luca Rossi', dueDate: '2026-11-14' },
    { id: 'tsk_8', title: 'SOC 2 evidence collection', status: 'review', priority: 'high', assignee: 'usr_6', assigneeName: 'Luca Rossi', dueDate: '2026-10-25' },
    { id: 'tsk_7', title: 'API rate-limit dashboard', status: 'done', priority: 'medium', assignee: 'usr_5', assigneeName: 'Priya Nair', dueDate: '2026-11-01' },
  ],
};
const FALLBACK_ACTIVITY = {
  ws_1: [
    { id: 'act_1', actor: 'Maya Chen', action: 'moved to in_progress', target: 'Vertex Health expansion proposal', time: '2026-11-03T08:40:00Z' },
    { id: 'act_2', actor: 'Sam Okoro', action: 'commented on', target: 'Pricing experiment', time: '2026-11-02T14:05:00Z' },
  ],
  ws_2: [
    { id: 'act_5', actor: 'Luca Rossi', action: 'moved to review', target: 'SOC 2 evidence collection', time: '2026-11-01T17:30:00Z' },
  ],
};

const ManagerDashboard = () => {
  const user = useSelector((state) => state.auth.user);
  const firstName = (user?.name || 'there').split(' ')[0];

  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [offline, setOffline] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await workspaceService.getAll();
      const workspaces = res?.data?.workspaces || [];
      const [membersByWs, tasksByWs, activityByWs] = [{}, {}, {}];
      await Promise.all(
        workspaces.map(async (ws) => {
          const [m, t, a] = await Promise.all([
            workspaceService.getMembers(ws.id),
            workspaceService.getTasks(ws.id),
            workspaceService.getActivity(ws.id),
          ]);
          membersByWs[ws.id] = m?.data?.members || [];
          tasksByWs[ws.id] = t?.data?.tasks || [];
          activityByWs[ws.id] = a?.data?.activity || [];
        })
      );
      setData(aggregateManagerData(workspaces, membersByWs, tasksByWs, activityByWs));
      setOffline(false);
    } catch {
      setData(aggregateManagerData(FALLBACK_WS, FALLBACK_MEMBERS, FALLBACK_TASKS, FALLBACK_ACTIVITY));
      setOffline(true);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => { load(); }, [load]);

  return (
    <Box>
      <PageHeader
        title={`Manager Dashboard`}
        subtitle={`Team execution at a glance — workload, deliverables, and what needs you, ${firstName}.`}
        actions={[
          <Button key="refresh" variant="outlined" startIcon={<RefreshIcon />} onClick={load} sx={{ borderRadius: 2.5 }}>
            Refresh
          </Button>,
        ]}
      />

      {offline && (
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2.5 }}>
          API unreachable — showing cached team data.
        </Alert>
      )}
      {loading && <LinearProgress sx={{ borderRadius: 2, mb: 2.5 }} />}

      {data && (
        <>
          {/* KPIs */}
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6} lg={3}>
              <KpiCard label="Team members" value={formatNumber(data.teamSize)} icon={<GroupIcon />} color="#2563EB" hint="across workspaces" />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <KpiCard label="Active tasks" value={formatNumber(data.tasks.open)} icon={<AssignmentIcon />} color="#4F46E5" hint={`${data.tasks.done} completed`} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <KpiCard
                label="Needs attention"
                value={formatNumber(data.tasks.overdue.length + data.tasks.inReview.length)}
                icon={<WarningIcon />}
                color="#D97706"
                hint={`${data.tasks.overdue.length} overdue · ${data.tasks.inReview.length} in review`}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <KpiCard label="Completion rate" value={`${data.tasks.completionRate}%`} icon={<CheckCircleIcon />} color="#059669" hint="all assigned work" />
            </Grid>
          </Grid>

          {/* Workload + status mix */}
          <Grid container spacing={2.5} sx={{ mt: 0 }}>
            <Grid item xs={12} lg={8}>
              <SectionCard title="Team workload" subtitle="Open tasks per member — rebalance before burnout">
                <BarTrendChart
                  data={data.workload}
                  xKey="name"
                  height={250}
                  series={[{ key: 'open', name: 'Open tasks', color: '#4F46E5' }]}
                />
              </SectionCard>
            </Grid>
            <Grid item xs={12} lg={4}>
              <SectionCard title="Task status" subtitle="Where the work is sitting">
                <DonutChart
                  data={data.statusMix}
                  centerValue={data.tasks.total}
                  centerLabel="tasks"
                  innerRadius={58}
                  height={250}
                />
              </SectionCard>
            </Grid>
          </Grid>

          {/* Attention + roster */}
          <Grid container spacing={2.5}>
            <Grid item xs={12} lg={7}>
              <SectionCard title="Needs attention" subtitle="Overdue deliverables and review bottlenecks" contentSx={{ pt: 1 }}>
                {data.attention.length === 0 ? (
                  <EmptyState title="All clear" message="Nothing overdue or stuck in review. Great work!" />
                ) : (
                  <List disablePadding>
                    {data.attention.map((t) => (
                      <ListItem key={`${t.reason}-${t.id}`} disablePadding sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 38 }}>
                          <WarningIcon fontSize="small" color={t.reason === 'Overdue' ? 'error' : 'warning'} />
                        </ListItemIcon>
                        <ListItemText
                          primary={<Typography variant="body2" fontWeight={700}>{t.title}</Typography>}
                          secondary={`${t.assigneeName || 'Unassigned'} · ${t.workspaceName || ''}${t.dueDate ? ` · due ${formatDate(t.dueDate, { month: 'short', day: 'numeric' })}` : ''}`}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                        <Chip
                          size="small"
                          label={t.reason}
                          color={t.reason === 'Overdue' ? 'error' : 'warning'}
                          variant="outlined"
                        />
                      </ListItem>
                    ))}
                  </List>
                )}
                <Divider sx={{ my: 1.5 }} />
                <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Workspace health</Typography>
                <Stack spacing={1.25}>
                  {data.workspaceHealth.map((w) => (
                    <Box key={w.name}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">{w.name}</Typography>
                        <Typography variant="caption" fontWeight={700}>{w.done}/{w.total} done</Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={w.total ? Math.round((w.done / w.total) * 100) : 0}
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  ))}
                </Stack>
              </SectionCard>
            </Grid>

            <Grid item xs={12} lg={5}>
              <SectionCard title="Team roster" subtitle="Who is carrying what" contentSx={{ pt: 1 }}>
                <List disablePadding>
                  {data.members.map((m) => (
                    <ListItem key={m.userId} disablePadding sx={{ py: 1 }}>
                      <ListItemIcon sx={{ minWidth: 46 }}><AppAvatar name={m.name} size={38} /></ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="body2" fontWeight={700}>{m.name}</Typography>}
                        secondary={`${m.title || m.role || 'Member'} · ${m.openTasks} open task${m.openTasks === 1 ? '' : 's'}`}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <StatusChip status={m.status || 'offline'} />
                    </ListItem>
                  ))}
                  {data.members.length === 0 && (
                    <EmptyState title="No team members" message="Invite members from the Workspaces page." />
                  )}
                </List>
              </SectionCard>

              <SectionCard title="Recent team activity" subtitle="Latest moves across your workspaces" contentSx={{ pt: 1 }}>
                <List disablePadding>
                  {data.activity.map((a) => (
                    <ListItem key={a.id} disablePadding sx={{ py: 0.85, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}><AppAvatar name={a.actor} size={28} /></ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="body2"><b>{a.actor}</b> {a.action} <b>{a.target}</b></Typography>}
                        secondary={formatRelative(a.time)}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                  {data.activity.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      No recent activity.
                    </Typography>
                  )}
                </List>
              </SectionCard>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default ManagerDashboard;
