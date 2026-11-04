/**
 * In-memory data store.
 *
 * The production deployment uses MongoDB (see src/models). This store gives
 * the collaboration/admin/user API surface a fully working backing layer in
 * environments without a database (local dev, previews, CI) — same shapes,
 * real HTTP CRUD, deterministic seed data.
 */
import bcrypt from 'bcryptjs';

const now = () => new Date().toISOString();
let seq = 100;
const uid = (prefix) => `${prefix}_${++seq}`;

const hash = (pw) => bcrypt.hashSync(pw, 4);

const SEED_USERS = [
  { id: 'usr_1', name: 'Ava Mitchell', email: 'ava@acme.com', role: 'admin', title: 'VP Operations', status: 'online', location: 'Nairobi, KE' },
  { id: 'usr_2', name: 'Maya Chen', email: 'maya@acme.com', role: 'manager', title: 'Head of Sales', status: 'online', location: 'Singapore, SG' },
  { id: 'usr_3', name: 'Jordan Lee', email: 'jordan@acme.com', role: 'viewer', title: 'Customer Success', status: 'away', location: 'Austin, US' },
  { id: 'usr_4', name: 'Sam Okoro', email: 'sam@acme.com', role: 'manager', title: 'Account Executive', status: 'online', location: 'Lagos, NG' },
  { id: 'usr_5', name: 'Priya Nair', email: 'priya@acme.com', role: 'viewer', title: 'Growth Analyst', status: 'offline', location: 'Mumbai, IN' },
  { id: 'usr_6', name: 'Luca Rossi', email: 'luca@acme.com', role: 'admin', title: 'Platform Lead', status: 'online', location: 'Milan, IT' },
  { id: 'usr_7', name: 'Nadia Haddad', email: 'nadia@acme.com', role: 'viewer', title: 'Ops Coordinator', status: 'offline', location: 'Dubai, AE' },
  { id: 'usr_8', name: 'Tom Becker', email: 'tom@nimbuslabs.io', role: 'manager', title: 'Nimbus CTO', status: 'away', location: 'Berlin, DE' },
];

const ROLE_PERMISSIONS = {
  admin: ['read', 'write', 'delete', 'admin'],
  manager: ['read', 'write'],
  viewer: ['read'],
};

