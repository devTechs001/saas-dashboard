import React from 'react';
import {
  Box, Typography, Grid, Stack, Chip, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Menu, MenuItem, TextField,
  InputAdornment, Tabs, Tab, Card, CardContent, List, ListItem, ListItemIcon,
  ListItemText, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, LinearProgress, Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAddAltOutlined';
import AdminPanelIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SecurityIcon from '@mui/icons-material/SecurityOutlined';
import HistoryIcon from '@mui/icons-material/HistoryOutlined';
import BlockIcon from '@mui/icons-material/BlockOutlined';
import KeyIcon from '@mui/icons-material/KeyOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import { useSelector } from 'react-redux';
import { PageHeader, SectionCard, KpiCard, AppAvatar, RoleChip, StatusChip, EmptyState } from '../components/ui';
import { DonutChart, BarTrendChart } from '../components/charts';
import { platformUsers } from '../data/mockData';
import { adminService, userService } from '../services';
import { formatRelative, formatDate, formatNumber } from '../utils/format';
import { hasRole, ROLES, permissionsForRole, ROLE_LABELS, PERMISSIONS } from '../utils/rbac';

const FALLBACK_AUDIT = [
  { id: 'aud_1', actor: 'Ava Mitchell', action: 'Updated role: Priya Nair → viewer', target: 'usr_5', time: '2026-11-03T08:40:00Z', ip: '197.232.60.14' },
  { id: 'aud_2', actor: 'System', action: 'API key “Local dev” created', target: 'key_3', time: '2026-10-28T12:00:00Z', ip: '—' },
  { id: 'aud_3', actor: 'Maya Chen', action: 'Invited Tom Becker (manager)', target: 'usr_8', time: '2026-10-25T15:22:00Z', ip: '102.68.76.9' },
  { id: 'aud_4', actor: 'Ava Mitchell', action: 'Enabled SSO enforcement', target: 'workspace', time: '2026-10-20T10:05:00Z', ip: '197.232.60.14' },
  { id: 'aud_5', actor: 'System', action: 'Blocked suspicious login (5 failed attempts)', target: 'usr_7', time: '2026-10-19T03:12:00Z', ip: '41.90.12.201' },
];

const FALLBACK_ROLE_MIX = [
  { name: 'Admins', value: 2, color: '#7C3AED' },
  { name: 'Managers', value: 3, color: '#4F46E5' },
  { name: 'Viewers', value: 3, color: '#0EA5E9' },
];

const Admin = () => {
  const user = useSelector((state) => state.auth.user);
  const isAdmin = hasRole(user, [ROLES.ADMIN]);
  const [tab, setTab] = React.useState(0);
  const [search, setSearch] = React.useState('');
  const [menu, setMenu] = React.useState({ anchor: null, user: null });
  const [notice, setNotice] = React.useState(null);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [invite, setInvite] = React.useState({ name: '', email: '', role: 'viewer' });
  const [dashUser, setDashUser] = React.useState(null); // "other user's dashboard" dialog
  const [dashData, setDashData] = React.useState(null);
  const [dashLoading, setDashLoading] = React.useState(false);

  // Real API data (falls back to demo data when the API is unreachable).
  const [users, setUsers] = React.useState([]);
  const [auditLogs, setAuditLogs] = React.useState([]);
  const [stats, setStats] = React.useState(null);
  const [offline, setOffline] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [u, a, s] = await Promise.all([
        adminService.getUsers({ limit: 50 }),
        adminService.getAuditLogs({ limit: 25 }),
        adminService.getStats(),
      ]);
      setUsers(u?.data?.users || []);
      setAuditLogs(a?.data?.logs || []);
      setStats(s?.data || null);
      setOffline(false);
    } catch {
      setUsers(platformUsers.map((p) => ({ ...p, isActive: true, createdAt: '2026-06-14' })));
      setAuditLogs(FALLBACK_AUDIT);
      setStats(null);
      setOffline(true);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => { loadData(); }, [loadData]);

  const filtered = users.filter((u) =>
    `${u.name} ${u.email} ${u.title || ''}`.toLowerCase().includes(search.toLowerCase())
  );

  const roleMix = stats?.roleMix || FALLBACK_ROLE_MIX;

  const handleRoleChange = async (target, role) => {
    setMenu({ anchor: null, user: null });
    try {
      await adminService.updateUser(target.id, { role });
      setNotice({ type: 'success', text: `${target.name} is now ${role}` });
      loadData();
    } catch (e) {
      setNotice({ type: 'error', text: e?.response?.data?.message || 'Could not update role' });
    }
  };

  const handleToggleActive = async (target) => {
    setMenu({ anchor: null, user: null });
    try {
      await adminService.updateUser(target.id, { isActive: target.isActive === false });
      setNotice({ type: 'success', text: `${target.name} ${target.isActive === false ? 'reactivated' : 'suspended'}` });
      loadData();
    } catch (e) {
      setNotice({ type: 'error', text: e?.response?.data?.message || 'Could not update status' });
    }
  };

  const handleDelete = async (target) => {
    setMenu({ anchor: null, user: null });
    try {
      await adminService.deleteUser(target.id);
      setNotice({ type: 'success', text: `${target.name} deleted` });
      loadData();
    } catch (e) {
      setNotice({ type: 'error', text: e?.response?.data?.message || 'Could not delete user' });
    }
  };

  const handleInvite = async () => {
    if (!invite.name.trim() || !invite.email.trim()) return;
    try {
      await adminService.inviteUser(invite);
      setInviteOpen(false);
      setInvite({ name: '', email: '', role: 'viewer' });
      setNotice({ type: 'success', text: 'Invitation sent' });
      loadData();
    } catch (e) {
      setNotice({ type: 'error', text: e?.response?.data?.message || 'Could not invite user' });
    }
  };

  // "Other users' dashboards" — fetch and show any user's dashboard summary.
  const openUserDashboard = async (target) => {
    setMenu({ anchor: null, user: null });
    setDashUser(target);
    setDashLoading(true);
    setDashData(null);
    try {
      const res = await userService.getDashboard(target.id);
      setDashData(res?.data || null);
    } catch {
      setDashData(null);
    }
    setDashLoading(false);
  };

  return (
    <Box>
      <PageHeader
        title="Admin Console"
        subtitle="Manage users, roles, security, and workspace governance."
        actions={[
          isAdmin
            ? <Button key="invite" variant="contained" startIcon={<PersonAddIcon />} onClick={() => setInviteOpen(true)} sx={{ borderRadius: 2.5 }}>Invite user</Button>
            : <Chip key="ro" label="Read-only — admin access required" variant="outlined" color="warning" />,
        ]}
      />

      {offline && (
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2.5 }}>
          API unreachable — showing cached demo data. Admin actions are disabled until the server is back.
        </Alert>
      )}
      {notice && (
        <Alert severity={notice.type} sx={{ mb: 2.5, borderRadius: 2.5 }} onClose={() => setNotice(null)}>
          {notice.text}
        </Alert>
      )}

      {/* KPIs */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Total users" value={stats?.users?.total ?? users.length} delta={8.4} hint="vs last month" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Active now" value={stats?.users?.active ?? users.filter((u) => u.isActive !== false).length} delta={2.1} hint={`${stats?.users?.suspended ?? 0} suspended`} />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Admin roles" value={stats?.users?.admins ?? users.filter((u) => u.role === 'admin').length} hint="least-privilege enforced" />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <KpiCard label="Security score" value={`${stats?.security?.score ?? 92} / 100`} delta={4} hint="SSO + MFA enabled" />
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
              subtitle={`${filtered.length} of ${users.length} users`}
              contentSx={{ pt: 1 }}
              action={
                <TextField
                  size="small" placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)}
                  InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
                  sx={{ width: 240, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
                />
              }
            >
              {loading && <LinearProgress sx={{ borderRadius: 2 }} />}
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
                        <TableCell>
                          {u.isActive === false
                            ? <Chip size="small" label="Suspended" color="error" variant="outlined" />
                            : <StatusChip status={u.status || 'online'} />}
                        </TableCell>
                        <TableCell align="right">{u.createdAt ? formatDate(u.createdAt) : '—'}</TableCell>
                        <TableCell align="right">
                          <Tooltip title="More actions">
                            <IconButton size="small" onClick={(e) => setMenu({ anchor: e.currentTarget, user: u })} disabled={!isAdmin}>
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
                <DonutChart data={roleMix} height={220} innerRadius={56} centerValue={users.length} centerLabel="seats" />
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
            <SectionCard
              title="Audit log"
              subtitle="Immutable record of security-relevant actions"
              contentSx={{ pt: 1 }}
              action={<Button size="small" variant="outlined" startIcon={<HistoryIcon />} onClick={loadData} sx={{ borderRadius: 2.5 }}>Refresh</Button>}
            >
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
                    {auditLogs.map((r) => (
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
              {auditLogs.length === 0 && <EmptyState title="No audit entries" message="Security-relevant actions will appear here." />}
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
                  { label: 'Single sign-on (SSO)', desc: 'SAML / OIDC enforced for all members', enabled: stats?.security?.sso ?? true },
                  { label: 'Multi-factor authentication', desc: 'Required for admins', enabled: stats?.security?.mfa ?? true },
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
                data={stats?.logins || [
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
      <Menu anchorEl={menu.anchor} open={Boolean(menu.anchor)} onClose={() => setMenu({ anchor: null, user: null })} PaperProps={{ sx: { borderRadius: 2.5, minWidth: 220 } }}>
        <MenuItem disabled sx={{ opacity: 1 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={700}>Change role</Typography>
        </MenuItem>
        {Object.values(ROLES).map((r) => (
          <MenuItem key={r} onClick={() => handleRoleChange(menu.user, r)} disabled={menu.user?.role === r} sx={{ pl: 3 }}>
            {ROLE_LABELS[r]} {menu.user?.role === r ? '· current' : ''}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => openUserDashboard(menu.user)}>
          <DashboardIcon fontSize="small" sx={{ mr: 1.5 }} />View dashboard
        </MenuItem>
        <MenuItem onClick={() => handleToggleActive(menu.user)}>
          <BlockIcon fontSize="small" sx={{ mr: 1.5 }} />{menu.user?.isActive === false ? 'Reactivate access' : 'Suspend access'}
        </MenuItem>
        <MenuItem onClick={() => handleDelete(menu.user)} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />Delete user
        </MenuItem>
      </Menu>

      {/* Invite dialog */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={800}>Invite user</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Full name" fullWidth value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} />
            <TextField label="Email address" fullWidth value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
            <TextField select label="Role" fullWidth value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>
              {Object.values(ROLES).map((r) => <MenuItem key={r} value={r}>{ROLE_LABELS[r]}</MenuItem>)}
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setInviteOpen(false)} sx={{ borderRadius: 2.5 }}>Cancel</Button>
          <Button variant="contained" onClick={handleInvite} disabled={!invite.name.trim() || !invite.email.trim()} sx={{ borderRadius: 2.5 }}>Send invite</Button>
        </DialogActions>
      </Dialog>

      {/* "Other user's dashboard" dialog */}
      <Dialog open={Boolean(dashUser)} onClose={() => setDashUser(null)} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={800}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <AppAvatar name={dashUser?.name || '?'} size={38} />
            <Box>
              <Typography variant="h6" fontWeight={800}>{dashUser?.name}</Typography>
              <Typography variant="caption" color="text.secondary">{dashUser?.email} · {dashUser?.role}</Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {dashLoading && <LinearProgress sx={{ borderRadius: 2, my: 2 }} />}
          {!dashLoading && !dashData && (
            <Alert severity="warning" sx={{ borderRadius: 2.5, my: 1 }}>Could not load this user's dashboard — API unreachable.</Alert>
          )}
          {!dashLoading && dashData && (
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}><KpiCard label="Tasks done" value={formatNumber(dashData.kpis?.tasksDone ?? 0)} /></Grid>
                <Grid item xs={6} sm={3}><KpiCard label="Active tasks" value={formatNumber(dashData.kpis?.activeTasks ?? 0)} /></Grid>
                <Grid item xs={6} sm={3}><KpiCard label="Workspaces" value={formatNumber(dashData.kpis?.workspaces ?? 0)} /></Grid>
                <Grid item xs={6} sm={3}><KpiCard label="Completion" value={`${dashData.kpis?.completionRate ?? 0}%`} /></Grid>
              </Grid>
              <SectionCard title="Assigned tasks" contentSx={{ pt: 1 }}>
                <List disablePadding>
                  {(dashData.tasks?.items || []).map((t) => (
                    <ListItem key={t.id} disablePadding sx={{ py: 0.9 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}><CheckCircleIcon fontSize="small" color={t.status === 'done' ? 'success' : 'disabled'} /></ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="body2" fontWeight={600}>{t.title}</Typography>}
                        secondary={`${t.workspaceName || ''} · ${t.status}${t.dueDate ? ` · due ${formatDate(t.dueDate, { month: 'short', day: 'numeric' })}` : ''}`}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                      <Chip size="small" label={t.priority} color={t.priority === 'high' ? 'error' : t.priority === 'medium' ? 'warning' : 'default'} variant="outlined" />
                    </ListItem>
                  ))}
                  {(dashData.tasks?.items || []).length === 0 && (
                    <EmptyState title="No assigned tasks" message="This user has no tasks right now." />
                  )}
                </List>
              </SectionCard>
              <SectionCard title="Workspaces" contentSx={{ pt: 1 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {(dashData.memberships || []).map((m) => (
                    <Chip key={m.workspaceId} label={`${m.name} · ${m.role}`} variant="outlined" sx={{ borderRadius: 2 }} />
                  ))}
                  {(dashData.memberships || []).length === 0 && (
                    <Typography variant="body2" color="text.secondary">No workspace memberships.</Typography>
                  )}
                </Stack>
              </SectionCard>
              <SectionCard title="Recent activity" contentSx={{ pt: 1 }}>
                <List disablePadding>
                  {(dashData.activity || []).map((a) => (
                    <ListItem key={a.id} disablePadding sx={{ py: 0.8 }}>
                      <ListItemText
                        primary={<Typography variant="body2">{a.action} <b>{a.target}</b></Typography>}
                        secondary={formatRelative(a.time)}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                  {(dashData.activity || []).length === 0 && (
                    <Typography variant="body2" color="text.secondary">No recent activity.</Typography>
                  )}
                </List>
              </SectionCard>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDashUser(null)} variant="contained" sx={{ borderRadius: 2.5 }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Admin;
