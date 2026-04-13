import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const API = axios.create({
  baseURL: API_URL,
});

// Add auth token if available (Clerk handles this via middleware, but for client-side requests to other APIs it might be needed)
API.interceptors.request.use(async (config) => {
  // In a real app with Clerk, you'd get the token here
  // const token = await window.Clerk?.session?.getToken();
  // if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
