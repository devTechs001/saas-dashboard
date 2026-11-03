/**
 * Workspace collaboration API — workspaces, members, tasks, activity.
 * Backed by the in-memory store (see src/store/memoryStore.js) so the full
 * CRUD surface works with or without MongoDB.
 */
import { memoryStore as store } from '../store/memoryStore.js';
import catchAsync from '../utils/catchAsync.js';
import ApiResponse from '../utils/ApiResponse.js';
import ApiError from '../utils/apiError.js';

const WORKSPACE_ROLES = ['owner', 'admin', 'member', 'guest'];
const TASK_STATUSES = ['todo', 'in_progress', 'review', 'done'];

const withStats = (ws) => {
  const members = store.db.members.filter((m) => m.workspaceId === ws.id);
  const tasks = store.db.tasks.filter((t) => t.workspaceId === ws.id);
  return {
    ...ws,
    memberCount: members.length,
    taskCount: tasks.length,
    openTasks: tasks.filter((t) => t.status !== 'done').length,
    doneTasks: tasks.filter((t) => t.status === 'done').length,
  };
};

const requireWorkspace = (id) => {
  const ws = store.db.workspaces.find((w) => w.id === id);
  if (!ws) throw ApiError.notFound(`Workspace ${id} not found`);
  return ws;
};

const memberView = (m) => {
  const user = store.findUser(m.userId);
  return {
    ...m,
    name: user?.name || 'Unknown',
    email: user?.email || '—',
    title: user?.title || '',
    status: user?.status || 'offline',
    avatar: user?.avatar,
  };
};

// ===== Workspaces =====

export const listWorkspaces = catchAsync(async (req, res) => {
  const q = String(req.query.search || '').toLowerCase();
  const items = store.db.workspaces
    .filter((w) => !q || `${w.name} ${w.description}`.toLowerCase().includes(q))
    .map(withStats);
  res.json(ApiResponse.success({ workspaces: items, total: items.length }));
});

export const createWorkspace = catchAsync(async (req, res) => {
  const { name, description = '', visibility = 'private' } = req.body;
  if (!name || !name.trim()) throw ApiError.badRequest('Workspace name is required');
  const ws = {
    id: store.uid('ws'),
    name: name.trim().slice(0, 80),
    slug: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    description: String(description).slice(0, 500),
    visibility: visibility === 'public' ? 'public' : 'private',
    color: ['#4F46E5', '#0EA5E9', '#059669', '#D97706', '#7C3AED', '#DB2777'][store.db.workspaces.length % 6],
    createdBy: req.user?.id || 'usr_1',
    createdAt: store.now(),
  };
  store.db.workspaces.unshift(ws);
  store.db.members.push({ id: store.uid('mem'), workspaceId: ws.id, userId: ws.createdBy, role: 'owner', joinedAt: store.now() });
  store.logActivity({ workspaceId: ws.id, actor: req.user?.name || 'You', action: 'created workspace', target: ws.name });
  res.status(201).json(ApiResponse.success({ workspace: withStats(ws) }, 'Workspace created', 201));
});

export const getWorkspace = catchAsync(async (req, res) => {
  const ws = requireWorkspace(req.params.id);
  res.json(ApiResponse.success({ workspace: withStats(ws) }));
});

export const updateWorkspace = catchAsync(async (req, res) => {
  const ws = requireWorkspace(req.params.id);
  const { name, description, visibility } = req.body;
  if (name !== undefined) {
    if (!String(name).trim()) throw ApiError.badRequest('Workspace name cannot be empty');
    ws.name = String(name).trim().slice(0, 80);
  }
  if (description !== undefined) ws.description = String(description).slice(0, 500);
  if (visibility !== undefined) ws.visibility = visibility === 'public' ? 'public' : 'private';
  store.logActivity({ workspaceId: ws.id, actor: req.user?.name || 'You', action: 'updated workspace', target: ws.name });
  res.json(ApiResponse.success({ workspace: withStats(ws) }, 'Workspace updated'));
});

export const deleteWorkspace = catchAsync(async (req, res) => {
  const ws = requireWorkspace(req.params.id);
  store.db.workspaces = store.db.workspaces.filter((w) => w.id !== ws.id);
  store.db.members = store.db.members.filter((m) => m.workspaceId !== ws.id);
  store.db.tasks = store.db.tasks.filter((t) => t.workspaceId !== ws.id);
  res.json(ApiResponse.success({ deleted: ws.id }, 'Workspace deleted'));
});

// ===== Members =====

export const listMembers = catchAsync(async (req, res) => {
  requireWorkspace(req.params.id);
  const members = store.db.members
    .filter((m) => m.workspaceId === req.params.id)
    .map(memberView);
  res.json(ApiResponse.success({ members, total: members.length }));
});

export const inviteMember = catchAsync(async (req, res) => {
  const ws = requireWorkspace(req.params.id);
  const { userId, email, role = 'member' } = req.body;
  if (!WORKSPACE_ROLES.includes(role)) throw ApiError.badRequest(`Role must be one of: ${WORKSPACE_ROLES.join(', ')}`);
  // Resolve by userId first, then by email against known users.
  const user = userId ? store.findUser(userId) : store.findUserByEmail(email);
  if (!user) throw ApiError.notFound('No user matches that id or email');
  if (store.db.members.some((m) => m.workspaceId === ws.id && m.userId === user.id)) {
    throw ApiError.conflict(`${user.name} is already a member`);
  }
  const member = { id: store.uid('mem'), workspaceId: ws.id, userId: user.id, role, joinedAt: store.now() };
  store.db.members.push(member);
  store.logActivity({ workspaceId: ws.id, actor: req.user?.name || 'You', action: 'invited member', target: user.name });
  res.status(201).json(ApiResponse.success({ member: memberView(member) }, 'Member added', 201));
});

