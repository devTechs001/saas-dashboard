import React from 'react';
import {
  Box, Typography, Grid, Stack, Chip, Card, CardContent, Button, Avatar,
  List, ListItem, ListItemAvatar, ListItemText, IconButton, Menu, MenuItem, LinearProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FlagIcon from '@mui/icons-material/FlagOutlined';
import GroupIcon from '@mui/icons-material/GroupOutlined';
import BoltIcon from '@mui/icons-material/BoltOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAddAltOutlined';
import EmojiEventsIcon from '@mui/icons-material/EmojiEventsOutlined';
import { useSelector } from 'react-redux';
import {
  PageHeader, SectionCard, AppAvatar, RoleChip, StatusChip, MetricDelta,
} from '../components/ui';
import { BarTrendChart } from '../components/charts';
import { tasks, activityFeed, teamMembers } from '../data/mockData';
import { formatRelative, formatDate } from '../utils/format';
import { SafeText } from '../utils/safeText';
import { can, PERMISSIONS } from '../utils/rbac';

const COLUMNS = [
  { key: 'todo', title: 'To do', color: '#64748B' },
  { key: 'inProgress', title: 'In progress', color: '#2563EB' },
  { key: 'done', title: 'Done', color: '#059669' },
];

const PRIORITY_COLORS = { high: 'error', medium: 'warning', low: 'default' };

const TaskCard = ({ task, manage }) => (
  <Card sx={{ mb: 1.5, '&:hover': { boxShadow: '0 10px 28px rgba(15,23,42,0.12)' } }}>
    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Chip size="small" label={task.tag} variant="outlined" sx={{ fontWeight: 600, textTransform: 'capitalize', height: 22 }} />
        {manage && <IconButton size="small"><MoreVertIcon fontSize="small" /></IconButton>}
      </Stack>
      <Typography variant="body2" fontWeight={700} sx={{ mt: 1, lineHeight: 1.5 }}>{task.title}</Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <AppAvatar name={task.assignee} size={26} />
          <Typography variant="caption" color="text.secondary">{task.assignee.split(' ')[0]}</Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center">
          <Chip size="small" label={task.priority} color={PRIORITY_COLORS[task.priority]} variant={task.priority === 'low' ? 'outlined' : 'filled'} sx={{ height: 20, fontSize: 10.5 }} />
          <Typography variant="caption" color="text.secondary">{formatDate(task.due, { month: 'short', day: 'numeric' })}</Typography>
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

const Team = () => {
  const user = useSelector((state) => state.auth.user);
  const manage = can(user, PERMISSIONS.TEAM_MANAGE);

  return (
    <Box>
      <PageHeader
        title="Collaboration"
        subtitle="Shared boards, goals, and activity — keep the whole team in sync."
        actions={[
          manage && <Button key="invite" variant="outlined" startIcon={<PersonAddIcon />} sx={{ borderRadius: 2.5 }}>Invite member</Button>,
          <Button key="task" variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 2.5 }}>New task</Button>,
        ].filter(Boolean)}
      />

      {/* Team performance */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <SectionCard title="Team output" subtitle="Tasks completed per member this quarter">
            <BarTrendChart
              data={teamMembers.map((m) => ({ name: m.name.split(' ')[0], done: m.tasksDone }))}
              xKey="name"
              height={240}
              series={[{ key: 'done', name: 'Tasks done', color: '#4F46E5' }]}
            />
          </SectionCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <SectionCard title="Sprint goal" subtitle="Q4 platform milestones">
            <Box sx={{ py: 1 }}>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography variant="body2" fontWeight={700}>Overall progress</Typography>
                <Typography variant="body2" fontWeight={800} color="primary.main">72%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={72} sx={{ height: 10, borderRadius: 5, mb: 2.5 }} />
              <Stack spacing={1.25}>
                {[
                  { label: 'Billing service launch', pct: 90 },
                  { label: 'AI insights GA', pct: 64 },
                  { label: 'SOC 2 evidence', pct: 55 },
                ].map((g) => (
                  <Box key={g.label}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="caption" color="text.secondary">{g.label}</Typography>
                      <Typography variant="caption" fontWeight={700}>{g.pct}%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={g.pct} sx={{ height: 6, borderRadius: 3 }} />
                  </Box>
                ))}
              </Stack>
            </Box>
          </SectionCard>
        </Grid>
      </Grid>

      {/* Kanban board */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3.5, mb: 1.5 }}>
        <Typography variant="h5" fontWeight={800}>Task board</Typography>
        <Chip icon={<BoltIcon sx={{ fontSize: '16px !important' }} />} label="8 active tasks" variant="outlined" />
      </Stack>
      <Grid container spacing={2.5}>
        {COLUMNS.map((col) => (
          <Grid item xs={12} md={4} key={col.key}>
            <Box sx={{
              p: 1.75, borderRadius: 3, height: '100%', minHeight: 320,
              bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider',
            }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5, px: 0.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: col.color }} />
                  <Typography variant="subtitle2" fontWeight={800}>{col.title}</Typography>
                  <Chip size="small" label={tasks[col.key].length} sx={{ height: 20, fontSize: 11, fontWeight: 700 }} />
                </Stack>
                <IconButton size="small"><AddIcon fontSize="small" /></IconButton>
              </Stack>
              {tasks[col.key].map((t) => <TaskCard key={t.id} task={t} manage={manage} />)}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Members + activity */}
      <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
        <Grid item xs={12} md={7}>
          <SectionCard title="Team members" subtitle="Roles and status" contentSx={{ pt: 1 }}>
            <List disablePadding>
              {teamMembers.map((m) => (
                <ListItem key={m.id} disablePadding sx={{ py: 1 }}>
                  <ListItemAvatar sx={{ minWidth: 52 }}>
                    <AppAvatar name={m.name} size={42} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="body2" fontWeight={700}>{m.name}</Typography>}
                    secondary={<Typography variant="caption" color="text.secondary">{m.title} · {m.location}</Typography>}
                  />
                  <Stack direction="row" spacing={1} alignItems="center">
                    <StatusChip status={m.status} />
                    <RoleChip role={m.role} />
                  </Stack>
                </ListItem>
              ))}
            </List>
          </SectionCard>
        </Grid>
        <Grid item xs={12} md={5}>
          <SectionCard title="Activity feed" subtitle="Everything happening in your workspace" contentSx={{ pt: 1 }}>
            <List disablePadding>
              {activityFeed.map((a) => (
                <ListItem key={a.id} disablePadding sx={{ py: 0.9, alignItems: 'flex-start' }}>
                  <ListItemAvatar sx={{ minWidth: 44, mt: 0.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'action.hover', color: 'text.primary', fontSize: 14, fontWeight: 700 }}>
                      {a.actor === 'System' ? '🤖' : a.actor.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography variant="body2"><b>{a.actor}</b> <SafeText text={a.text} /></Typography>}
                    secondary={formatRelative(a.time)}
                    secondaryTypographyProps={{ fontSize: 11 }}
                  />
                </ListItem>
              ))}
            </List>
          </SectionCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Team;
