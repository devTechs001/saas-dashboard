// Demo-mode authentication: lets the UI be explored without a live core-api.
// Used as a fallback when the API is unreachable, and by the "Explore demo" buttons.

export const DEMO_USERS = {
  admin: {
    _id: 'demo_admin',
    name: 'Ava Mitchell',
    email: 'ava@nexus.io',
    role: 'admin',
    permissions: [],
  },
  manager: {
    _id: 'demo_manager',
    name: 'Maya Chen',
    email: 'maya@nexus.io',
    role: 'manager',
    permissions: [],
  },
  viewer: {
    _id: 'demo_viewer',
    name: 'Priya Nair',
    email: 'priya@nexus.io',
    role: 'viewer',
    permissions: [],
  },
};

export const startDemoSession = (role = 'admin') => {
  const user = DEMO_USERS[role] || DEMO_USERS.admin;
  localStorage.setItem('token', `demo-token-${role}`);
  localStorage.setItem('user', JSON.stringify(user));
  return { token: `demo-token-${role}`, user };
};
