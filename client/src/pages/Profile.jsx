import React from 'react';
import {
  Box, Typography, Grid, Stack, Chip, Button, Card, CardContent, List, ListItem,
  ListItemIcon, ListItemText, Divider, IconButton, Tooltip,
} from '@mui/material';
import EditIcon from '@mui/icons-material/EditOutlined';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOnOutlined';
import WorkIcon from '@mui/icons-material/WorkOutlineOutlined';
import CalendarIcon from '@mui/icons-material/CalendarMonthOutlined';
import SecurityIcon from '@mui/icons-material/SecurityOutlined';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  PageHeader, SectionCard, AppAvatar, RoleChip, MetricDelta, InfoRow,
} from '../components/ui';
import { BarTrendChart, RadialGauge, Sparkline } from '../components/charts';
import { activityFeed, teamMembers, revenueSeries } from '../data/mockData';
import { formatRelative, formatDate } from '../utils/format';

const Profile = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const name = user?.name || 'Demo User';
  const member = teamMembers.find((m) => m.name === name) || teamMembers[0];

  return (
    <Box>
      <PageHeader
        title="My Profile"
        subtitle="Your public profile, activity, and performance in the workspace."
        actions={[
          <Button key="edit" variant="outlined" startIcon={<EditIcon />} onClick={() => navigate('/settings')} sx={{ borderRadius: 2.5 }}>
            Edit profile
          </Button>,
          <Button key="export" variant="contained" startIcon={<DownloadIcon />} sx={{ borderRadius: 2.5 }}>
            Export activity
          </Button>,
        ]}
      />

      {/* Cover + identity */}
      <Card sx={{ overflow: 'hidden', mb: 2.5 }}>
        <Box sx={{
          height: 140,
          background: 'linear-gradient(120deg, #4F46E5 0%, #7C3AED 45%, #A78BFA 100%)',
        }} />
        <Box sx={{ px: { xs: 2.5, md: 3.5 }, pb: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2.5}
            alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
            sx={{ mt: -7 }}
          >
            <Box sx={{
              p: 0.5, borderRadius: '50%', bgcolor: 'background.paper',
              boxShadow: '0 10px 30px rgba(15,23,42,0.18)',
            }}>
              <AppAvatar name={name} size={110} />
            </Box>
            <Box sx={{ flex: 1, pb: 0.75 }}>
              <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="h4" fontWeight={800}>{name}</Typography>
                <RoleChip role={user?.role || member.role} />
                <Chip size="small" label={member.status} color={member.status === 'online' ? 'success' : 'default'} variant="outlined" />
              </Stack>
              <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <WorkIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">{member.title}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">{member.location}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">{user?.email || member.email}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <CalendarIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">Joined {formatDate('2026-06-14')}</Typography>
                </Stack>
              </Stack>
            </Box>
          </Stack>
        </Box>
      </Card>

      {/* Stats */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} lg={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Tasks completed</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>{member.tasksDone}</Typography>
            <MetricDelta value={12.0} />
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Deals supported</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>23</Typography>
            <MetricDelta value={8.6} />
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Reports authored</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>17</Typography>
            <MetricDelta value={-2.2} />
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Team kudos</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>42 🎉</Typography>
            <MetricDelta value={21.4} />
          </CardContent></Card>
        </Grid>
      </Grid>

      {/* Activity + skills */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <SectionCard title="My contribution" subtitle="Tasks completed per month">
            <BarTrendChart
              data={[
                { month: 'Jun', done: 12 }, { month: 'Jul', done: 16 }, { month: 'Aug', done: 14 },
                { month: 'Sep', done: 21 }, { month: 'Oct', done: 24 }, { month: 'Nov', done: 9 },
              ]}
              xKey="month"
              height={250}
              series={[{ key: 'done', name: 'Tasks', color: '#4F46E5' }]}
            />
          </SectionCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <SectionCard title="Goals" subtitle="Personal OKRs, Q4">
            <Grid container spacing={1}>
              <Grid item xs={6}><RadialGauge value={78} label="Pipeline" color="#4F46E5" /></Grid>
              <Grid item xs={6}><RadialGauge value={64} label="Enablement" color="#0EA5E9" /></Grid>
            </Grid>
            <Divider sx={{ my: 1.5 }} />
            <InfoRow label="Manager" value="Ava Mitchell" />
            <InfoRow label="Team" value="Revenue Operations" />
            <InfoRow label="Location" value={member.location} />
          </SectionCard>
        </Grid>
      </Grid>

      {/* Recent activity */}
      <Grid container spacing={2.5}>
        <Grid item xs={12}>
          <SectionCard title="Recent activity" subtitle="Your latest actions in the workspace">
            <List disablePadding>
              {activityFeed.slice(0, 5).map((a) => (
                <ListItem key={a.id} disablePadding sx={{ py: 1, alignItems: 'flex-start' }}>
                  <ListItemIcon sx={{ minWidth: 42, mt: 0.5 }}>
                    <Box sx={{ width: 32, height: 32, borderRadius: 1.75, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', fontSize: 15 }}>
                      {a.actor === 'System' ? '🤖' : a.actor.charAt(0)}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" dangerouslySetInnerHTML={{ __html: `<b>${a.actor}</b> ${a.text}` }} />}
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

export default Profile;
