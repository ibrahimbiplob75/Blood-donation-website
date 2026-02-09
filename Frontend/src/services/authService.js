import { baseURL } from '../Hooks/useAxios.js';
import { getUserToken } from '../utils/tokenManager.js';

export const authService = {
  // Verify token and get full user data
  async verifyToken(token) {
    try {
      const response = await fetch(`${baseURL}/verify-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Token verification failed');
      }

      const data = await response.json();
      
      // Return full user data including bloodGroup, lastDonateDate, etc.
      return {
        id: data.user._id,
        name: data.user.name || data.user.Name,
        displayName: data.user.name || data.user.Name,
        email: data.user.email,
        phone: data.user.phone,
        role: data.user.role,
        bloodGroup: data.user.bloodGroup,
        district: data.user.district,
        address: data.user.address,
        course: data.user.course,
        batchNo: data.user.batchNo,
        lastDonateDate: data.user.lastDonateDate,
        bloodGiven: data.user.bloodGiven,
        bloodTaken: data.user.bloodTaken,
        isActive: data.user.isActive,
        isVerified: data.user.isVerified,
        avatar: data.user.avatar || null,
      };
    } catch (error) {
      console.error('Token verification error:', error);
      throw error;
    }
  },

  // Login user
  async login(email, password) {
    try {
      const response = await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      
      return {
        success: true,
        token: data.token,
        user: {
          id: data.user._id,
          name: data.user.name || data.user.Name,
          displayName: data.user.name || data.user.Name,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role,
          bloodGroup: data.user.bloodGroup,
          district: data.user.district,
          address: data.user.address,
          course: data.user.course,
          batchNo: data.user.batchNo,
          lastDonateDate: data.user.lastDonateDate,
          bloodGiven: data.user.bloodGiven,
          bloodTaken: data.user.bloodTaken,
          isActive: data.user.isActive,
          isVerified: data.user.isVerified,
          avatar: data.user.avatar || null,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register user
  async register(userData) {
    try {
      const response = await fetch(`${baseURL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      
      return {
        success: true,
        token: data.token,
        user: {
          id: data.user._id,
          name: data.user.name || data.user.Name,
          displayName: data.user.name || data.user.Name,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role,
          bloodGroup: data.user.bloodGroup,
          district: data.user.district,
          address: data.user.address,
          course: data.user.course,
          batchNo: data.user.batchNo,
          lastDonateDate: data.user.lastDonateDate,
          bloodGiven: data.user.bloodGiven,
          bloodTaken: data.user.bloodTaken,
          isActive: data.user.isActive,
          isVerified: data.user.isVerified,
          avatar: data.user.avatar || null,
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  // Get current user profile
  async getCurrentUser() {
    try {
      const token = getUserToken();
      if (!token) {
        throw new Error('No token found');
      }

      return await this.verifyToken(token);
    } catch (error) {
      console.error('Get current user error:', error);
      throw error;
    }
  },
};
