import axios from 'axios';

const BASE_URL = 'http://localhost:4000';

// Create axios instance
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vizor_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired — try auto-login
      localStorage.removeItem('vizor_token');
      localStorage.removeItem('vizor_user');
      try {
        const res = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: import.meta.env.VITE_OPERATOR_EMAIL || 'admin@vizor.io',
          password: import.meta.env.VITE_OPERATOR_PASSWORD || 'demo123',
        });
        if (res.data.token) {
          localStorage.setItem('vizor_token', res.data.token);
          localStorage.setItem('vizor_user', JSON.stringify(res.data.user));
          // Retry original request
          error.config.headers.Authorization = `Bearer ${res.data.token}`;
          return api.request(error.config);
        }
      } catch (loginErr) {
        console.error('[Vizor] Auto-login failed:', loginErr);
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }).then(r => r.data),
  me: () => api.get('/api/auth/me').then(r => r.data),
};

// ─── Dashboard ────────────────────────────────────────────────────────────
export const dashboardAPI = {
  summary: (period = '24h', siteId) =>
    api.get('/api/dashboard/summary', { params: { period, site_id: siteId } }).then(r => r.data),
  timeseries: (period = '24h', siteId) =>
    api.get('/api/dashboard/timeseries', { params: { period, site_id: siteId } }).then(r => r.data),
  alerts: () =>
    api.get('/api/dashboard/alerts').then(r => r.data),
};

// ─── Visitors (Live) ──────────────────────────────────────────────────────
export const visitorsAPI = {
  list: () => api.get('/api/visitors').then(r => r.data),
};

// ─── Sessions ─────────────────────────────────────────────────────────────
export const sessionsAPI = {
  list: (limit = 50) =>
    api.get('/api/sessions', { params: { limit } }).then(r => r.data),
};

// ─── Fraud ────────────────────────────────────────────────────────────────
export const fraudAPI = {
  list: (limit = 30) =>
    api.get('/api/fraud', { params: { limit } }).then(r => r.data),
};

// ─── Bots ─────────────────────────────────────────────────────────────────
export const botsAPI = {
  list: (limit = 25) =>
    api.get('/api/bots', { params: { limit } }).then(r => r.data),
};

// ─── Analytics ────────────────────────────────────────────────────────────
export const analyticsAPI = {
  all: () => api.get('/api/analytics').then(r => r.data),
  geo: () => api.get('/api/analytics/geo').then(r => r.data),
  device: () => api.get('/api/analytics/device').then(r => r.data),
  campaign: () => api.get('/api/analytics/campaign').then(r => r.data),
};

// ─── Heatmap ──────────────────────────────────────────────────────────────
export const heatmapAPI = {
  data: (siteId) =>
    api.get('/api/heatmap', { params: { site_id: siteId } }).then(r => r.data),
};

// ─── Alerts ───────────────────────────────────────────────────────────────
export const alertsAPI = {
  list: () => api.get('/api/alerts').then(r => r.data),
  acknowledge: (id) => api.patch(`/api/alerts/${id}/acknowledge`).then(r => r.data),
};

// ─── Sites ────────────────────────────────────────────────────────────────
export const sitesAPI = {
  list: () => api.get('/api/sites').then(r => r.data),
  create: (payload) => api.post('/api/sites', payload).then(r => r.data),
};

// ─── Webhooks ─────────────────────────────────────────────────────────────
export const webhooksAPI = {
  list: () => api.get('/api/webhooks').then(r => r.data),
  create: (payload) => api.post('/api/webhooks', payload).then(r => r.data),
  delete: (id) => api.delete(`/api/webhooks/${id}`).then(r => r.data),
};

// ─── Reports ──────────────────────────────────────────────────────────────
export const reportsAPI = {
  summary: (period = '24h') =>
    api.get('/api/reports', { params: { period } }).then(r => r.data),
};

export default api;
