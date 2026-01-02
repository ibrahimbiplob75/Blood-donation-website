import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxios from './useAxios.js';
import { getUserData, setUserData, clearAllTokens } from '../utils/tokenManager.js';

/**
 * Hook to verify admin token and get user role
 * Uses Tanstack Query for better caching and state management
 * First checks localStorage, then verifies with server
 */
export const useVerifyAdminToken = () => {
  const Axios = useAxios();

  return useQuery({
    queryKey: ['adminAuth'],
    queryFn: async () => {
      // First try to get user data from localStorage
      const storedUser = getUserData();
      
      try {
        const response = await Axios.get('/admin/verify-token', {
          withCredentials: true,
        });
        
        // Update localStorage with fresh data from server
        if (response.data.authenticated && response.data.user) {
          setUserData(response.data.user);
        } else {
          clearAllTokens();
        }
        
        return response.data;
      } catch (error) {
        console.error('Token verification error:', error);
        // If server verification fails but we have stored user, return it
        if (storedUser) {
          return { 
            authenticated: false, 
            user: storedUser,
            fromCache: true 
          };
        }
        return { authenticated: false, user: null };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true,
    retry: 1,
    // Use initial data from localStorage
    initialData: () => {
      const storedUser = getUserData();
      if (storedUser) {
        return {
          authenticated: true,
          user: storedUser,
          fromCache: true
        };
      }
      return undefined;
    },
  });
};

/**
 * Hook to get current user role with caching
 * Prioritizes localStorage for immediate access
 */
export const useUserRole = () => {
  const { data, isLoading, error } = useVerifyAdminToken();
  
  // Also get from localStorage for immediate access
  const storedUser = getUserData();
  const user = data?.user || storedUser;

  return {
    role: user?.role || null,
    isAdmin: user?.role === 'Admin' || user?.role === 'admin',
    authenticated: data?.authenticated || false,
    user: user,
    isLoading,
    error,
  };
};

/**
 * Mutation hook for login
 */
export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const Axios = useAxios();

  return useMutation({
    mutationFn: async ({ email, password }) => {
      // Get CSRF token first
      const csrfResponse = await Axios.get('/csrf-token', {
        withCredentials: true,
      });

      // Login
      const response = await Axios.post(
        '/admin/login',
        { email, password },
        {
          withCredentials: true,
          headers: {
            'X-CSRF-Token': csrfResponse.data.csrfToken,
          },
        }
      );

      return response.data;
    },
    onSuccess: (data) => {
      // Store user data in localStorage
      if (data.user) {
        const userData = {
          id: data.user._id,
          name: data.user.name || data.user.Name,
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.avatar || null,
        };
        setUserData(userData);
      }
      
      // Invalidate and refetch admin auth query
      queryClient.invalidateQueries({ queryKey: ['adminAuth'] });
      
      // Set the new auth data in cache
      queryClient.setQueryData(['adminAuth'], {
        authenticated: true,
        user: data.user,
      });
    },
  });
};

/**
 * Mutation hook for logout
 */
export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const Axios = useAxios();

  return useMutation({
    mutationFn: async () => {
      const response = await Axios.post('/admin/logout', {}, {
        withCredentials: true,
      });
      return response.data;
    },
    onSuccess: () => {
      // Clear all tokens and user data
      clearAllTokens();
      
      // Clear query cache
      queryClient.clear();
      
      // Reset admin auth to unauthenticated
      queryClient.setQueryData(['adminAuth'], {
        authenticated: false,
        user: null,
      });
    },
  });
};
