const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthToken = () => {
  return localStorage.getItem('healthcare_token') || '';
};

const request = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `API Error (${response.status})`);
  }

  return data;
};

export const authAPI = {
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => request('/auth/me'),

  updateProfile: (data) =>
    request('/auth/update-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  forgotPassword: (email) =>
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (resetToken, newPassword) =>
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword }),
    }),

  uploadAvatar: async (file) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await fetch(`${API_BASE_URL}/auth/upload-avatar`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Upload failed');
    return data;
  },
};

export const recordsAPI = {
  create: (recordData) =>
    request('/records', {
      method: 'POST',
      body: JSON.stringify(recordData),
    }),

  getAll: (params = {}) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', params.page);
    if (params.limit) qs.set('limit', params.limit);
    if (params.search) qs.set('search', params.search);
    if (params.status && params.status !== 'All') qs.set('status', params.status);
    const query = qs.toString();
    return request(`/records${query ? `?${query}` : ''}`);
  },

  getById: (id) => request(`/records/${id}`),

  update: (id, recordData) =>
    request(`/records/${id}`, {
      method: 'PUT',
      body: JSON.stringify(recordData),
    }),

  delete: (id) =>
    request(`/records/${id}`, {
      method: 'DELETE',
    }),
};

export const riskAPI = {
  getHistory: () => request('/risk-assessment/history'),
  getById: (id) => request(`/risk-assessment/${id}`),
};

export const dailyTasksAPI = {
  getAll: (date) => request(`/daily-tasks${date ? `?date=${date}` : ''}`),

  create: (data) =>
    request('/daily-tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id, data) =>
    request(`/daily-tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id) =>
    request(`/daily-tasks/${id}`, {
      method: 'DELETE',
    }),

  getStreak: () => request('/daily-tasks/streak'),

  getHistory: (days) => request(`/daily-tasks/history?days=${days || 30}`),
};

export const healthProfileAPI = {
  get: () => request('/health-profile'),

  create: (data) =>
    request('/health-profile', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (data) =>
    request('/health-profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export const dashboardAPI = {
  getStats: () => request('/user/dashboard/stats'),
};

export const reportsAPI = {
  getWeekly: () => request('/reports/weekly'),
  getMonthly: () => request('/reports/monthly'),
  getVitalsHistory: (days) => request(`/reports/vitals-history?days=${days || 7}`),
};