export const updateMemberRole = catchAsync(async (req, res) => {
  const ws = requireWorkspace(req.params.id);
  const member = store.db.members.find((m) => m.workspaceId === ws.id && m.userId === req.params.userId);
  if (!member) throw ApiError.notFound('Member not found in this workspace');
  const { role } = req.body;
  if (!WORKSPACE_ROLES.includes(role)) throw ApiError.badRequest(`Role must be one of: ${WORKSPACE_ROLES.join(', ')}`);
  if (member.role === 'owner' && role !== 'owner') {
    const owners = store.db.members.filter((m) => m.workspaceId === ws.id && m.role === 'owner');
    if (owners.length === 1) throw ApiError.badRequest('Transfer ownership before demoting the last owner');
  }
  member.role = role;
  const user = store.findUser(member.userId);
  store.logActivity({ workspaceId: ws.id, actor: req.user?.name || 'You', action: `set role → ${role}`, target: user?.name || member.userId });
  res.json(ApiResponse.success({ member: memberView(member) }, 'Role updated'));
});

export const removeMember = catchAsync(async (req, res) => {
  const ws = requireWorkspace(req.params.id);
  const member = store.db.members.find((m) => m.workspaceId === ws.id && m.userId === req.params.userId);
  if (!member) throw ApiError.notFound('Member not found in this workspace');
  if (member.role === 'owner') {
    const owners = store.db.members.filter((m) => m.workspaceId === ws.id && m.role === 'owner');
    if (owners.length === 1) throw ApiError.badRequest('Cannot remove the last owner');
  }
  store.db.members = store.db.members.filter((m) => m.id !== member.id);
  const user = store.findUser(member.userId);
  store.logActivity({ workspaceId: ws.id, actor: req.user?.name || 'You', action: 'removed member', target: user?.name || member.userId });
  res.json(ApiResponse.success({ removed: member.id }, 'Member removed'));
});

// ===== Tasks =====

export const listTasks = catchAsync(async (req, res) => {
  requireWorkspace(req.params.id);
  const { status, assignee } = req.query;
  let tasks = store.db.tasks.filter((t) => t.workspaceId === req.params.id);
  if (status) tasks = tasks.filter((t) => t.status === status);
  if (assignee) tasks = tasks.filter((t) => t.assignee === assignee);
  const enriched = tasks.map((t) => ({ ...t, assigneeName: store.findUser(t.assignee)?.name || 'Unassigned' }));
  res.json(ApiResponse.success({ tasks: enriched, total: enriched.length }));
});

export const createTask = catchAsync(async (req, res) => {
  const ws = requireWorkspace(req.params.id);
  const { title, description = '', status = 'todo', priority = 'medium', assignee, dueDate, tag = 'general' } = req.body;
  if (!title || !title.trim()) throw ApiError.badRequest('Task title is required');
  if (!TASK_STATUSES.includes(status)) throw ApiError.badRequest(`Status must be one of: ${TASK_STATUSES.join(', ')}`);
  const task = {
    id: store.uid('tsk'),
    workspaceId: ws.id,
    title: title.trim().slice(0, 140),
    description: String(description).slice(0, 1000),
    status,
    priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
    assignee: assignee && store.findUser(assignee) ? assignee : null,
    dueDate: dueDate || null,
    tag,
    createdBy: req.user?.id || 'usr_1',
    createdAt: store.now(),
  };
  store.db.tasks.unshift(task);
  store.logActivity({ workspaceId: ws.id, actor: req.user?.name || 'You', action: 'created task', target: task.title });
  res.status(201).json(ApiResponse.success({ task }, 'Task created', 201));
});

export const updateTask = catchAsync(async (req, res) => {
  const ws = requireWorkspace(req.params.id);
  const task = store.db.tasks.find((t) => t.workspaceId === ws.id && t.id === req.params.taskId);
  if (!task) throw ApiError.notFound('Task not found');
  const { title, description, status, priority, assignee, dueDate, tag } = req.body;
  if (status !== undefined) {
    if (!TASK_STATUSES.includes(status)) throw ApiError.badRequest(`Status must be one of: ${TASK_STATUSES.join(', ')}`);
    task.status = status;
    store.logActivity({ workspaceId: ws.id, actor: req.user?.name || 'You', action: `moved to ${status}`, target: task.title });
  }
  if (title !== undefined) task.title = String(title).trim().slice(0, 140);
  if (description !== undefined) task.description = String(description).slice(0, 1000);
  if (priority !== undefined && ['low', 'medium', 'high'].includes(priority)) task.priority = priority;
  if (assignee !== undefined) task.assignee = assignee && store.findUser(assignee) ? assignee : null;
  if (dueDate !== undefined) task.dueDate = dueDate || null;
  if (tag !== undefined) task.tag = tag;
  res.json(ApiResponse.success({ task }, 'Task updated'));
});

export const deleteTask = catchAsync(async (req, res) => {
  const ws = requireWorkspace(req.params.id);
  const task = store.db.tasks.find((t) => t.workspaceId === ws.id && t.id === req.params.taskId);
  if (!task) throw ApiError.notFound('Task not found');
  store.db.tasks = store.db.tasks.filter((t) => t.id !== task.id);
  store.logActivity({ workspaceId: ws.id, actor: req.user?.name || 'You', action: 'deleted task', target: task.title });
  res.json(ApiResponse.success({ deleted: task.id }, 'Task deleted'));
});

// ===== Activity =====

export const listActivity = catchAsync(async (req, res) => {
  requireWorkspace(req.params.id);
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const activity = store.db.activity
    .filter((a) => a.workspaceId === req.params.id)
    .slice(0, limit);
  res.json(ApiResponse.success({ activity, total: activity.length }));
});
