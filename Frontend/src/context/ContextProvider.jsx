import { createContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import useAxios from "../Hooks/useAxios.js";
import {
  clearAllTokens,
  hasAdminToken,
  hasUserToken,
  setUserData,
} from "../utils/tokenManager.js";
import {
  performLogout,
  initializeAuthListeners,
} from "../utils/crossDomainAuth.js";

export const AuthProvider = createContext(null);

const ContextProvider = ({ children }) => {
  const Axios = useAxios();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loader, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const LogOut = async () => {
    try {
      // 1. Capture admin token status BEFORE clearing anything
      const wasAdmin = hasAdminToken();

      // 2. Perform backend logout FIRST (while token is still available for the interceptor)
      const backendLogoutFn = async () => {
        if (wasAdmin) {
          await Axios.post("/admin/logout", {}, { withCredentials: true });
        } else {
          await Axios.post("/logout", {}, { withCredentials: true });
        }
      };

      await performLogout(backendLogoutFn);

      // 3. Clear all tokens from localStorage
      clearAllTokens();

      // 4. Clear React Query cache so no stale auth data remains
      queryClient.clear();

      // 5. Clear React state so UI redirects
      setIsAdmin(false);
      setUserRole(null);
      setUser(null);

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);

      // Force clear even on error
      clearAllTokens();
      queryClient.clear();
      setIsAdmin(false);
      setUserRole(null);
      setUser(null);

      return { success: false, error };
    }
  };

  // Check admin session on mount and after login
  const checkAdminSession = async () => {
    try {
      const response = await Axios.get("/verify-token", {
        withCredentials: true,
      });

      if (response.data.authenticated) {
        const userData = {
          id: response.data.user._id,
          name: response.data.user.name || response.data.user.Name,
          email: response.data.user.email,
          role: response.data.user.role,
          avatar: response.data.user.avatar || null,
        };

        // Store user data in localStorage
        setUserData(userData);

        const role = response.data.user.role;
        const adminRoles = ['admin', 'Admin', 'moderator', 'Moderator', 'executive', 'Executive'];
        setIsAdmin(adminRoles.includes(role));
        setUserRole(role);
        setUser({
          email: response.data.user.email,
          displayName: response.data.user.name || response.data.user.Name,
          uid: response.data.user._id,
          isAdmin: adminRoles.includes(role),
          bloodGroup: response.data.user.bloodGroup || null,
          phone: response.data.user.phone || null,
          Name: response.data.user.Name || response.data.user.name,
        });
        return true;
      } else {
        // If not authenticated, ensure state is cleared
        setIsAdmin(false);
        setUserRole(null);
        setUser(null);
        return false;
      }
    } catch (error) {
      console.error('Session check failed:', error);
      setIsAdmin(false);
      setUserRole(null);
      setUser(null);
      return false;
    }
  };

  // Auth State Initialization - check JWT token on mount
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);

      // Check if any token exists
      if (hasAdminToken() || hasUserToken()) {
        const hasSession = await checkAdminSession();

        if (!hasSession) {
          // Token exists but invalid, clear it
          clearAllTokens();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // Setup cross-tab logout listener
  useEffect(() => {
    const handleCrossTabLogout = () => {
      // Clear local state when logout is triggered from another tab
      setUser(null);
      setIsAdmin(false);
      setUserRole(null);
      clearAllTokens();
      queryClient.clear();
    };

    // Initialize cross-tab logout listener
    const cleanupListener = initializeAuthListeners(handleCrossTabLogout);

    return () => {
      if (cleanupListener) {
        cleanupListener();
      }
    };
  }, []);

  const authInfo = {
    user,
    loader,
    userRole,
    isAdmin,
    LogOut,
    checkAdminSession,
  };

  return (
    <AuthProvider.Provider value={authInfo}>{children}</AuthProvider.Provider>
  );
};

export default ContextProvider;
