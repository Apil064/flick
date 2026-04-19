import axios from 'axios';

// Use environment variable for the API URL if available, otherwise fallback to relative path
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const API = axios.create({
  baseURL: API_URL,
});

// Add auth token if available
API.interceptors.request.use(async (config) => {
  try {
    const clerk = (window as any).Clerk;
    if (clerk?.session) {
      const token = await clerk.session.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.warn('Silent error getting Clerk token:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Response error handler
API.interceptors.response.use(
  res => res,
  err => {
    console.error('API error:', err.message);
    return Promise.reject(err);
  }
);
