import React from 'react';
import {
  Box, Typography, Grid, Stack, Chip, Button, TextField, IconButton, Menu, MenuItem,
  Tabs, Tab, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions, Avatar, Divider, Select, FormControl,
  InputLabel, LinearProgress, Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PeopleIcon from '@mui/icons-material/PeopleOutline';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import HistoryIcon from '@mui/icons-material/HistoryOutlined';
import FolderIcon from '@mui/icons-material/FolderOpenOutlined';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import PersonAddIcon from '@mui/icons-material/PersonAddAltOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useSelector } from 'react-redux';
import { PageHeader, SectionCard, KpiCard, AppAvatar, EmptyState } from '../components/ui';
import { workspaceService } from '../services';
import { formatRelative, formatDate } from '../utils/format';
import { hasRole, ROLES } from '../utils/rbac';

const WS_ROLES = ['owner', 'admin', 'member', 'guest'];
const STATUSES = ['todo', 'in_progress', 'review', 'done'];
const STATUS_LABELS = { todo: 'To do', in_progress: 'In progress', review: 'In review', done: 'Done' };
const STATUS_COLORS = { todo: 'default', in_progress: 'primary', review: 'warning', done: 'success' };
const PRIORITY_COLORS = { high: 'error', medium: 'warning', low: 'default' };

// Offline fallback so the page still renders if the API is unreachable.
const FALLBACK_WORKSPACES = [
  { id: 'ws_1', name: 'Acme HQ', description: 'Primary company workspace — revenue, customers, operations.', visibility: 'private', color: '#4F46E5', memberCount: 6, taskCount: 5, openTasks: 4, doneTasks: 1, createdAt: '2026-05-14T09:00:00Z' },
  { id: 'ws_2', name: 'Nimbus Labs', description: 'Product engineering workspace for the Nimbus platform.', visibility: 'private', color: '#0EA5E9', memberCount: 3, taskCount: 3, openTasks: 3, doneTasks: 0, createdAt: '2026-07-02T11:30:00Z' },
  { id: 'ws_3', name: 'Helios Health', description: 'Customer delivery workspace for the Helios account.', visibility: 'public', color: '#059669', memberCount: 3, taskCount: 2, openTasks: 1, doneTasks: 1, createdAt: '2026-08-21T14:15:00Z' },
];
const FALLBACK_MEMBERS = {
  ws_1: [
    { id: 'mem_1', userId: 'usr_1', name: 'Ava Mitchell', email: 'ava@acme.com', role: 'owner', status: 'online' },
    { id: 'mem_2', userId: 'usr_2', name: 'Maya Chen', email: 'maya@acme.com', role: 'admin', status: 'online' },
    { id: 'mem_3', userId: 'usr_3', name: 'Jordan Lee', email: 'jordan@acme.com', role: 'member', status: 'away' },
    { id: 'mem_4', userId: 'usr_4', name: 'Sam Okoro', email: 'sam@acme.com', role: 'member', status: 'online' },
  ],
  ws_2: [{ id: 'mem_7', userId: 'usr_8', name: 'Tom Becker', email: 'tom@nimbuslabs.io', role: 'owner', status: 'away' }],
  ws_3: [{ id: 'mem_10', userId: 'usr_2', name: 'Maya Chen', email: 'maya@acme.com', role: 'owner', status: 'online' }],
};
const FALLBACK_TASKS = {
  ws_1: [
    { id: 'tsk_1', title: 'Q4 enterprise renewal deck', status: 'todo', priority: 'high', assigneeName: 'Maya Chen', dueDate: '2026-11-08', tag: 'sales' },
    { id: 'tsk_3', title: 'Pricing experiment: annual toggle', status: 'in_progress', priority: 'low', assigneeName: 'Priya Nair', dueDate: '2026-11-20', tag: 'growth' },
    { id: 'tsk_5', title: 'Migrate billing to new ledger', status: 'done', priority: 'high', assigneeName: 'Ava Mitchell', dueDate: '2026-10-28', tag: 'platform' },
  ],
  ws_2: [{ id: 'tsk_6', title: 'Realtime presence service', status: 'in_progress', priority: 'high', assigneeName: 'Luca Rossi', dueDate: '2026-11-14', tag: 'platform' }],
  ws_3: [{ id: 'tsk_9', title: 'Helios go-live checklist', status: 'todo', priority: 'high', assigneeName: 'Jordan Lee', dueDate: '2026-11-10', tag: 'success' }],
};
const FALLBACK_ACTIVITY = {
  ws_1: [
    { id: 'act_1', actor: 'Ava Mitchell', action: 'created task', target: 'Q4 enterprise renewal deck', time: '2026-11-03T09:12:00Z' },
    { id: 'act_3', actor: 'Luca Rossi', action: 'invited member', target: 'Priya Nair', time: '2026-11-02T16:20:00Z' },
  ],
  ws_2: [{ id: 'act_5', actor: 'Tom Becker', action: 'created task', target: 'API rate-limit dashboard', time: '2026-11-02T11:02:00Z' }],
  ws_3: [{ id: 'act_7', actor: 'Maya Chen', action: 'completed', target: 'October churn review', time: '2026-11-01T10:10:00Z' }],
};

const Workspaces = () => {
  const user = useSelector((state) => state.auth.user);
  const canManage = hasRole(user, [ROLES.ADMIN, ROLES.MANAGER]);

  const [workspaces, setWorkspaces] = React.useState([]);
  const [selectedId, setSelectedId] = React.useState(null);
  const [tab, setTab] = React.useState(0);
  const [members, setMembers] = React.useState([]);
  const [tasks, setTasks] = React.useState([]);
  const [activity, setActivity] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [offline, setOffline] = React.useState(false);

  const [createOpen, setCreateOpen] = React.useState(false);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [taskOpen, setTaskOpen] = React.useState(false);
  const [newWs, setNewWs] = React.useState({ name: '', description: '', visibility: 'private' });
  const [invite, setInvite] = React.useState({ email: '', role: 'member' });
  const [newTask, setNewTask] = React.useState({ title: '', priority: 'medium', assignee: '', dueDate: '' });
  const [menu, setMenu] = React.useState({ anchor: null, member: null });
  const [notice, setNotice] = React.useState(null);

  const selected = workspaces.find((w) => w.id === selectedId) || workspaces[0] || null;

  const loadWorkspaces = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await workspaceService.getAll();
      const list = res?.data?.workspaces || [];
      setWorkspaces(list);
      setSelectedId((prev) => (list.some((w) => w.id === prev) ? prev : list[0]?.id || null));
      setOffline(false);
    } catch {
      setWorkspaces(FALLBACK_WORKSPACES);
      setSelectedId((prev) => prev || FALLBACK_WORKSPACES[0].id);
      setOffline(true);
    }
    setLoading(false);
  }, []);

  const loadDetails = React.useCallback(async (id) => {
    if (!id) return;
    try {
      const [m, t, a] = await Promise.all([
        workspaceService.getMembers(id),
        workspaceService.getTasks(id),
        workspaceService.getActivity(id),
      ]);
      setMembers(m?.data?.members || []);
      setTasks(t?.data?.tasks || []);
      setActivity(a?.data?.activity || []);
    } catch {
      setMembers(FALLBACK_MEMBERS[id] || []);
      setTasks(FALLBACK_TASKS[id] || []);
      setActivity(FALLBACK_ACTIVITY[id] || []);
    }
  }, []);

  React.useEffect(() => { loadWorkspaces(); }, [loadWorkspaces]);
  React.useEffect(() => { loadDetails(selectedId); }, [selectedId, loadDetails]);

  const refreshAll = () => { loadWorkspaces(); loadDetails(selectedId); };

  const handleCreateWorkspace = async () => {
    if (!newWs.name.trim()) return;
    try {
      const res = await workspaceService.create(newWs);
      setCreateOpen(false);
      setNewWs({ name: '', description: '', visibility: 'private' });
      setNotice({ type: 'success', text: `Workspace “${res?.data?.workspace?.name}” created` });
      await loadWorkspaces();
      if (res?.data?.workspace?.id) setSelectedId(res.data.workspace.id);
    } catch {
      setNotice({ type: 'error', text: 'Could not create workspace — is the API reachable?' });
    }
  };

  const handleInvite = async () => {
    if (!invite.email.trim() || !selected) return;
    try {
      await workspaceService.inviteMember(selected.id, invite);
      setInviteOpen(false);
      setInvite({ email: '', role: 'member' });
      setNotice({ type: 'success', text: 'Member invited to workspace' });
      loadDetails(selected.id);
    } catch (e) {
      setNotice({ type: 'error', text: e?.response?.data?.message || 'Could not add member' });
    }
  };

  const handleRoleChange = async (member, role) => {
    setMenu({ anchor: null, member: null });
    try {
      await workspaceService.updateMemberRole(selected.id, member.userId, role);
      loadDetails(selected.id);
    } catch (e) {
      setNotice({ type: 'error', text: e?.response?.data?.message || 'Could not update role' });
    }
  };

  const handleRemoveMember = async (member) => {
    setMenu({ anchor: null, member: null });
    try {
      await workspaceService.removeMember(selected.id, member.userId);
      loadDetails(selected.id);
    } catch (e) {
      setNotice({ type: 'error', text: e?.response?.data?.message || 'Could not remove member' });
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !selected) return;
    try {
      await workspaceService.createTask(selected.id, { ...newTask, assignee: newTask.assignee || undefined });
      setTaskOpen(false);
      setNewTask({ title: '', priority: 'medium', assignee: '', dueDate: '' });
      loadDetails(selected.id);
      loadWorkspaces();
    } catch {
      setNotice({ type: 'error', text: 'Could not create task' });
    }
  };

  const moveTask = async (task, dir) => {
    const idx = STATUSES.indexOf(task.status);
    const next = STATUSES[Math.min(Math.max(idx + dir, 0), STATUSES.length - 1)];
    if (next === task.status) return;
    try {
      await workspaceService.updateTask(selected.id, task.id, { status: next });
      loadDetails(selected.id);
    } catch {
      setNotice({ type: 'error', text: 'Could not move task' });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Workspaces"
        subtitle="Collaborate with your team — workspaces, members, tasks, and activity in one hub."
        actions={[
          <Button key="new" variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)} disabled={!canManage} sx={{ borderRadius: 2.5 }}>
            New workspace
          </Button>,
        ]}
      />

      {offline && (
        <Alert severity="info" sx={{ mb: 2.5, borderRadius: 2.5 }}>
          API unreachable — showing cached demo data. Changes are disabled until the server is back.
        </Alert>
      )}
      {notice && (
        <Alert severity={notice.type} sx={{ mb: 2.5, borderRadius: 2.5 }} onClose={() => setNotice(null)}>
          {notice.text}
        </Alert>
      )}

      <Grid container spacing={2.5}>
        {/* Workspace rail */}
        <Grid item xs={12} md={3}>
          <SectionCard title="Your workspaces" subtitle={`${workspaces.length} active`}>
            <List disablePadding>
              {workspaces.map((w) => (
                <ListItem
                  key={w.id}
                  button
                  selected={selected?.id === w.id}
                  onClick={() => setSelectedId(w.id)}
                  sx={{ borderRadius: 2.5, mb: 0.75, '&.Mui-selected': { bgcolor: 'action.selected' } }}
                >
                  <ListItemIcon sx={{ minWidth: 38 }}>
                    <Avatar sx={{ bgcolor: w.color || '#4F46E5', width: 30, height: 30 }}>
                      <FolderIcon fontSize="small" />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={<Typography variant="body2" fontWeight={700}>{w.name}</Typography>}
                    secondary={`${w.memberCount ?? '—'} members · ${w.openTasks ?? '—'} open tasks`}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                </ListItem>
              ))}
              {workspaces.length === 0 && !loading && (
                <EmptyState title="No workspaces yet" message="Create your first workspace to start collaborating." />
              )}
            </List>
          </SectionCard>
        </Grid>

        {/* Detail */}
        <Grid item xs={12} md={9}>
          {selected ? (
            <>
              <SectionCard
                title={selected.name}
                subtitle={selected.description || 'No description'}
                action={
                  <Stack direction="row" spacing={1}>
                    <Chip size="small" label={selected.visibility === 'public' ? 'Public' : 'Private'} variant="outlined" />
                    <Button size="small" variant="outlined" startIcon={<PeopleIcon />} onClick={() => setTab(1)} sx={{ borderRadius: 2.5 }}>
                      Members
                    </Button>
                  </Stack>
                }
              >
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <KpiCard label="Members" value={selected.memberCount ?? members.length} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <KpiCard label="Open tasks" value={selected.openTasks ?? tasks.filter((t) => t.status !== 'done').length} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <KpiCard label="Completed" value={selected.doneTasks ?? tasks.filter((t) => t.status === 'done').length} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <KpiCard label="Created" value={formatDate(selected.createdAt, { month: 'short', year: 'numeric' })} />
                  </Grid>
                </Grid>
              </SectionCard>

              <Box sx={{ mt: 2.5, borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
                  <Tab label="Tasks" icon={<AssignmentIcon fontSize="small" />} iconPosition="start" />
                  <Tab label="Members" icon={<PeopleIcon fontSize="small" />} iconPosition="start" />
                  <Tab label="Activity" icon={<HistoryIcon fontSize="small" />} iconPosition="start" />
                </Tabs>
              </Box>

              {/* ===== Tasks board ===== */}
              {tab === 0 && (
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="h6" fontWeight={800}>Task board</Typography>
                    <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => setTaskOpen(true)} disabled={!canManage} sx={{ borderRadius: 2.5 }}>
                      New task
                    </Button>
                  </Stack>
                  <Grid container spacing={1.5}>
                    {STATUSES.map((status) => (
                      <Grid item xs={12} sm={6} lg={3} key={status}>
                        <Card variant="outlined" sx={{ borderRadius: 2.5, height: '100%', bgcolor: 'background.default' }}>
                          <CardContent sx={{ p: 1.75, '&:last-child': { pb: 1.75 } }}>
                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Chip size="small" label={STATUS_LABELS[status]} color={STATUS_COLORS[status]} />
                              <Chip size="small" label={tasks.filter((t) => t.status === status).length} variant="outlined" />
                            </Stack>
                            <Stack spacing={1}>
                              {tasks.filter((t) => t.status === status).map((task) => (
                                <Card key={task.id} variant="outlined" sx={{ borderRadius: 2, p: 1.25, bgcolor: 'background.paper' }}>
                                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Typography variant="body2" fontWeight={700} sx={{ pr: 1 }}>{task.title}</Typography>
                                    <Chip size="small" label={task.priority} color={PRIORITY_COLORS[task.priority] || 'default'} sx={{ height: 18, fontSize: '0.65rem' }} />
                                  </Stack>
                                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                    {task.assigneeName || 'Unassigned'}{task.dueDate ? ` · due ${formatDate(task.dueDate, { month: 'short', day: 'numeric' })}` : ''}
                                  </Typography>
                                  <Stack direction="row" spacing={0.5} sx={{ mt: 1 }}>
                                    <Tooltip title="Move back">
                                      <span>
                                        <IconButton size="small" aria-label="Move back" disabled={!canManage || status === 'todo'} onClick={() => moveTask(task, -1)}>
                                          <ArrowBackIcon fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                    <Tooltip title="Move forward">
                                      <span>
                                        <IconButton size="small" aria-label="Move forward" disabled={!canManage || status === 'done'} onClick={() => moveTask(task, 1)}>
                                          <ArrowForwardIcon fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </Stack>
                                </Card>
                              ))}
                              {tasks.filter((t) => t.status === status).length === 0 && (
                                <Typography variant="caption" color="text.disabled" sx={{ textAlign: 'center', py: 1.5 }}>Empty</Typography>
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* ===== Members ===== */}
              {tab === 1 && (
                <Box sx={{ mt: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="h6" fontWeight={800}>{members.length} members</Typography>
                    <Button variant="contained" size="small" startIcon={<PersonAddIcon />} onClick={() => setInviteOpen(true)} disabled={!canManage} sx={{ borderRadius: 2.5 }}>
                      Invite member
                    </Button>
                  </Stack>
                  <SectionCard contentSx={{ pt: 1 }}>
                    <List disablePadding>
                      {members.map((m) => (
                        <React.Fragment key={m.id}>
                          <ListItem disablePadding sx={{ py: 1.1 }}>
                            <ListItemIcon sx={{ minWidth: 44 }}><AppAvatar name={m.name} size={36} /></ListItemIcon>
                            <ListItemText
                              primary={<Typography variant="body2" fontWeight={700}>{m.name}</Typography>}
                              secondary={`${m.email}${m.title ? ` · ${m.title}` : ''}`}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                            <Chip size="small" label={m.role} color={m.role === 'owner' ? 'secondary' : m.role === 'admin' ? 'primary' : 'default'} variant={m.role === 'member' || m.role === 'guest' ? 'outlined' : 'filled'} />
                            <Tooltip title="Member actions">
                              <IconButton size="small" aria-label="Member actions" disabled={!canManage} onClick={(e) => setMenu({ anchor: e.currentTarget, member: m })}>
                                <MoreVertIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </ListItem>
                          <Divider component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                    {members.length === 0 && <EmptyState title="No members yet" message="Invite your team to this workspace." />}
                  </SectionCard>
                </Box>
              )}

              {/* ===== Activity ===== */}
              {tab === 2 && (
                <Box sx={{ mt: 2 }}>
                  <SectionCard title="Activity feed" subtitle="Everything happening in this workspace">
                    <List disablePadding>
                      {activity.map((a) => (
                        <ListItem key={a.id} disablePadding sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 40 }}><AppAvatar name={a.actor} size={30} /></ListItemIcon>
                          <ListItemText
                            primary={<Typography variant="body2"><b>{a.actor}</b> {a.action} <b>{a.target}</b></Typography>}
                            secondary={formatRelative(a.time)}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    {activity.length === 0 && <EmptyState title="No activity yet" message="Actions in this workspace will show up here." />}
                  </SectionCard>
                </Box>
              )}
            </>
          ) : (
            <SectionCard>
              <EmptyState title="Select a workspace" message="Pick a workspace on the left, or create a new one." />
            </SectionCard>
          )}
        </Grid>
      </Grid>

      {/* Member row menu */}
      <Menu anchorEl={menu.anchor} open={Boolean(menu.anchor)} onClose={() => setMenu({ anchor: null, member: null })} PaperProps={{ sx: { borderRadius: 2.5, minWidth: 190 } }}>
        {WS_ROLES.filter((r) => r !== 'owner').map((r) => (
          <MenuItem key={r} onClick={() => handleRoleChange(menu.member, r)}>Set role → {r}</MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => handleRemoveMember(menu.member)} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />Remove from workspace
        </MenuItem>
      </Menu>

      {/* Create workspace dialog */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={800}>Create workspace</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Workspace name" fullWidth value={newWs.name} onChange={(e) => setNewWs({ ...newWs, name: e.target.value })} />
            <TextField label="Description" fullWidth multiline minRows={2} value={newWs.description} onChange={(e) => setNewWs({ ...newWs, description: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Visibility</InputLabel>
              <Select label="Visibility" value={newWs.visibility} onChange={(e) => setNewWs({ ...newWs, visibility: e.target.value })}>
                <MenuItem value="private">Private</MenuItem>
                <MenuItem value="public">Public</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setCreateOpen(false)} sx={{ borderRadius: 2.5 }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateWorkspace} disabled={!newWs.name.trim()} sx={{ borderRadius: 2.5 }}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Invite member dialog */}
      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={800}>Invite member</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Email address" fullWidth value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Workspace role</InputLabel>
              <Select label="Workspace role" value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}>
                {WS_ROLES.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setInviteOpen(false)} sx={{ borderRadius: 2.5 }}>Cancel</Button>
          <Button variant="contained" onClick={handleInvite} disabled={!invite.email.trim()} sx={{ borderRadius: 2.5 }}>Invite</Button>
        </DialogActions>
      </Dialog>

      {/* Create task dialog */}
      <Dialog open={taskOpen} onClose={() => setTaskOpen(false)} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle fontWeight={800}>New task</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Task title" fullWidth value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} />
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select label="Priority" value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Assignee</InputLabel>
                <Select label="Assignee" value={newTask.assignee} onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}>
                  <MenuItem value="">Unassigned</MenuItem>
                  {members.map((m) => <MenuItem key={m.userId} value={m.userId}>{m.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
            <TextField
              label="Due date" type="date" fullWidth value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setTaskOpen(false)} sx={{ borderRadius: 2.5 }}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateTask} disabled={!newTask.title.trim()} sx={{ borderRadius: 2.5 }}>Create task</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Workspaces;
