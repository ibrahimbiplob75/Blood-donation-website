import axios from "axios";
import { getAdminToken, getUserToken, clearAllTokens } from "../utils/tokenManager.js";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

instance.interceptors.request.use(
  (config) => {
    try {
      // Check for admin token first, then user token
      const adminToken = getAdminToken();
      const userToken = getUserToken();

      const token = adminToken || userToken;

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error attaching token to request:', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only auto-redirect for token expiration on authenticated routes
    // Skip for login/register/public endpoints to avoid masking real errors
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/login') || url.includes('/register') || url.includes('/users');

    if ((error.response?.status === 401 || error.response?.status === 403) && !isAuthEndpoint) {
      clearAllTokens();

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const baseURL = instance.defaults.baseURL;

const useAxios = () => {
  return instance;
};

export default useAxios;