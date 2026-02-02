import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAxios from './useAxios.js';
import { getUserData, setUserData, clearAllTokens, hasAdminToken, hasUserToken } from '../utils/tokenManager.js';

/**
 * Hook to verify admin token and get user role
 * Uses Tanstack Query for better caching and state management
 * ALWAYS verifies with server - localStorage is only used as placeholder during loading
 */
export const useVerifyAdminToken = () => {
  const Axios = useAxios();

  return useQuery({
    queryKey: ['adminAuth'],
    queryFn: async () => {
      // If no tokens exist at all, skip the server call
      if (!hasAdminToken() && !hasUserToken()) {
        clearAllTokens();
        return { authenticated: false, user: null };
      }

      try {
        const response = await Axios.get('/admin/verify-token', {
          withCredentials: true,
        });

        // Update localStorage with fresh data from server
        if (response.data.authenticated && response.data.user) {
          setUserData(response.data.user);
        } else {
          // Server says NOT authenticated - clear everything
          clearAllTokens();
        }

        return response.data;
      } catch (error) {
        console.error('Token verification error:', error);
        // Server verification failed - treat as NOT authenticated
        clearAllTokens();
        return { authenticated: false, user: null };
      }
    },
    staleTime: 30 * 1000, // 30 seconds - verify frequently to catch logouts
    cacheTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    retry: 1,
    // No initialData - don't blindly trust localStorage
    // Use placeholderData instead so isLoading stays true until server responds
    placeholderData: () => {
      const storedUser = getUserData();
      if (storedUser && (hasAdminToken() || hasUserToken())) {
        return {
          authenticated: false, // NOT authenticated until server confirms
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
 * Only trusts server-verified authentication status
 */
export const useUserRole = () => {
  const { data, isLoading, isPlaceholderData, error } = useVerifyAdminToken();

  const user = data?.user || null;
  // Only consider authenticated if server confirmed it (not placeholder data)
  const authenticated = !isPlaceholderData && data?.authenticated === true;

  return {
    role: user?.role || null,
    isAdmin: authenticated && (user?.role === 'Admin' || user?.role === 'admin' || user?.role === 'executive'),
    authenticated: authenticated,
    user: user,
    isLoading: isLoading || isPlaceholderData,
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
      const response = await Axios.post(
        '/admin/login',
        { email, password },
        {
          withCredentials: true,
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