const db = {
  users: SEED_USERS.map((u, i) => ({
    ...u,
    _id: u.id,
    password: hash('password123'),
    permissions: [...ROLE_PERMISSIONS[u.role]],
    tenantId: 'default',
    isActive: true,
    tasksDone: 12 + i * 7,
    createdAt: new Date(Date.now() - (200 - i * 15) * 86400000).toISOString(),
    lastLogin: new Date(Date.now() - i * 3600000).toISOString(),
  })),
  workspaces: [
    { id: 'ws_1', name: 'Acme HQ', slug: 'acme-hq', description: 'Primary company workspace — revenue, customers, operations.', visibility: 'private', createdBy: 'usr_1', createdAt: '2026-05-14T09:00:00Z', color: '#4F46E5' },
    { id: 'ws_2', name: 'Nimbus Labs', slug: 'nimbus-labs', description: 'Product engineering workspace for the Nimbus platform.', visibility: 'private', createdBy: 'usr_8', createdAt: '2026-07-02T11:30:00Z', color: '#0EA5E9' },
    { id: 'ws_3', name: 'Helios Health', slug: 'helios-health', description: 'Customer delivery workspace for the Helios account.', visibility: 'public', createdBy: 'usr_2', createdAt: '2026-08-21T14:15:00Z', color: '#059669' },
  ],
  members: [
    { id: 'mem_1', workspaceId: 'ws_1', userId: 'usr_1', role: 'owner', joinedAt: '2026-05-14T09:00:00Z' },
    { id: 'mem_2', workspaceId: 'ws_1', userId: 'usr_2', role: 'admin', joinedAt: '2026-05-16T10:00:00Z' },
    { id: 'mem_3', workspaceId: 'ws_1', userId: 'usr_3', role: 'member', joinedAt: '2026-06-01T08:20:00Z' },
    { id: 'mem_4', workspaceId: 'ws_1', userId: 'usr_4', role: 'member', joinedAt: '2026-06-11T12:00:00Z' },
    { id: 'mem_5', workspaceId: 'ws_1', userId: 'usr_5', role: 'member', joinedAt: '2026-08-09T09:45:00Z' },
    { id: 'mem_6', workspaceId: 'ws_1', userId: 'usr_6', role: 'admin', joinedAt: '2026-05-20T16:30:00Z' },
    { id: 'mem_7', workspaceId: 'ws_2', userId: 'usr_8', role: 'owner', joinedAt: '2026-07-02T11:30:00Z' },
    { id: 'mem_8', workspaceId: 'ws_2', userId: 'usr_6', role: 'admin', joinedAt: '2026-07-03T09:00:00Z' },
    { id: 'mem_9', workspaceId: 'ws_2', userId: 'usr_5', role: 'member', joinedAt: '2026-07-15T13:10:00Z' },
    { id: 'mem_10', workspaceId: 'ws_3', userId: 'usr_2', role: 'owner', joinedAt: '2026-08-21T14:15:00Z' },
    { id: 'mem_11', workspaceId: 'ws_3', userId: 'usr_3', role: 'member', joinedAt: '2026-08-25T10:00:00Z' },
    { id: 'mem_12', workspaceId: 'ws_3', userId: 'usr_7', role: 'member', joinedAt: '2026-09-02T11:20:00Z' },
  ],
  tasks: [
    { id: 'tsk_1', workspaceId: 'ws_1', title: 'Q4 enterprise renewal deck', description: 'Renewal narrative + usage slides for the top 5 accounts.', status: 'todo', priority: 'high', assignee: 'usr_2', dueDate: '2026-11-08', tag: 'sales', createdBy: 'usr_1', createdAt: '2026-10-28T09:00:00Z' },
    { id: 'tsk_2', workspaceId: 'ws_1', title: 'Onboarding flow for Helios', description: 'Walkthrough + admin handoff checklist.', status: 'todo', priority: 'medium', assignee: 'usr_3', dueDate: '2026-11-12', tag: 'success', createdBy: 'usr_2', createdAt: '2026-10-29T10:30:00Z' },
    { id: 'tsk_3', workspaceId: 'ws_1', title: 'Pricing experiment: annual toggle', description: 'A/B the annual prepay toggle on the pricing page.', status: 'in_progress', priority: 'low', assignee: 'usr_5', dueDate: '2026-11-20', tag: 'growth', createdBy: 'usr_1', createdAt: '2026-10-30T14:00:00Z' },
    { id: 'tsk_4', workspaceId: 'ws_1', title: 'Vertex Health expansion proposal', description: 'Expansion to 3 new seats + SSO add-on.', status: 'in_progress', priority: 'high', assignee: 'usr_4', dueDate: '2026-11-06', tag: 'sales', createdBy: 'usr_2', createdAt: '2026-10-27T08:15:00Z' },
    { id: 'tsk_5', workspaceId: 'ws_1', title: 'Migrate billing to new ledger', description: 'Dual-run reconciliation for one cycle.', status: 'done', priority: 'high', assignee: 'usr_1', dueDate: '2026-10-28', tag: 'platform', createdBy: 'usr_6', createdAt: '2026-10-10T09:00:00Z' },
    { id: 'tsk_6', workspaceId: 'ws_2', title: 'Realtime presence service', description: 'Socket presence with heartbeat + reconnect.', status: 'in_progress', priority: 'high', assignee: 'usr_6', dueDate: '2026-11-14', tag: 'platform', createdBy: 'usr_8', createdAt: '2026-11-01T09:00:00Z' },
    { id: 'tsk_7', workspaceId: 'ws_2', title: 'API rate-limit dashboard', description: 'Per-key usage charts for the developer console.', status: 'todo', priority: 'medium', assignee: 'usr_5', dueDate: '2026-11-18', tag: 'platform', createdBy: 'usr_8', createdAt: '2026-11-02T11:00:00Z' },
    { id: 'tsk_8', workspaceId: 'ws_2', title: 'SOC 2 evidence collection', description: 'Q4 evidence pack for the auditor.', status: 'review', priority: 'high', assignee: 'usr_8', dueDate: '2026-10-25', tag: 'security', createdBy: 'usr_6', createdAt: '2026-10-12T10:00:00Z' },
    { id: 'tsk_9', workspaceId: 'ws_3', title: 'Helios go-live checklist', description: 'SSO, data import, admin training.', status: 'todo', priority: 'high', assignee: 'usr_3', dueDate: '2026-11-10', tag: 'success', createdBy: 'usr_2', createdAt: '2026-11-01T15:00:00Z' },
    { id: 'tsk_10', workspaceId: 'ws_3', title: 'October churn review', description: 'Root-cause the 2.1% churn cohort.', status: 'done', priority: 'medium', assignee: 'usr_2', dueDate: '2026-10-31', tag: 'success', createdBy: 'usr_2', createdAt: '2026-10-20T09:30:00Z' },
  ],
  activity: [
    { id: 'act_1', workspaceId: 'ws_1', actor: 'Ava Mitchell', action: 'created task', target: 'Q4 enterprise renewal deck', time: '2026-11-03T09:12:00Z' },
    { id: 'act_2', workspaceId: 'ws_1', actor: 'Maya Chen', action: 'moved to in_progress', target: 'Vertex Health expansion proposal', time: '2026-11-03T08:40:00Z' },
    { id: 'act_3', workspaceId: 'ws_1', actor: 'Luca Rossi', action: 'invited member', target: 'Priya Nair', time: '2026-11-02T16:20:00Z' },
    { id: 'act_4', workspaceId: 'ws_1', actor: 'Sam Okoro', action: 'commented on', target: 'Pricing experiment: annual toggle', time: '2026-11-02T14:05:00Z' },
    { id: 'act_5', workspaceId: 'ws_2', actor: 'Tom Becker', action: 'created task', target: 'API rate-limit dashboard', time: '2026-11-02T11:02:00Z' },
    { id: 'act_6', workspaceId: 'ws_2', actor: 'Luca Rossi', action: 'moved to review', target: 'SOC 2 evidence collection', time: '2026-11-01T17:30:00Z' },
    { id: 'act_7', workspaceId: 'ws_3', actor: 'Maya Chen', action: 'completed', target: 'October churn review', time: '2026-11-01T10:10:00Z' },
    { id: 'act_8', workspaceId: 'ws_3', actor: 'Jordan Lee', action: 'joined workspace', target: 'Helios Health', time: '2026-10-30T09:00:00Z' },
  ],
  auditLogs: [
    { id: 'aud_1', actor: 'Ava Mitchell', action: 'Updated role: Priya Nair → viewer', target: 'usr_5', time: '2026-11-03T08:40:00Z', ip: '197.232.60.14', type: 'role' },
    { id: 'aud_2', actor: 'System', action: 'API key “Local dev” created', target: 'key_3', time: '2026-10-28T12:00:00Z', ip: '—', type: 'security' },
    { id: 'aud_3', actor: 'Maya Chen', action: 'Invited Tom Becker (manager)', target: 'usr_8', time: '2026-10-25T15:22:00Z', ip: '102.68.76.9', type: 'invite' },
    { id: 'aud_4', actor: 'Ava Mitchell', action: 'Enabled SSO enforcement', target: 'workspace', time: '2026-10-20T10:05:00Z', ip: '197.232.60.14', type: 'security' },
    { id: 'aud_5', actor: 'System', action: 'Blocked suspicious login (5 failed attempts)', target: 'usr_7', time: '2026-10-19T03:12:00Z', ip: '41.90.12.201', type: 'security' },
    { id: 'aud_6', actor: 'Luca Rossi', action: 'Deactivated seat: contractor@vendor.io', target: 'usr_0', time: '2026-10-15T12:44:00Z', ip: '151.44.20.9', type: 'status' },
    { id: 'aud_7', actor: 'Ava Mitchell', action: 'Exported user list (CSV)', target: 'workspace', time: '2026-10-11T09:30:00Z', ip: '197.232.60.14', type: 'export' },
    { id: 'aud_8', actor: 'System', action: 'Rotated JWT signing secret', target: 'auth', time: '2026-10-01T00:00:00Z', ip: '—', type: 'security' },
  ],
};

