import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAppStore = create((set, get) => ({
  // Auth state
  token: localStorage.getItem('vizor_token') || null,
  user: (() => {
    try { return JSON.parse(localStorage.getItem('vizor_user')); } catch { return null; }
  })(),
  isAuthenticated: !!localStorage.getItem('vizor_token'),
  isLoginLoading: false,

  // Site state
  activeSite: { id: 'site-001', name: 'Taneko Official Store', domain: 'taneko.co.id' },
  sites: [
    { id: 'site-001', name: 'Taneko Official Store', domain: 'taneko.co.id' },
    { id: 'site-002', name: 'Landing Page Lead Gen', domain: 'promo.taneko.co.id' },
  ],

  // Filter state
  period: '24h',

  // Live state
  liveVisitorsCount: 42,
  alerts: [],

  // ─── Auth actions ────────────────────────────────────────────────────────
  login: async (email, password) => {
    set({ isLoginLoading: true });
    try {
      const res = await authAPI.login(email, password);
      if (res.token) {
        localStorage.setItem('vizor_token', res.token);
        localStorage.setItem('vizor_user', JSON.stringify(res.user));
        set({ token: res.token, user: res.user, isAuthenticated: true, isLoginLoading: false });
        return { success: true };
      }
    } catch (err) {
      set({ isLoginLoading: false });
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  },

  autoLogin: async () => {
    const token = localStorage.getItem('vizor_token');
    if (token) {
      // Already have token
      set({ isAuthenticated: true });
      return;
    }
    // Auto-login with operator credentials
    set({ isLoginLoading: true });
    try {
      const email = import.meta.env.VITE_OPERATOR_EMAIL || 'admin@vizor.io';
      const password = import.meta.env.VITE_OPERATOR_PASSWORD || 'demo123';
      const res = await authAPI.login(email, password);
      if (res.token) {
        localStorage.setItem('vizor_token', res.token);
        localStorage.setItem('vizor_user', JSON.stringify(res.user));
        set({ token: res.token, user: res.user, isAuthenticated: true, isLoginLoading: false });
      }
    } catch (err) {
      console.error('[Vizor] Auto-login failed:', err);
      set({ isLoginLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('vizor_token');
    localStorage.removeItem('vizor_user');
    set({ token: null, user: null, isAuthenticated: false });
  },

  // ─── Site actions ────────────────────────────────────────────────────────
  setActiveSite: (site) => set({ activeSite: site }),
  setSites: (sites) => set({ sites }),

  // ─── Filter actions ──────────────────────────────────────────────────────
  setPeriod: (period) => set({ period }),

  // ─── Live state actions ──────────────────────────────────────────────────
  setLiveVisitorsCount: (count) => set({ liveVisitorsCount: count }),
  addAlert: (alert) => set((state) => ({ alerts: [alert, ...state.alerts.slice(0, 19)] })),
  clearAlerts: () => set({ alerts: [] }),
}));
