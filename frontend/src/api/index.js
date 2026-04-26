import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('kitty_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kitty_token');
      localStorage.removeItem('kitty_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updatePreferences: (preferences) => api.put('/auth/preferences', { preferences }),
  setPin: (pin) => api.put('/auth/pin', { pin }),
  verifyPin: (pin) => api.post('/auth/verify-pin', { pin }),
};

// ─── Entries API ───────────────────────────────────────────────────────────
export const entriesAPI = {
  getAll: (params) => api.get('/entries', { params }),
  getById: (id) => api.get(`/entries/${id}`),
  getByDate: (date) => api.get(`/entries/date/${date}`),
  getDates: (params) => api.get('/entries/dates', { params }),
  create: (data) => api.post('/entries', data),
  update: (id, data) => api.put(`/entries/${id}`, data),
  delete: (id) => api.delete(`/entries/${id}`),
};

export default api;
