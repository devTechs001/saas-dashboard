import React from 'react';
import {
  Box, Typography, Grid, Stack, Chip, Button, Card, CardContent, List, ListItem,
  ListItemIcon, ListItemText, Divider, IconButton, Tooltip, Menu, MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/EditOutlined';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import LocationOnIcon from '@mui/icons-material/LocationOnOutlined';
import WorkIcon from '@mui/icons-material/WorkOutlineOutlined';
import CalendarIcon from '@mui/icons-material/CalendarMonthOutlined';
import CameraAltIcon from '@mui/icons-material/CameraAltOutlined';
import PaletteIcon from '@mui/icons-material/PaletteOutlined';
import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import {
  PageHeader, SectionCard, AppAvatar, RoleChip, MetricDelta, InfoRow,
} from '../components/ui';
import { BarTrendChart, RadialGauge } from '../components/charts';
import { DEMO_AVAILABLE } from '../config/env';
// Sample dataset: dev builds only. Vite replaces DEMO_AVAILABLE with a
// literal, so the whole `mock*` import is tree-shaken out of production.
import { activityFeed as mockActivityFeed, teamMembers as mockTeamMembers } from '../data/sampleData';
const activityFeed = DEMO_AVAILABLE ? mockActivityFeed : [];
const teamMembers = DEMO_AVAILABLE ? mockTeamMembers : [];
import { formatRelative, formatDate, getInitials, getAvatarColor } from '../utils/format';
import { SafeText } from '../utils/safeText';
import { updateUser } from '../store/slices/authSlice.jsx';
import cover1 from '../assets/cover-1.png';

// Cover photo options: generated image + themed gradients.
export const COVER_OPTIONS = [
  { id: 'wave', label: 'Aurora', style: { backgroundImage: `url(${cover1})`, backgroundSize: 'cover', backgroundPosition: 'center' } },
  { id: 'indigo', label: 'Indigo', style: { background: 'linear-gradient(120deg, #4F46E5 0%, #7C3AED 55%, #A78BFA 100%)' } },
  { id: 'ocean', label: 'Ocean', style: { background: 'linear-gradient(120deg, #0EA5E9 0%, #2563EB 55%, #4F46E5 100%)' } },
  { id: 'forest', label: 'Forest', style: { background: 'linear-gradient(120deg, #059669 0%, #10B981 55%, #34D399 100%)' } },
  { id: 'sunset', label: 'Sunset', style: { background: 'linear-gradient(120deg, #E11D48 0%, #F59E0B 100%)' } },
  { id: 'midnight', label: 'Midnight', style: { background: 'linear-gradient(120deg, #0B1020 0%, #312E81 55%, #6366F1 100%)' } },
];

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const name = user?.name || 'Your profile';
  const member = teamMembers.find((m) => m.name === name) || teamMembers[0] || null;

  const [coverId, setCoverId] = React.useState(user?.coverPhoto || 'wave');
  const [coverMenu, setCoverMenu] = React.useState(null);
  const cover = COVER_OPTIONS.find((c) => c.id === coverId) || COVER_OPTIONS[0];

  // Profile completeness: avatar, name, title, email, phone, cover
  const completeness = React.useMemo(() => {
    const fields = [user?.avatar, name, user?.title || member?.title, user?.email, user?.phone, coverId];
    const done = fields.filter(Boolean).length;
    return Math.round((done / fields.length) * 100);
  }, [user, name, member, coverId]);

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      toast.error('Image must be under 1 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      dispatch(updateUser({ avatar: reader.result }));
      toast.success('Profile photo updated');
    };
    reader.readAsDataURL(file);
  };

  const handleCoverChange = (id) => {
    setCoverId(id);
    dispatch(updateUser({ coverPhoto: id }));
    setCoverMenu(null);
    toast.success('Cover photo updated');
  };

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
        <Box sx={{ height: { xs: 120, md: 170 }, position: 'relative', ...cover.style }}>
          <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 12, right: 12 }}>
            <Button
              size="small"
              startIcon={<PaletteIcon fontSize="small" />}
              onClick={(e) => setCoverMenu(e.currentTarget)}
              sx={{ bgcolor: 'rgba(255,255,255,0.88)', color: '#0F172A', fontWeight: 700, borderRadius: 2, '&:hover': { bgcolor: '#fff' } }}
            >
              Change cover
            </Button>
          </Stack>
          <Menu anchorEl={coverMenu} open={Boolean(coverMenu)} onClose={() => setCoverMenu(null)} PaperProps={{ sx: { borderRadius: 3, p: 1.5, minWidth: 260 } }}>
            <Typography variant="overline" color="text.secondary" sx={{ px: 1.5, pb: 1, display: 'block' }}>Cover style</Typography>
            <Grid container spacing={1} sx={{ px: 1, width: 260 }}>
              {COVER_OPTIONS.map((c) => (
                <Grid item xs={4} key={c.id}>
                  <Box
                    onClick={() => handleCoverChange(c.id)}
                    sx={{
                      height: 44, borderRadius: 1.75, cursor: 'pointer', border: '2px solid',
                      borderColor: coverId === c.id ? 'primary.main' : 'divider', ...c.style,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 0.25 }}>{c.label}</Typography>
                </Grid>
              ))}
            </Grid>
          </Menu>
        </Box>
        <Box sx={{ px: { xs: 2.5, md: 3.5 }, pb: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2.5}
            alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
            sx={{ mt: -7 }}
          >
            <Box sx={{ position: 'relative', p: 0.5, borderRadius: '50%', bgcolor: 'background.paper', boxShadow: '0 10px 30px rgba(15,23,42,0.18)' }}>
              {user?.avatar ? (
                <Box component="img" src={user.avatar} alt={name} sx={{ width: { xs: 96, md: 112 }, height: { xs: 96, md: 112 }, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <AppAvatar name={name} size={112} />
              )}
              <Tooltip title="Upload profile photo">
                <IconButton
                  component="label"
                  size="small"
                  sx={{
                    position: 'absolute', bottom: 2, right: 2, bgcolor: 'primary.main', color: '#fff',
                    '&:hover': { bgcolor: 'primary.dark' }, width: 34, height: 34,
                  }}
                >
                  <CameraAltIcon sx={{ fontSize: 17 }} />
                  <input hidden accept="image/*" type="file" onChange={handleAvatarUpload} />
                </IconButton>
              </Tooltip>
            </Box>
            <Box sx={{ flex: 1, pb: 0.75 }}>
              <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography variant="h4" fontWeight={800}>{name}</Typography>
                <RoleChip role={user?.role || member?.role || 'viewer'} />
                {member?.status && <Chip size="small" label={member.status} color={member.status === 'online' ? 'success' : 'default'} variant="outlined" />}
              </Stack>
              <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <WorkIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">{user?.title || member?.title || '—'}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <LocationOnIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">{member?.location || user?.location || '—'}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">{user?.email || member?.email || ''}</Typography>
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
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>{member?.tasksDone ?? '—'}</Typography>
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
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>{member?.reportsAuthored ?? '—'}</Typography>
            <MetricDelta value={-2.2} />
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <Card><CardContent>
            <Typography variant="body2" color="text.secondary" fontWeight={600}>Team kudos</Typography>
            <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>{member?.kudos ?? '—'}</Typography>
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
              ].slice(0, DEMO_AVAILABLE ? 6 : 0)}
              xKey="month"
              height={250}
              series={[{ key: 'done', name: 'Tasks', color: '#4F46E5' }]}
            />
          </SectionCard>
        </Grid>
        <Grid item xs={12} lg={4}>
          <SectionCard title="Profile & goals" subtitle="Completeness and personal OKRs, Q4">
            <Grid container spacing={1}>
              <Grid item xs={6}><RadialGauge value={completeness} label="Profile" color="#4F46E5" /></Grid>
              <Grid item xs={6}><RadialGauge value={78} label="Pipeline" color="#0EA5E9" /></Grid>
            </Grid>
            <Divider sx={{ my: 1.5 }} />
            <InfoRow label="Manager" value={member?.manager || user?.manager || '—'} />
            <InfoRow label="Team" value={member?.team || user?.team || '—'} />
            <InfoRow label="Phone" value={user?.phone || '—'} />
            <InfoRow label="Location" value={member?.location || user?.location || '—'} />
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
                    <Box sx={{ width: 32, height: 32, borderRadius: 1.75, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', fontSize: 15, fontWeight: 700 }}>
                      {a.actor === 'System' ? '🤖' : getInitials(a.actor)}
                    </Box>
                  </ListItemIcon>
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

export default Profile;
