import React from 'react';
import {
  Box, Typography, Grid, Stack, Chip, Button, TextField, Tabs, Tab, Switch,
  List, ListItem, ListItemIcon, ListItemText, MenuItem, Divider, IconButton,
  InputAdornment, Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/PersonOutlineOutlined';
import PaletteIcon from '@mui/icons-material/PaletteOutlined';
import NotificationsIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SecurityIcon from '@mui/icons-material/SecurityOutlined';
import ExtensionIcon from '@mui/icons-material/ExtensionOutlined';
import LanguageIcon from '@mui/icons-material/LanguageOutlined';
import EmailIcon from '@mui/icons-material/EmailOutlined';
import PhoneIcon from '@mui/icons-material/PhoneOutlined';
import CheckIcon from '@mui/icons-material/Check';
import SaveIcon from '@mui/icons-material/SaveOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { toggleMode, setMode, setAccent } from '../store/slices/themeSlice';
import { updateUser } from '../store/slices/authSlice.jsx';
import { PageHeader, SectionCard, AppAvatar, RoleChip } from '../components/ui';
import { ACCENTS } from '../theme';
import toast from 'react-hot-toast';
import { can, PERMISSIONS } from '../utils/rbac';

const TabPanel = ({ value, index, children }) => (
  <Box hidden={value !== index} sx={{ pt: 2.5 }}>{value === index && children}</Box>
);

const INTEGRATIONS = [
  { name: 'Slack', desc: 'Alerts and report notifications in channels', connected: true, color: '#4A154B' },
  { name: 'Google Workspace', desc: 'SSO, calendar sync, and Drive exports', connected: true, color: '#2563EB' },
  { name: 'Stripe', desc: 'Payments, invoices, and subscription sync', connected: true, color: '#635BFF' },
  { name: 'HubSpot', desc: 'Two-way customer and deal sync', connected: false, color: '#FF7A59' },
  { name: 'Segment', desc: 'Forward product events to your warehouse', connected: false, color: '#52BD95' },
  { name: 'PagerDuty', desc: 'Escalate AI anomaly alerts to on-call', connected: false, color: '#06AC38' },
];

const Settings = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.theme);
  const user = useSelector((state) => state.auth.user);
  const manage = can(user, PERMISSIONS.SETTINGS_MANAGE);
  const [tab, setTab] = React.useState(0);
  const [profile, setProfile] = React.useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '+254 712 345 678',
    title: 'Head of Revenue Operations',
    timezone: 'Africa/Nairobi (GMT+3)',
    language: 'English (US)',
  });

  const handleProfileSave = () => {
    dispatch(updateUser({ name: profile.name, email: profile.email }));
    toast.success('Profile settings saved');
  };

  return (
    <Box>
      <PageHeader
        title="Settings"
        subtitle="Manage your account, appearance, notifications, and integrations."
        actions={[
          <Button key="save" variant="contained" startIcon={<SaveIcon />} onClick={handleProfileSave} sx={{ borderRadius: 2.5 }}>
            Save changes
          </Button>,
        ]}
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab icon={<PersonIcon fontSize="small" />} iconPosition="start" label="Profile" />
          <Tab icon={<PaletteIcon fontSize="small" />} iconPosition="start" label="Appearance" />
          <Tab icon={<NotificationsIcon fontSize="small" />} iconPosition="start" label="Notifications" />
          <Tab icon={<SecurityIcon fontSize="small" />} iconPosition="start" label="Security" />
          <Tab icon={<ExtensionIcon fontSize="small" />} iconPosition="start" label="Integrations" />
        </Tabs>
      </Box>

      {/* ===== Profile ===== */}
      <TabPanel value={tab} index={0}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} lg={8}>
            <SectionCard title="Personal information" subtitle="This is how you appear across the workspace">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <AppAvatar name={profile.name} size={72} />
                    <Box>
                      <Button variant="outlined" size="small" sx={{ borderRadius: 2, mr: 1 }}>Upload photo</Button>
                      <Button size="small" color="inherit">Remove</Button>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        JPG, GIF or PNG. Max 2 MB.
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Full name" size="small" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Job title" size="small" value={profile.title} onChange={(e) => setProfile({ ...profile, title: e.target.value })} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email" size="small" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" color="action" /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Phone" size="small" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" color="action" /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Timezone" size="small" value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}>
                    {['Africa/Nairobi (GMT+3)', 'America/Los_Angeles (GMT-8)', 'Europe/Berlin (GMT+1)', 'Asia/Kolkata (GMT+5:30)'].map((tz) => (
                      <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Language" size="small" value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })}>
                    {['English (US)', 'English (UK)', 'Français', 'Español', 'Deutsch', 'Kiswahili'].map((l) => (
                      <MenuItem key={l} value={l}>{l}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </SectionCard>
          </Grid>
          <Grid item xs={12} lg={4}>
            <SectionCard title="Role & access">
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Role</Typography>
                  <RoleChip role={user?.role || 'admin'} />
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Workspace</Typography>
                  <Typography variant="body2" fontWeight={700}>Nexus HQ</Typography>
                </Stack>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Member since</Typography>
                  <Typography variant="body2" fontWeight={700}>Jun 14, 2026</Typography>
                </Stack>
                <Divider />
                <Alert severity="info" sx={{ borderRadius: 2.5, mt: 1 }}>
                  Your role is managed by workspace admins. Contact them to request changes.
                </Alert>
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ===== Appearance ===== */}
      <TabPanel value={tab} index={1}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <SectionCard title="Theme mode" subtitle="Choose how Nexus looks to you">
              <Grid container spacing={2}>
                {[
                  { key: 'light', label: 'Light', desc: 'Bright and clean', preview: 'linear-gradient(135deg, #F6F7FB 50%, #fff 50%)' },
                  { key: 'dark', label: 'Dark', desc: 'Easy on the eyes', preview: 'linear-gradient(135deg, #0B1020 50%, #111731 50%)' },
                ].map((m) => (
                  <Grid item xs={6} key={m.key}>
                    <Box
                      onClick={() => dispatch(setMode(m.key))}
                      sx={{
                        p: 2, borderRadius: 3, cursor: 'pointer', border: '2px solid',
                        borderColor: theme.mode === m.key ? 'primary.main' : 'divider',
                      }}
                    >
                      <Box sx={{ height: 72, borderRadius: 2, background: m.preview, border: '1px solid', borderColor: 'divider', mb: 1.5, position: 'relative' }}>
                        {theme.mode === m.key && (
                          <Box sx={{ position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: '50%', bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckIcon sx={{ fontSize: 14 }} />
                          </Box>
                        )}
                      </Box>
                      <Typography variant="subtitle2" fontWeight={800}>{m.label}</Typography>
                      <Typography variant="caption" color="text.secondary">{m.desc}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ my: 2.5 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" fontWeight={700}>Compact sidebar</Typography>
                  <Typography variant="caption" color="text.secondary">Collapse navigation to icons only</Typography>
                </Box>
                <Switch checked={!theme.sidebarOpen} onChange={() => dispatch(toggleMode())} disabled />
              </Stack>
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Accent color" subtitle="Personalize the primary color">
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                {Object.entries(ACCENTS).map(([key, a]) => (
                  <Box
                    key={key}
                    onClick={() => dispatch(setAccent(key))}
                    sx={{
                      width: 88, p: 1.5, borderRadius: 2.5, cursor: 'pointer', textAlign: 'center',
                      border: '2px solid', borderColor: theme.accent === key ? 'primary.main' : 'divider',
                    }}
                  >
                    <Box sx={{
                      width: 40, height: 40, borderRadius: '50%', mx: 'auto',
                      background: `linear-gradient(135deg, ${a.main}, ${a.dark})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                    }}>
                      {theme.accent === key && <CheckIcon sx={{ fontSize: 18 }} />}
                    </Box>
                    <Typography variant="caption" fontWeight={700} sx={{ display: 'block', mt: 0.75 }}>{a.name}</Typography>
                  </Box>
                ))}
              </Stack>
              <Divider sx={{ my: 2.5 }} />
              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" fontWeight={700}>Reduced motion</Typography>
                    <Typography variant="caption" color="text.secondary">Minimize animations and transitions</Typography>
                  </Box>
                  <Switch defaultChecked={false} />
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" fontWeight={700}>Show chart animations</Typography>
                    <Typography variant="caption" color="text.secondary">Animate charts on load</Typography>
                  </Box>
                  <Switch defaultChecked />
                </Stack>
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ===== Notifications ===== */}
      <TabPanel value={tab} index={2}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={7}>
            <SectionCard title="Notification preferences" subtitle="Choose what reaches you and where">
              <List disablePadding>
                {[
                  { label: 'AI anomaly alerts', desc: 'Churn risks, traffic spikes, forecast changes', email: true, push: true },
                  { label: 'Billing & invoices', desc: 'Payment receipts, failed charges, plan changes', email: true, push: true },
                  { label: 'Report ready', desc: 'When scheduled reports finish generating', email: true, push: false },
                  { label: 'Team activity', desc: 'Mentions, assignments, and comments', email: false, push: true },
                  { label: 'Product updates', desc: 'New features, tips, and best practices', email: true, push: false },
                  { label: 'Weekly digest', desc: 'Summary of workspace performance every Monday', email: true, push: false },
                ].map((n) => (
                  <ListItem key={n.label} disablePadding sx={{ py: 1.1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <ListItemText primary={n.label} secondary={n.desc} primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }} secondaryTypographyProps={{ variant: 'caption' }} />
                    <Stack direction="row" spacing={2.5} alignItems="center">
                      <Stack alignItems="center">
                        <Typography variant="caption" color="text.secondary">Email</Typography>
                        <Switch size="small" defaultChecked={n.email} />
                      </Stack>
                      <Stack alignItems="center">
                        <Typography variant="caption" color="text.secondary">In-app</Typography>
                        <Switch size="small" defaultChecked={n.push} />
                      </Stack>
                    </Stack>
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={5}>
            <SectionCard title="Quiet hours" subtitle="Pause non-critical notifications">
              <Stack spacing={2}>
                <TextField select fullWidth size="small" label="From" defaultValue="20:00">
                  {['18:00', '19:00', '20:00', '21:00', '22:00'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
                <TextField select fullWidth size="small" label="To" defaultValue="07:00">
                  {['06:00', '07:00', '08:00', '09:00'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
                <Alert severity="info" sx={{ borderRadius: 2.5 }}>
                  Critical alerts (billing failures, security events) always reach you immediately.
                </Alert>
              </Stack>
            </SectionCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ===== Security ===== */}
      <TabPanel value={tab} index={3}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <SectionCard title="Password" subtitle="Change your password regularly">
              <Stack spacing={2}>
                <TextField fullWidth size="small" label="Current password" type="password" />
                <TextField fullWidth size="small" label="New password" type="password" helperText="At least 8 characters with a number and a symbol" />
                <TextField fullWidth size="small" label="Confirm new password" type="password" />
                <Button variant="contained" sx={{ alignSelf: 'flex-start', borderRadius: 2.5 }} onClick={() => toast.success('Password updated')}>Update password</Button>
              </Stack>
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Sessions & MFA">
              <List disablePadding>
                {[
                  { label: 'Two-factor authentication', desc: 'Authenticator app (enabled)', toggle: true, checked: true },
                  { label: 'Login notifications', desc: 'Email me about new sign-ins', toggle: true, checked: true },
                  { label: 'Active session: Chrome · Nairobi', desc: 'This device — current session', toggle: false },
                  { label: 'Active session: Safari · iPhone', desc: 'Last active 2 hours ago', toggle: false },
                ].map((row) => (
                  <ListItem key={row.label} disablePadding sx={{ py: 1.1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <ListItemIcon sx={{ minWidth: 36 }}><SecurityIcon fontSize="small" color={row.checked ? 'success' : 'action'} /></ListItemIcon>
                    <ListItemText primary={row.label} secondary={row.desc} primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }} secondaryTypographyProps={{ variant: 'caption' }} />
                    {row.toggle ? <Switch size="small" defaultChecked={row.checked} /> : <Button size="small" color="error" sx={{ borderRadius: 2 }}>Revoke</Button>}
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Grid>
        </Grid>
      </TabPanel>

      {/* ===== Integrations ===== */}
      <TabPanel value={tab} index={4}>
        <Grid container spacing={2.5}>
          {INTEGRATIONS.map((intg) => (
            <Grid item xs={12} sm={6} md={4} key={intg.name}>
              <SectionCard>
                <Stack direction="row" spacing={1.75} alignItems="flex-start">
                  <Box sx={{
                    width: 48, height: 48, borderRadius: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    bgcolor: `${intg.color}1A`, color: intg.color, fontWeight: 800, fontSize: 18,
                  }}>
                    {intg.name.charAt(0)}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontWeight={800}>{intg.name}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>{intg.desc}</Typography>
                  </Box>
                </Stack>
                <Button
                  fullWidth variant={intg.connected ? 'outlined' : 'contained'} size="small"
                  startIcon={intg.connected ? <CheckIcon fontSize="small" /> : undefined}
                  sx={{ mt: 2, borderRadius: 2.5 }}
                  onClick={() => toast(intg.connected ? `${intg.name} settings opened` : `Connecting ${intg.name}…`)}
                >
                  {intg.connected ? 'Connected' : 'Connect'}
                </Button>
              </SectionCard>
            </Grid>
          ))}
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default Settings;
