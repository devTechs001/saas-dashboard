/**
 * Admin console API — platform stats, user governance, audit log,
 * and per-user dashboard summaries ("view any user's dashboard").
 */
import { memoryStore as store } from '../store/memoryStore.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/apiError.js';

const VALID_ROLES = ['admin', 'manager', 'viewer'];

export const getStats = catchAsync(async (req, res) => {
  const users = store.db.users;
  const byRole = (role) => users.filter((u) => u.role === role).length;
  const active = users.filter((u) => u.isActive !== false);
  const weekAgo = Date.now() - 7 * 86400000;
  const signups = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(Date.now() - (6 - i) * 86400000);
    return {
      day: day.toLocaleDateString('en-US', { weekday: 'short' }),
      signups: 2 + ((i * 5 + 3) % 9),
    };
  });
  const logins = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(Date.now() - (6 - i) * 86400000);
    return {
      day: day.toLocaleDateString('en-US', { weekday: 'short' }),
      logins: [42, 51, 47, 58, 44, 12, 9][i],
    };
  });
  res.json(
    ApiResponse.success({
      users: {
        total: users.length,
        active: active.length,
        admins: byRole('admin'),
        managers: byRole('manager'),
        viewers: byRole('viewer'),
        suspended: users.filter((u) => u.isActive === false).length,
        newThisWeek: users.filter((u) => new Date(u.createdAt).getTime() > weekAgo).length,
      },
      workspaces: store.db.workspaces.length,
      tasks: {
        total: store.db.tasks.length,
        open: store.db.tasks.filter((t) => t.status !== 'done').length,
        done: store.db.tasks.filter((t) => t.status === 'done').length,
      },
      security: {
        score: 92,
        sso: true,
        mfa: true,
        lastRotation: '2026-10-01T00:00:00Z',
        blockedAttempts: 5,
      },
      revenue: { mrr: 84230, arr: 1010760, delta: 12.4 },
      roleMix: [
        { name: 'Admins', value: byRole('admin'), color: '#7C3AED' },
        { name: 'Managers', value: byRole('manager'), color: '#4F46E5' },
        { name: 'Viewers', value: byRole('viewer'), color: '#0EA5E9' },
      ],
      signups,
      logins,
    })
  );
});

export const listUsers = catchAsync(async (req, res) => {
  const { search = '', role = '', status = '' } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const q = String(search).toLowerCase();
  let users = store.db.users.map(store.publicUser);
  if (q) users = users.filter((u) => `${u.name} ${u.email} ${u.title}`.toLowerCase().includes(q));
  if (role) users = users.filter((u) => u.role === role);
  if (status) users = users.filter((u) => (status === 'active' ? u.isActive !== false : u.isActive === false));
  const total = users.length;
  const start = (page - 1) * limit;
  res.json(ApiResponse.success({ users: users.slice(start, start + limit), total, page, limit }));
});

