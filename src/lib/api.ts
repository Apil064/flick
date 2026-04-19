import axios from 'axios';

// Use environment variable for the API URL if available, otherwise fallback to relative path
const API_URL = import.meta.env.VITE_API_URL || '/api';

export const API = axios.create({
  baseURL: API_URL,
});

// Add auth token if available
API.interceptors.request.use(async (config) => {
  try {
    // Access Clerk from the window object safely
    const clerk = (window as any).Clerk;
    if (clerk?.session) {
      const token = await clerk.session.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    // Never throw or block the request
    console.warn('Silent error getting Clerk token:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