// ===== Billing: plans, subscriptions, invoices =====

export const PLANS = [
  {
    id: 'starter', name: 'Starter', price: 29, interval: 'month', seats: 3,
    tagline: 'For small teams getting started',
    features: ['3 seats', '5 GB storage', 'Basic analytics', 'Email support', 'API access (10k req/mo)'],
  },
  {
    id: 'pro', name: 'Pro', price: 79, interval: 'month', seats: 10,
    tagline: 'For growing teams that need more power', popular: true,
    features: ['10 seats', '50 GB storage', 'Advanced analytics', 'Priority support', 'API access (100k req/mo)', 'Custom dashboards'],
  },
  {
    id: 'business', name: 'Business', price: 249, interval: 'month', seats: 25,
    tagline: 'For scaling companies with bigger teams',
    features: ['25 seats', '500 GB storage', 'AI insights', 'Dedicated CSM', 'Unlimited API', 'SSO + SCIM'],
  },
  {
    id: 'enterprise', name: 'Enterprise', price: null, interval: 'month', seats: null,
    tagline: 'Custom contracts, security reviews & SLAs',
    features: ['Unlimited seats', 'Custom storage', 'On-prem option', '99.99% SLA', 'Security review', 'Custom integrations'],
  },
];

db.subscriptions = [
  {
    id: 'sub_1', userId: 'usr_1', planId: 'pro', status: 'active', seats: 8,
    currentPeriodStart: '2026-10-14T00:00:00Z', currentPeriodEnd: '2026-11-14T00:00:00Z',
    cancelAtPeriodEnd: false, createdAt: '2026-05-14T09:00:00Z',
  },
];