export const updateUser = catchAsync(async (req, res) => {
  const user = store.findUser(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  const { role, isActive, title, status, name } = req.body;
  const actor = req.user?.name || 'Admin';
  if (role !== undefined) {
    if (!VALID_ROLES.includes(role)) throw ApiError.badRequest(`Role must be one of: ${VALID_ROLES.join(', ')}`);
    const prev = user.role;
    user.role = role;
    user.permissions = [...(role === 'admin' ? ['read', 'write', 'delete', 'admin'] : role === 'manager' ? ['read', 'write'] : ['read'])];
    store.logAudit({ actor, action: `Updated role: ${user.name} (${prev} → ${role})`, target: user.id, type: 'role' });
  }
  if (isActive !== undefined) {
    user.isActive = Boolean(isActive);
    store.logAudit({ actor, action: `${user.isActive ? 'Reactivated' : 'Suspended'} ${user.name}`, target: user.id, type: 'status' });
  }
  if (status !== undefined && ['online', 'away', 'offline'].includes(status)) user.status = status;
  if (name !== undefined && String(name).trim()) user.name = String(name).trim().slice(0, 120);
  if (title !== undefined) user.title = String(title).slice(0, 120);
  res.json(ApiResponse.success({ user: store.publicUser(user) }, 'User updated'));
});

export const deleteUser = catchAsync(async (req, res) => {
  const user = store.findUser(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  if (req.user?.id === user.id) throw ApiError.badRequest('You cannot delete your own account');
  store.db.users = store.db.users.filter((u) => u.id !== user.id);
  store.db.members = store.db.members.filter((m) => m.userId !== user.id);
  store.logAudit({ actor: req.user?.name || 'Admin', action: `Deleted user ${user.name}`, target: user.id, type: 'status' });
  res.json(ApiResponse.success({ deleted: user.id }, 'User deleted'));
});

export const inviteUser = catchAsync(async (req, res) => {
  const { name, email, role = 'viewer', title = '' } = req.body;
  if (!name || !email) throw ApiError.badRequest('Name and email are required');
  if (!VALID_ROLES.includes(role)) throw ApiError.badRequest(`Role must be one of: ${VALID_ROLES.join(', ')}`);
  if (store.findUserByEmail(email)) throw ApiError.conflict('A user with this email already exists');
  const user = {
    id: store.uid('usr'),
    name: String(name).trim().slice(0, 120),
    email: String(email).toLowerCase().trim(),
    role,
    title,
    status: 'offline',
    location: '',
    permissions: [...(role === 'admin' ? ['read', 'write', 'delete', 'admin'] : role === 'manager' ? ['read', 'write'] : ['read'])],
    tenantId: 'default',
    isActive: true,
    tasksDone: 0,
    createdAt: store.now(),
    lastLogin: null,
  };
  store.db.users.push(user);
  store.logAudit({ actor: req.user?.name || 'Admin', action: `Invited ${user.name} (${role})`, target: user.id, ip: req.ip || '—', type: 'invite' });
  res.status(201).json(ApiResponse.success({ user: store.publicUser(user) }, 'User invited', 201));
});

export const listAuditLogs = catchAsync(async (req, res) => {
  const { search = '', type = '' } = req.query;
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const q = String(search).toLowerCase();
  let logs = store.db.auditLogs;
  if (q) logs = logs.filter((l) => `${l.actor} ${l.action} ${l.target}`.toLowerCase().includes(q));
  if (type) logs = logs.filter((l) => l.type === type);
  const total = logs.length;
  const start = (page - 1) * limit;
  res.json(ApiResponse.success({ logs: logs.slice(start, start + limit), total, page, limit }));
});

/** "Other users' dashboards" — a per-user dashboard summary (admin or self). */
export const getUserDashboard = catchAsync(async (req, res) => {
  const user = store.findUser(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  const isSelf = req.user?.id === user.id;
  const isAdmin = req.user?.role === 'admin';
  if (!isSelf && !isAdmin) throw ApiError.forbidden('Only admins can view other users dashboards');

  const memberships = store.db.members
    .filter((m) => m.userId === user.id)
    .map((m) => {
      const ws = store.db.workspaces.find((w) => w.id === m.workspaceId);
      return { workspaceId: m.workspaceId, name: ws?.name || 'Unknown', role: m.role };
    });
  const myTasks = store.db.tasks
    .filter((t) => t.assignee === user.id)
    .map((t) => ({ ...t, workspaceName: store.db.workspaces.find((w) => w.id === t.workspaceId)?.name || '' }));
  const activity = store.db.activity.filter((a) => a.actor === user.name).slice(0, 10);

  res.json(
    ApiResponse.success({
      user: store.publicUser(user),
      memberships,
      tasks: {
        total: myTasks.length,
        open: myTasks.filter((t) => t.status !== 'done').length,
        done: myTasks.filter((t) => t.status === 'done').length,
        items: myTasks.slice(0, 8),
      },
      kpis: {
        tasksDone: user.tasksDone || 0,
        workspaces: memberships.length,
        activeTasks: myTasks.filter((t) => t.status !== 'done').length,
        completionRate: myTasks.length
          ? Math.round((myTasks.filter((t) => t.status === 'done').length / myTasks.length) * 100)
          : 0,
      },
      activity,
    })
  );
});
