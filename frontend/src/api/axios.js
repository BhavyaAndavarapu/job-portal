import axios from 'axios';

axios.create({
  baseURL: 'https://job-portal-seven-blond.vercel.app/api',
  withCredentials: true
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
