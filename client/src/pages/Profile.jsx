import React from 'react';
import {
  Box, Typography, Grid, Stack, Chip, Button, Card, CardContent, List, ListItem,
  ListItemIcon, ListItemText, Divider, IconButton, Tooltip, Menu, MenuItem,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
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
import { activityFeed, teamMembers } from '../data/mockData';
import { formatRelative, formatDate, getInitials, getAvatarColor } from '../utils/format';
import { SafeText } from '../utils/safeText';
import { updateUser } from '../store/slices/authSlice.jsx';
import { authService } from '../services';
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
  const name = user?.name || 'Demo User';
  const member = teamMembers.find((m) => m.name === name) || teamMembers[0];

  const [coverId, setCoverId] = React.useState(user?.coverPhoto || 'wave');
  const [coverMenu, setCoverMenu] = React.useState(null);
  const cover = coverId?.startsWith('data:')
    ? { id: 'custom', label: 'Custom', style: { backgroundImage: `url(${coverId})`, backgroundSize: 'cover', backgroundPosition: 'center' } }
    : (COVER_OPTIONS.find((c) => c.id === coverId) || COVER_OPTIONS[0]);

  // Inline profile editing (persisted to the API)
  const [editOpen, setEditOpen] = React.useState(false);
  const [editForm, setEditForm] = React.useState({ name: user?.name || '', title: user?.title || '', phone: user?.phone || '' });
  const [saving, setSaving] = React.useState(false);

  // Profile completeness: avatar, name, title, email, phone, cover
  const completeness = React.useMemo(() => {
    const fields = [user?.avatar, name, user?.title || member.title, user?.email, user?.phone, coverId];
    const done = fields.filter(Boolean).length;
    return Math.round((done / fields.length) * 100);
  }, [user, name, member, coverId]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g|gif|webp)$/.test(file.type)) {
      toast.error('Please choose a PNG, JPEG, GIF or WebP image');
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error('Image must be under 1 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      // Optimistic local update, then persist to the API (server re-validates).
      dispatch(updateUser({ avatar: reader.result }));
      toast.success('Profile photo updated');
      try {
        await authService.updateProfile({ avatar: reader.result });
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Could not save photo to the server');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g|gif|webp)$/.test(file.type)) {
      toast.error('Please choose a PNG, JPEG, GIF or WebP image');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Cover image must be under 2 MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      setCoverId(reader.result);
      dispatch(updateUser({ coverPhoto: reader.result }));
      toast.success('Cover photo updated');
      try {
        await authService.updateProfile({ coverPhoto: reader.result });
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Could not save cover to the server');
      }
    };
    reader.readAsDataURL(file);
    setCoverMenu(null);
  };

  const handleCoverChange = async (id) => {
    setCoverId(id);
    setCoverMenu(null);
    dispatch(updateUser({ coverPhoto: id }));
    toast.success('Cover photo updated');
    try {
      await authService.updateProfile({ coverPhoto: id });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save cover to the server');
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await authService.updateProfile(editForm);
      if (res?.data?.user) dispatch(updateUser(res.data.user));
      else dispatch(updateUser(editForm));
      setEditOpen(false);
      toast.success('Profile details saved');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save profile');
    }
    setSaving(false);
  };

  return (
    <Box>
      <PageHeader
        title="My Profile"
        subtitle="Your public profile, activity, and performance in the workspace."
        actions={[
          <Button key="edit" variant="outlined" startIcon={<EditIcon />} onClick={() => setEditOpen(true)} sx={{ borderRadius: 2.5 }}>
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
            <MenuItem component="label" sx={{ borderRadius: 2, mb: 1 }}>
              <CameraAltIcon fontSize="small" sx={{ mr: 1.5 }} /> Upload cover image
              <input hidden accept="image/png,image/jpeg,image/gif,image/webp" type="file" onChange={handleCoverUpload} />
            </MenuItem>
            <Divider sx={{ mb: 1 }} />
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
                <RoleChip role={user?.role || member.role} />
                <Chip size="small" label={member.status} color={member.status === 'online' ? 'success' : 'default'} variant="outlined" />
              </Stack>
              <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <WorkIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">{user?.title || member.title}</Typography>
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
          <SectionCard title="Profile & goals" subtitle="Completeness and personal OKRs, Q4">
            <Grid container spacing={1}>
              <Grid item xs={6}><RadialGauge value={completeness} label="Profile" color="#4F46E5" /></Grid>
              <Grid item xs={6}><RadialGauge value={78} label="Pipeline" color="#0EA5E9" /></Grid>
            </Grid>
            <Divider sx={{ my: 1.5 }} />
            <InfoRow label="Manager" value="Ava Mitchell" />
            <InfoRow label="Team" value="Revenue Operations" />
            <InfoRow label="Phone" value={user?.phone || '+254 712 345 678'} />
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

      {/* Edit profile dialog — persisted via PUT /api/auth/profile */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={800}>Edit profile</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full name" fullWidth value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            <TextField label="Job title" fullWidth value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            <TextField label="Phone" fullWidth value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setEditOpen(false)} sx={{ borderRadius: 2.5 }}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProfile} disabled={saving || !editForm.name.trim()} sx={{ borderRadius: 2.5 }}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
