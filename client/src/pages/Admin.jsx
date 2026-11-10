import React from 'react';
import {
  Box, Typography, Grid, Stack, Chip, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Menu, MenuItem, TextField,
  InputAdornment, Tabs, Tab, Card, CardContent, List, ListItem, ListItemIcon,
  ListItemText, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAddAltOutlined';
import AdminPanelIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SecurityIcon from '@mui/icons-material/SecurityOutlined';
import HistoryIcon from '@mui/icons-material/HistoryOutlined';
import BlockIcon from '@mui/icons-material/BlockOutlined';
import KeyIcon from '@mui/icons-material/KeyOutlined';
import { useSelector } from 'react-redux';
import { PageHeader, SectionCard, KpiCard, AppAvatar, RoleChip, StatusChip, EmptyState } from '../components/ui';
import { DonutChart, BarTrendChart } from '../components/charts';
import { useQuery } from '@tanstack/react-query';
import { DEMO_AVAILABLE } from '../config/env';
import { authService } from '../services';
// Sample dataset: dev builds only. Vite replaces DEMO_AVAILABLE with a
// literal, so the whole `mock*` import is tree-shaken out of production.
import { platformUsers as mockPlatformUsers, activityFeed as mockActivityFeed } from '../data/sampleData';
// Sample users only seed dev builds (and act as the offline fallback).
const activityFeed = DEMO_AVAILABLE ? mockActivityFeed : [];
import { formatRelative, formatDate } from '../utils/format';
import { hasRole, ROLES, permissionsForRole, ROLE_LABELS, PERMISSIONS } from '../utils/rbac';

const SAMPLE_AUDIT_ROWS = [
  { id: 'aud_1', actor: 'Ava Mitchell', action: 'Updated role: Priya Nair → viewer', target: 'usr_5', time: '2026-11-03T08:40:00Z', ip: '197.232.60.14' },
  { id: 'aud_2', actor: 'System', action: 'API key “Local dev” created', target: 'key_3', time: '2026-10-28T12:00:00Z', ip: '—' },
  { id: 'aud_3', actor: 'Maya Chen', action: 'Invited Tom Becker (manager)', target: 'usr_8', time: '2026-10-25T15:22:00Z', ip: '102.68.76.9' },
  { id: 'aud_4', actor: 'Ava Mitchell', action: 'Enabled SSO enforcement', target: 'workspace', time: '2026-10-20T10:05:00Z', ip: '197.232.60.14' },
  { id: 'aud_5', actor: 'System', action: 'Blocked suspicious login (5 failed attempts)', target: 'usr_7', time: '2026-10-19T03:12:00Z', ip: '41.90.12.201' },
];

const SAMPLE_ROLE_MIX = [
  { name: 'Admins', value: 2, color: '#7C3AED' },
  { name: 'Managers', value: 3, color: '#4F46E5' },
  { name: 'Viewers', value: 3, color: '#0EA5E9' },
];
// Audit log + role mix are sample data — dev builds only. Production shows an
// empty audit trail until the real audit endpoint is wired up.
const AUDIT_ROWS = DEMO_AVAILABLE ? SAMPLE_AUDIT_ROWS : [];
const SAMPLE_ROLE_MIX_DATA = DEMO_AVAILABLE ? SAMPLE_ROLE_MIX : [];
// Role mix is derived from the real user list; the sample split is a dev fallback.
const roleMixFor = (users) => {
  if (!users.length) return SAMPLE_ROLE_MIX_DATA;
  const counts = users.reduce((acc, u) => ({ ...acc, [u.role]: (acc[u.role] || 0) + 1 }), {});
  return Object.entries(counts).map(([name, value]) => ({ name: name[0].toUpperCase() + name.slice(1) + 's', value }));
};

const Admin = () => {
  const user = useSelector((state) => state.auth.user);
  const isAdmin = hasRole(user, [ROLES.ADMIN]);
  const [tab, setTab] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [menuAnchor, setMenuAnchor] = React.useState(null);

  // Real workspace users. Sample users are only used when the API is
  // unreachable in a dev build — production renders an empty table.
  const { data: usersData } = useQuery({
    queryKey: ['platformUsers', { page: 1, limit: 100 }],
    queryFn: () => authService.getAllUsers({ page: 1, limit: 100 }),
    select: (data) => data.data,
    retry: 1,
  });
  const remoteUsers = usersData?.users || [];
  const platformUsers = remoteUsers.length
    ? remoteUsers
    : (DEMO_AVAILABLE ? mockPlatformUsers : []);

  const filtered = platformUsers.filter((u) =>
    `${u.name} ${u.email} ${u.title}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <PageHeader
        title="Admin Console"
        subtitle="Manage users, roles, security, and workspace governance."
        actions={[
          isAdmin
            ? <Button key="invite" variant="contained" startIcon={<PersonAddIcon />} sx={{ borderRadius: 2.5 }}>Invite user</Button>
            : <Chip key="ro" label="Read-only — admin access required" variant="outlined" color="warning" />,
        ]}
      />

      {/* KPIs */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Total users" value={platformUsers.length} hint="in this workspace" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Active today" value={platformUsers.filter((u) => u.status === 'online').length} hint={`of ${platformUsers.length} seats`} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Admin roles" value={platformUsers.filter((u) => u.role === 'admin').length} hint="least-privilege enforced" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Security score" value="92 / 100" delta={4} hint="SSO + MFA enabled" />
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ mt: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
          <Tab label="Users & roles" />
          <Tab label="Access control" />
          <Tab label="Audit log" />
          <Tab label="Security" />
        </Tabs>
      </Box>

      {/* ===== Users & roles ===== */}
      {tab === 0 && (
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12} lg={8}>
            <SectionCard
              title="Workspace users"
              subtitle={`${filtered.length} of ${platformUsers.length} users`}
              contentSx={{ pt: 1 }}
              action={
                <TextField
                  size="small" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                  sx={{ width: 240, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                />
              }
            >
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Joined</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filtered.map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell>
                          <Stack direction="row" spacing={1.25} alignItems="center">
                            <AppAvatar name={u.name} size={36} />
                            <Box>
                              <Typography variant="body2" fontWeight={700}>{u.name}</Typography>
                              <Typography variant="caption" color="text.secondary">{u.email}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell><RoleChip role={u.role} /></TableCell>
                        <TableCell><StatusChip status={u.status} /></TableCell>
                        <TableCell align="right">{formatDate('2026-06-14')}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="More actions">
                            <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} disabled={!isAdmin}>
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {filtered.length === 0 && (
                <EmptyState title="No users found" message={`Nothing matches “${search}”. Try a different search.`} />
              )}
            </SectionCard>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Stack spacing={2.5}>
              <SectionCard title="Role distribution" subtitle="Seats by role">
                <DonutChart data={roleMixFor(platformUsers)} height={220} innerRadius={56} centerValue={platformUsers.length} centerLabel="seats" />
              </SectionCard>
              <SectionCard title="Roles & capabilities" subtitle="RBAC matrix" contentSx={{ pt: 1 }}>
                <List disablePadding>
                  {Object.values(ROLES).map((role) => (
                    <ListItem key={role} disablePadding sx={{ py: 0.9 }}>
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        <Box sx={{ width: 30, height: 30, borderRadius: 1.75, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
                          {role === ROLES.ADMIN ? <AdminPanelIcon fontSize="small" color="secondary" /> : role === ROLES.MANAGER ? <KeyIcon fontSize="small" color="primary" /> : <SecurityIcon fontSize="small" color="action" />}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="body2" fontWeight={700}>{ROLE_LABELS[role]}</Typography>}
                        secondary={<Typography variant="caption" color="text.secondary">{permissionsForRole(role).length} permissions</Typography>}
                      />
                    </ListItem>
                  ))}
                </List>
              </SectionCard>
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* ===== Access control ===== */}
      {tab === 1 && (
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <SectionCard title="Permission matrix" subtitle="What each role can do in this workspace">
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Permission</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Admin</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Manager</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700 }}>Viewer</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.values(PERMISSIONS).map((perm) => {
                      const cells = Object.values(ROLES).map((r) => permissionsForRole(r).includes(perm));
                      return (
                        <TableRow key={perm} hover>
                          <TableCell><Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>{perm}</Typography></TableCell>
                          {cells.map((has, i) => (
                            <TableCell key={i} align="center">
                              {has
                                ? <Chip size="small" label="✓" color="success" sx={{ height: 20, width: 20, fontWeight: 800, '& .MuiChip-label': { px: 0.5 } }} />
                                : <Chip size="small" label="—" variant="outlined" sx={{ height: 20, color: 'text.disabled' }} />}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionCard>
          </Grid>
        </Grid>
      )}

      {/* ===== Audit log ===== */}
      {tab === 2 && (
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <SectionCard title="Audit log" subtitle="Immutable record of security-relevant actions" contentSx={{ pt: 1 }}>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>When</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actor</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Action</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Target</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>IP</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {AUDIT_ROWS.map((r) => (
                      <TableRow key={r.id} hover>
                        <TableCell>{formatRelative(r.time)}</TableCell>
                        <TableCell><Typography variant="body2" fontWeight={600}>{r.actor}</Typography></TableCell>
                        <TableCell>{r.action}</TableCell>
                        <TableCell><Chip size="small" label={r.target} variant="outlined" sx={{ fontFamily: 'monospace' }} /></TableCell>
                        <TableCell align="right"><Typography variant="caption" color="text.secondary">{r.ip}</Typography></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </SectionCard>
          </Grid>
        </Grid>
      )}

      {/* ===== Security ===== */}
      {tab === 3 && (
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12} md={6}>
            <SectionCard title="Security posture" subtitle="Workspace-wide controls">
              <List disablePadding>
                {[
                  { label: 'Single sign-on (SSO)', desc: 'SAML / OIDC enforced for all members', enabled: true },
                  { label: 'Multi-factor authentication', desc: 'Required for admins', enabled: true },
                  { label: 'Session timeout', desc: 'Automatic logout after 12 hours', enabled: true },
                  { label: 'IP allowlist', desc: 'Restrict admin access to office ranges', enabled: false },
                  { label: 'SCIM provisioning', desc: 'Sync users from your identity provider', enabled: true },
                ].map((row) => (
                  <ListItem key={row.label} disablePadding sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <SecurityIcon fontSize="small" color={row.enabled ? 'success' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText primary={row.label} secondary={row.desc} primaryTypographyProps={{ fontWeight: 600, variant: 'body2' }} secondaryTypographyProps={{ variant: 'caption' }} />
                    <Chip size="small" label={row.enabled ? 'Enabled' : 'Disabled'} color={row.enabled ? 'success' : 'default'} variant={row.enabled ? 'filled' : 'outlined'} />
                  </ListItem>
                ))}
              </List>
            </SectionCard>
          </Grid>
          <Grid item xs={12} md={6}>
            <SectionCard title="Login activity" subtitle="Successful authentications, last 7 days">
              <BarTrendChart
                data={[
                  { day: 'Mon', logins: 42 }, { day: 'Tue', logins: 51 }, { day: 'Wed', logins: 47 },
                  { day: 'Thu', logins: 58 }, { day: 'Fri', logins: 44 }, { day: 'Sat', logins: 12 }, { day: 'Sun', logins: 9 },
                ]}
                xKey="day"
                height={240}
                series={[{ key: 'logins', name: 'Logins', color: '#0EA5E9' }]}
              />
            </SectionCard>
          </Grid>
        </Grid>
      )}

      {/* Row action menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)} PaperProps={{ sx: { borderRadius: 2.5, minWidth: 200 } }}>
        <MenuItem onClick={() => setMenuAnchor(null)}><KeyIcon fontSize="small" sx={{ mr: 1.5 }} />Change role</MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)}><HistoryIcon fontSize="small" sx={{ mr: 1.5 }} />View activity</MenuItem>
        <MenuItem onClick={() => setMenuAnchor(null)} sx={{ color: 'error.main' }}><BlockIcon fontSize="small" sx={{ mr: 1.5 }} />Suspend access</MenuItem>
      </Menu>
    </Box>
  );
};

export default Admin;