db.invoices = [
  { id: 'INV-2041', userId: 'usr_1', amount: 632, status: 'paid', date: '2026-10-14', planId: 'pro', seats: 8 },
  { id: 'INV-1982', userId: 'usr_1', amount: 632, status: 'paid', date: '2026-09-14', planId: 'pro', seats: 8 },
  { id: 'INV-1921', userId: 'usr_1', amount: 553, status: 'paid', date: '2026-08-14', planId: 'pro', seats: 7 },
  { id: 'INV-1864', userId: 'usr_1', amount: 553, status: 'paid', date: '2026-07-14', planId: 'pro', seats: 7 },
];

const findUser = (id) => db.users.find((u) => u.id === id || u._id === id) || null;
const findUserByEmail = (email) =>
  db.users.find((u) => u.email.toLowerCase() === String(email || '').toLowerCase()) || null;

const publicUser = (u) =>
  u && {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    title: u.title,
    status: u.status,
    location: u.location,
    permissions: u.permissions,
    isActive: u.isActive,
    tasksDone: u.tasksDone,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
    avatar: u.avatar,
    coverPhoto: u.coverPhoto,
    phone: u.phone,
  };

const logAudit = ({ actor, action, target, ip = '—', type = 'general' }) => {
  const entry = { id: uid('aud'), actor, action, target, ip, type, time: now() };
  db.auditLogs.unshift(entry);
  return entry;
};

const logActivity = ({ workspaceId, actor, action, target }) => {
  const entry = { id: uid('act'), workspaceId, actor, action, target, time: now() };
  db.activity.unshift(entry);
  return entry;
};

export const memoryStore = {
  db,
  findUser,
  findUserByEmail,
  publicUser,
  logAudit,
  logActivity,
  uid,
  now,
};

export default memoryStore;
