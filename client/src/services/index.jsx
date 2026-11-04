import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.data) {
      localStorage.setItem('token', response.data.data.token);
      if (response.data.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  refresh: async () => {
    const credential = localStorage.getItem('refreshToken') || localStorage.getItem('token');
    const response = await api.post('/auth/refresh', { refreshToken: credential });
    if (response.data.data) {
      localStorage.setItem('token', response.data.data.token);
      if (response.data.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
      if (response.data.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
    }
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await api.post('/auth/reset-password', { token, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  getAllUsers: async (params) => {
    const response = await api.get('/auth/users', { params });
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/auth/users/${id}`);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/auth/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/auth/users/${id}`);
    return response.data;
  },
};

export const customerService = {
  getAll: async (params) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  create: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  update: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/customers/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/customers/stats');
    return response.data;
  },

  search: async (query) => {
    const response = await api.get('/customers/search', { params: { q: query } });
    return response.data;
  },
};

export const analyticsService = {
  getDashboardStats: async (params) => {
    const response = await api.get('/analytics/dashboard', { params });
    return response.data;
  },

  getByDate: async (params) => {
    const response = await api.get('/analytics', { params });
    return response.data;
  },

  getTopPages: async (limit = 10) => {
    const response = await api.get('/analytics/top-pages', { params: { limit } });
    return response.data;
  },

  getDeviceBreakdown: async (params) => {
    const response = await api.get('/analytics/devices', { params });
    return response.data;
  },
};

export const reportService = {
  getAll: async (params) => {
    const response = await api.get('/reports', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/reports/${id}`);
    return response.data;
  },

  create: async (reportData) => {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  update: async (id, reportData) => {
    const response = await api.put(`/reports/${id}`, reportData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/reports/${id}`);
    return response.data;
  },

  getPublic: async () => {
    const response = await api.get('/reports/public');
    return response.data;
  },
};

export const notificationService = {
  getAll: async (params) => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};

// ===== Workspaces (collaboration) =====

export const workspaceService = {
  getAll: async (params = {}) => {
    const response = await api.get('/workspaces', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/workspaces/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/workspaces', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/workspaces/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/workspaces/${id}`);
    return response.data;
  },

  getMembers: async (id) => {
    const response = await api.get(`/workspaces/${id}/members`);
    return response.data;
  },

  inviteMember: async (id, data) => {
    const response = await api.post(`/workspaces/${id}/members`, data);
    return response.data;
  },

  updateMemberRole: async (id, userId, role) => {
    const response = await api.put(`/workspaces/${id}/members/${userId}`, { role });
    return response.data;
  },

  removeMember: async (id, userId) => {
    const response = await api.delete(`/workspaces/${id}/members/${userId}`);
    return response.data;
  },

  getTasks: async (id, params = {}) => {
    const response = await api.get(`/workspaces/${id}/tasks`, { params });
    return response.data;
  },

  createTask: async (id, data) => {
    const response = await api.post(`/workspaces/${id}/tasks`, data);
    return response.data;
  },

  updateTask: async (id, taskId, data) => {
    const response = await api.put(`/workspaces/${id}/tasks/${taskId}`, data);
    return response.data;
  },

  deleteTask: async (id, taskId) => {
    const response = await api.delete(`/workspaces/${id}/tasks/${taskId}`);
    return response.data;
  },

  getActivity: async (id, params = {}) => {
    const response = await api.get(`/workspaces/${id}/activity`, { params });
    return response.data;
  },
};

// ===== Admin console =====

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getUsers: async (params = {}) => {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  inviteUser: async (data) => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  updateUser: async (id, data) => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  getAuditLogs: async (params = {}) => {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  },
};

// ===== Users ("other users' dashboards") =====

export const userService = {
  getDashboard: async (id) => {
    const response = await api.get(`/users/${id}/dashboard`);
    return response.data;
  },
};
