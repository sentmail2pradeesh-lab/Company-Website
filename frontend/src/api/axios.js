import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || '/api';
const baseURL = rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : rawApiUrl.startsWith('http')
    ? `${rawApiUrl.replace(/\/$/, '')}/api`
    : rawApiUrl;

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('aszen_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const token = sessionStorage.getItem('aszen_token');
      if (token && error.config.url !== '/auth/login') {
        sessionStorage.removeItem('aszen_token');
        sessionStorage.removeItem('aszen_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
