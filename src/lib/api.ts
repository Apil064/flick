import axios from 'axios';

// Always use relative path for the API since it's served from the same origin
const API_URL = '/api';

export const API = axios.create({
  baseURL: API_URL,
});

// Add auth token if available
API.interceptors.request.use(async (config) => {
  try {
    // Access Clerk from the window object as a fallback if needed, 
    // but ideally we use the useAuth hook in components.
    // However, for a global interceptor, we can use window.Clerk
    const token = await (window as any).Clerk?.session?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting Clerk token:', error);
  }
  return config;
});
