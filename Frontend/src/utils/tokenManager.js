/**
 * Token management utility
 * Provides a centralized way to manage authentication tokens and user data
 * Prevents token confusion and role leakage
 */

const TOKEN_KEYS = {
  ADMIN: 'adminToken',
  USER: 'userToken',
  USER_DATA: 'userData',
};

/**
 * Clear all authentication tokens and user data
 */
export const clearAllTokens = () => {
  localStorage.removeItem(TOKEN_KEYS.ADMIN);
  localStorage.removeItem(TOKEN_KEYS.USER);
  localStorage.removeItem(TOKEN_KEYS.USER_DATA);
  // Also clear legacy token keys for backward compatibility
  localStorage.removeItem('AccessToken');
  localStorage.removeItem('token');
};

/**
 * Set admin token and user data, clear other tokens
 */
export const setAdminToken = (token, userData = null) => {
  clearAllTokens();
  localStorage.setItem(TOKEN_KEYS.ADMIN, token);
  if (userData) {
    setUserData(userData);
  }
};

/**
 * Set user token and user data, clear admin tokens
 */
export const setUserToken = (token, userData = null) => {
  clearAllTokens();
  localStorage.setItem(TOKEN_KEYS.USER, token);
  if (userData) {
    setUserData(userData);
  }
};

/**
 * Store user data in localStorage
 */
export const setUserData = (userData) => {
  if (userData) {
    localStorage.setItem(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
  }
};

/**
 * Get user data from localStorage
 */
export const getUserData = () => {
  try {
    const data = localStorage.getItem(TOKEN_KEYS.USER_DATA);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

/**
 * Get admin token
 */
export const getAdminToken = () => {
  return localStorage.getItem(TOKEN_KEYS.ADMIN);
};

/**
 * Get user token
 */
export const getUserToken = () => {
  return localStorage.getItem(TOKEN_KEYS.USER);
};

/**
 * Get any valid token (for backward compatibility)
 */
export const getAnyToken = () => {
  return getAdminToken() || getUserToken() || localStorage.getItem('AccessToken');
};

/**
 * Check if admin token exists
 */
export const hasAdminToken = () => {
  return !!getAdminToken();
};

/**
 * Check if user token exists
 */
export const hasUserToken = () => {
  return !!getUserToken();
};

/**
 * Get user role from stored user data
 */
export const getUserRole = () => {
  const userData = getUserData();
  return userData?.role || null;
};

/**
 * Check if current user is admin
 */
export const isAdmin = () => {
  const role = getUserRole();
  return role === 'admin' || role === 'Admin';
};

export default {
  clearAllTokens,
  setAdminToken,
  setUserToken,
  setUserData,
  getUserData,
  getAdminToken,
  getUserToken,
  getAnyToken,
  hasAdminToken,
  hasUserToken,
  getUserRole,
  isAdmin,
  TOKEN_KEYS,
};
