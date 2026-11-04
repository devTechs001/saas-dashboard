/**
 * Manager dashboard tests: aggregation math + page wiring to the API.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import store from '../store';
import { loginSuccess } from '../store/slices/authSlice';
import { startDemoSession } from '../utils/demoAuth';
import { createAppTheme } from '../theme';

window.matchMedia = vi.fn().mockImplementation((query) => ({
  matches: false,
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
}));

vi.mock('../services', () => ({
  workspaceService: {
    getAll: vi.fn(),
    getMembers: vi.fn(),
    getTasks: vi.fn(),
    getActivity: vi.fn(),
  },
}));

import { workspaceService } from '../services';
import ManagerDashboard, { aggregateManagerData } from '../pages/ManagerDashboard';

const WS = [{ id: 'ws_1', name: 'Acme HQ' }, { id: 'ws_2', name: 'Nimbus' }];
const MEMBERS = {
  ws_1: [
    { userId: 'usr_2', name: 'Maya Chen', role: 'admin', status: 'online', title: 'Sales' },
    { userId: 'usr_3', name: 'Jordan Lee', role: 'member', status: 'away', title: 'CS' },
  ],
  ws_2: [
    { userId: 'usr_3', name: 'Jordan Lee', role: 'member', status: 'away', title: 'CS' },
    { userId: 'usr_6', name: 'Luca Rossi', role: 'admin', status: 'online', title: 'Eng' },
  ],
};
const TASKS = {
  ws_1: [
    { id: 't1', title: 'Renewal deck', status: 'todo', assignee: 'usr_2', assigneeName: 'Maya Chen', dueDate: '2020-01-01' }, // overdue
    { id: 't2', title: 'Churn review', status: 'review', assignee: 'usr_3', assigneeName: 'Jordan Lee', dueDate: '2026-12-01' },
    { id: 't3', title: 'Billing migration', status: 'done', assignee: 'usr_2', assigneeName: 'Maya Chen', dueDate: '2026-10-01' },
  ],
  ws_2: [
    { id: 't4', title: 'Presence service', status: 'in_progress', assignee: 'usr_3', assigneeName: 'Jordan Lee', dueDate: '2026-12-15' },
  ],
};
const ACTIVITY = {
  ws_1: [{ id: 'a1', actor: 'Maya Chen', action: 'created', target: 'Renewal deck', time: '2026-11-03T09:00:00Z' }],
  ws_2: [{ id: 'a2', actor: 'Luca Rossi', action: 'shipped', target: 'v1.4', time: '2026-11-02T09:00:00Z' }],
};

describe('aggregateManagerData (pure)', () => {
  const data = aggregateManagerData(WS, MEMBERS, TASKS, ACTIVITY);

  it('dedupes members across workspaces and counts open tasks', () => {
    expect(data.teamSize).toBe(3); // Maya, Jordan (x2 → 1), Luca
    const jordan = data.members.find((m) => m.userId === 'usr_3');
    expect(jordan.openTasks).toBe(2); // t2 + t4, one from each workspace
  });

  it('computes task stats and completion rate', () => {
    expect(data.tasks.total).toBe(4);
    expect(data.tasks.done).toBe(1);
    expect(data.tasks.completionRate).toBe(25);
  });

  it('flags overdue and review items for attention', () => {
    const reasons = data.attention.map((a) => `${a.title}:${a.reason}`);
    expect(reasons).toContain('Renewal deck:Overdue');
    expect(reasons).toContain('Churn review:Awaiting review');
    expect(data.tasks.overdue).toHaveLength(1);
    expect(data.tasks.inReview).toHaveLength(1);
  });

  it('builds workload + status mix + workspace health', () => {
    expect(data.workload.find((w) => w.name === 'Jordan')?.open).toBe(2);
    expect(data.statusMix.find((s) => s.name === 'Done')?.value).toBe(1);
    expect(data.workspaceHealth.find((w) => w.name === 'Acme HQ')).toEqual({ name: 'Acme HQ', open: 2, done: 1, total: 3 });
  });

  it('never divides by zero on empty input', () => {
    const empty = aggregateManagerData([], {}, {}, {});
    expect(empty.tasks.completionRate).toBe(0);
    expect(empty.teamSize).toBe(0);
  });
});

describe('ManagerDashboard page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    workspaceService.getAll.mockResolvedValue({ data: { workspaces: WS } });
    workspaceService.getMembers.mockImplementation((id) => Promise.resolve({ data: { members: MEMBERS[id] || [] } }));
    workspaceService.getTasks.mockImplementation((id) => Promise.resolve({ data: { tasks: TASKS[id] || [] } }));
    workspaceService.getActivity.mockImplementation((id) => Promise.resolve({ data: { activity: ACTIVITY[id] || [] } }));
    store.dispatch(loginSuccess(startDemoSession('manager')));
  });

  it('loads team data from the workspace API and renders KPIs', async () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={createAppTheme('dark')}>
          <ManagerDashboard />
        </ThemeProvider>
      </Provider>
    );
    expect(workspaceService.getAll).toHaveBeenCalled();
    expect(await screen.findByText('Team members')).toBeInTheDocument();
    // KPI label + section title share the wording
    expect(screen.getAllByText('Needs attention').length).toBeGreaterThanOrEqual(1);
    // attention items from real aggregation (also echoed in the activity feed)
    expect((await screen.findAllByText('Renewal deck')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Awaiting review')).toBeInTheDocument();
    // roster
    expect(screen.getAllByText('Jordan Lee').length).toBeGreaterThanOrEqual(1);
  });

  it('falls back to cached data when the API is down', async () => {
    workspaceService.getAll.mockRejectedValue(new Error('down'));
    render(
      <Provider store={store}>
        <ThemeProvider theme={createAppTheme('dark')}>
          <ManagerDashboard />
        </ThemeProvider>
      </Provider>
    );
    expect(await screen.findByText(/api unreachable/i)).toBeInTheDocument();
    expect(screen.getByText('Team members')).toBeInTheDocument();
  });
});
