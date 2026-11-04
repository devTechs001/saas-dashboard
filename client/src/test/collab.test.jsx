/**
 * Collaboration + admin integration tests.
 * Pages must talk to the real API service layer (workspaceService /
 * adminService / userService) — here the transport is mocked, the
 * pages' wiring is what's under test.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';

// ---- controllable matchMedia (MUI useMediaQuery depends on it) ----
window.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
}));
import store from '../store';
import { loginSuccess } from '../store/slices/authSlice';
import { startDemoSession } from '../utils/demoAuth';
import { createAppTheme } from '../theme';

// ---- mock the API service layer ----
vi.mock('../services', () => ({
  workspaceService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    getMembers: vi.fn(),
    inviteMember: vi.fn(),
    updateMemberRole: vi.fn(),
    removeMember: vi.fn(),
    getTasks: vi.fn(),
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    getActivity: vi.fn(),
  },
  adminService: {
    getStats: vi.fn(),
    getUsers: vi.fn(),
    inviteUser: vi.fn(),
    updateUser: vi.fn(),
    deleteUser: vi.fn(),
    getAuditLogs: vi.fn(),
  },
  userService: {
    getDashboard: vi.fn(),
  },
  maintenanceService: {
    getStatus: vi.fn(),
    set: vi.fn(),
  },
}));

import { workspaceService, adminService, userService, maintenanceService } from '../services';
import Workspaces from '../pages/Workspaces';
import Admin from '../pages/Admin';

const WS_LIST = [
  { id: 'ws_1', name: 'Acme HQ', description: 'Main workspace', visibility: 'private', color: '#4F46E5', memberCount: 3, taskCount: 2, openTasks: 1, doneTasks: 1, createdAt: '2026-05-14T09:00:00Z' },
  { id: 'ws_2', name: 'Nimbus Labs', description: 'Eng workspace', visibility: 'public', color: '#0EA5E9', memberCount: 1, taskCount: 1, openTasks: 1, doneTasks: 0, createdAt: '2026-07-02T11:30:00Z' },
];
const MEMBERS = [
  { id: 'mem_1', userId: 'usr_1', name: 'Ava Mitchell', email: 'ava@acme.com', role: 'owner', status: 'online', title: 'VP' },
  { id: 'mem_2', userId: 'usr_2', name: 'Maya Chen', email: 'maya@acme.com', role: 'member', status: 'online', title: 'Sales' },
];
const TASKS = [
  { id: 'tsk_1', title: 'Renewal deck', status: 'todo', priority: 'high', assignee: 'usr_2', assigneeName: 'Maya Chen', dueDate: '2026-11-08', tag: 'sales' },
  { id: 'tsk_2', title: 'Billing migration', status: 'done', priority: 'medium', assignee: 'usr_1', assigneeName: 'Ava Mitchell', dueDate: '2026-10-28', tag: 'platform' },
];
const ACTIVITY = [
  { id: 'act_1', actor: 'Ava Mitchell', action: 'created task', target: 'Renewal deck', time: '2026-11-03T09:12:00Z' },
];

const setupApi = () => {
  workspaceService.getAll.mockResolvedValue({ data: { workspaces: WS_LIST } });
  workspaceService.getMembers.mockResolvedValue({ data: { members: MEMBERS } });
  workspaceService.getTasks.mockResolvedValue({ data: { tasks: TASKS } });
  workspaceService.getActivity.mockResolvedValue({ data: { activity: ACTIVITY } });
  workspaceService.create.mockResolvedValue({ data: { workspace: { id: 'ws_9', name: 'New Co' } } });
  workspaceService.createTask.mockResolvedValue({ data: { task: { id: 'tsk_9' } } });
  workspaceService.updateTask.mockResolvedValue({ data: { task: {} } });
  workspaceService.inviteMember.mockResolvedValue({ data: { member: {} } });
  adminService.getUsers.mockResolvedValue({
    data: {
      users: [
        { id: 'usr_1', name: 'Ava Mitchell', email: 'ava@acme.com', role: 'admin', title: 'VP', status: 'online', isActive: true, createdAt: '2026-06-14' },
        { id: 'usr_5', name: 'Priya Nair', email: 'priya@acme.com', role: 'viewer', title: 'Analyst', status: 'offline', isActive: true, createdAt: '2026-08-01' },
      ],
    },
  });
  adminService.getAuditLogs.mockResolvedValue({ data: { logs: [{ id: 'aud_1', actor: 'Ava', action: 'Updated role', target: 'usr_5', time: '2026-11-03T08:40:00Z', ip: '1.2.3.4' }] } });
  adminService.getStats.mockResolvedValue({ data: { users: { total: 2, active: 2, admins: 1, suspended: 0 }, security: { score: 92, sso: true, mfa: true }, roleMix: [], logins: [] } });
  adminService.updateUser.mockResolvedValue({ data: { user: {} } });
  maintenanceService.getStatus.mockResolvedValue({
    data: {
      level: 'none', allowLogin: true, allowRegistration: true, allowWrites: true,
      message: '', effective: { loginBlocked: false, registrationBlocked: false, writesBlocked: false },
    },
  });
  userService.getDashboard.mockResolvedValue({
    data: {
      user: { id: 'usr_5', name: 'Priya Nair' },
      kpis: { tasksDone: 40, activeTasks: 3, workspaces: 2, completionRate: 66 },
      tasks: { items: [{ id: 'tsk_1', title: 'Renewal deck', status: 'in_progress', priority: 'high', dueDate: '2026-11-08', workspaceName: 'Acme HQ' }] },
      memberships: [{ workspaceId: 'ws_1', name: 'Acme HQ', role: 'member' }],
      activity: [{ id: 'act_9', action: 'commented on', target: 'Renewal deck', time: '2026-11-03T10:00:00Z' }],
    },
  });
};

const renderPage = (ui) =>
  render(
    <Provider store={store}>
      <ThemeProvider theme={createAppTheme('dark')}>{ui}</ThemeProvider>
    </Provider>
  );

describe('Workspaces (collaboration system)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setupApi();
    store.dispatch(loginSuccess(startDemoSession('admin')));
  });

  it('loads workspaces and details from the API', async () => {
    renderPage(<Workspaces />);
    expect(workspaceService.getAll).toHaveBeenCalled();
    expect((await screen.findAllByText('Acme HQ')).length).toBeGreaterThanOrEqual(1);
    await waitFor(() => expect(workspaceService.getMembers).toHaveBeenCalledWith('ws_1'));
    await waitFor(() => expect(workspaceService.getTasks).toHaveBeenCalledWith('ws_1'));
    await waitFor(() => expect(workspaceService.getActivity).toHaveBeenCalledWith('ws_1'));
    // tasks render on the board
    expect(await screen.findByText('Renewal deck')).toBeInTheDocument();
    expect(screen.getByText('Billing migration')).toBeInTheDocument();
  });

  it('creates a workspace through the API', async () => {
    renderPage(<Workspaces />);
    await screen.findAllByText('Acme HQ');
    fireEvent.click(screen.getByRole('button', { name: /new workspace/i }));
    fireEvent.change(screen.getByLabelText(/workspace name/i), { target: { value: 'New Co' } });
    fireEvent.click(screen.getByRole('button', { name: /^create$/i }));
    await waitFor(() => expect(workspaceService.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Co' })));
  });

  it('moves a task forward via the API', async () => {
    renderPage(<Workspaces />);
    await screen.findByText('Renewal deck');
    // Task board card for 'Renewal deck' (todo) — advance it
    const advanceButtons = screen.getAllByRole('button', { name: /move forward/i });
    fireEvent.click(advanceButtons[0]);
    await waitFor(() =>
      expect(workspaceService.updateTask).toHaveBeenCalledWith('ws_1', 'tsk_1', { status: 'in_progress' })
    );
  });

  it('invites a member through the API', async () => {
    renderPage(<Workspaces />);
    await screen.findAllByText('Acme HQ');
    // switch to Members tab
    fireEvent.click(screen.getByRole('tab', { name: /members/i }));
    fireEvent.click(await screen.findByRole('button', { name: /invite member/i }));
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'new@acme.com' } });
    fireEvent.click(screen.getByRole('button', { name: /^invite$/i }));
    await waitFor(() =>
      expect(workspaceService.inviteMember).toHaveBeenCalledWith('ws_1', expect.objectContaining({ email: 'new@acme.com' }))
    );
  });

  it('shows offline fallback when the API is down', async () => {
    workspaceService.getAll.mockRejectedValue(new Error('network down'));
    workspaceService.getMembers.mockRejectedValue(new Error('network down'));
    workspaceService.getTasks.mockRejectedValue(new Error('network down'));
    workspaceService.getActivity.mockRejectedValue(new Error('network down'));
    renderPage(<Workspaces />);
    expect(await screen.findByText(/api unreachable/i)).toBeInTheDocument();
    expect(screen.getAllByText('Acme HQ').length).toBeGreaterThanOrEqual(1); // fallback data
  });
});

describe('Admin console (real API)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    setupApi();
    store.dispatch(loginSuccess(startDemoSession('admin')));
  });

  it('loads users and audit log from the API', async () => {
    renderPage(<Admin />);
    expect(adminService.getUsers).toHaveBeenCalled();
    expect(adminService.getAuditLogs).toHaveBeenCalled();
    expect(await screen.findByText('Priya Nair')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: /audit log/i }));
    expect(await screen.findByText('Updated role')).toBeInTheDocument();
  });

  it('changes a user role through the API', async () => {
    renderPage(<Admin />);
    await screen.findByText('Priya Nair');
    const rows = screen.getAllByRole('row');
    const priyaRow = rows.find((r) => within(r).queryByText('Priya Nair'));
    fireEvent.click(within(priyaRow).getByRole('button'));
    fireEvent.click(await screen.findByRole('menuitem', { name: /manager/i }));
    await waitFor(() => expect(adminService.updateUser).toHaveBeenCalledWith('usr_5', { role: 'manager' }));
  });

  it('opens another user\'s dashboard via the users API', async () => {
    renderPage(<Admin />);
    await screen.findByText('Priya Nair');
    const rows = screen.getAllByRole('row');
    const priyaRow = rows.find((r) => within(r).queryByText('Priya Nair'));
    fireEvent.click(within(priyaRow).getByRole('button'));
    fireEvent.click(await screen.findByRole('menuitem', { name: /view dashboard/i }));
    await waitFor(() => expect(userService.getDashboard).toHaveBeenCalledWith('usr_5'));
    // dialog shows KPIs + assigned tasks from the API
    expect((await screen.findAllByText('Renewal deck')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/66%/)).toBeInTheDocument();
  });

  it('invites a user through the API', async () => {
    renderPage(<Admin />);
    await screen.findByText('Priya Nair');
    fireEvent.click(screen.getByRole('button', { name: /invite user/i }));
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'New Person' } });
    fireEvent.change(screen.getByLabelText(/email address/i), { target: { value: 'np@acme.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send invite/i }));
    await waitFor(() =>
      expect(adminService.inviteUser).toHaveBeenCalledWith(expect.objectContaining({ name: 'New Person', email: 'np@acme.com' }))
    );
  });
});
