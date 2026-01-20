// Authentication service - will connect to backend later
import { authEndpoints } from '../endpoints/authEndpoints';

export const authService = {
  login: async (credentials) => {
    console.log('Mock: Login called with', credentials);
    // This will be replaced with: return api.post(authEndpoints.login(), credentials);
    return { 
      data: { 
        token: 'mock-jwt-token',
        user: { id: 1, name: 'Demo User', email: credentials.email }
      } 
    };
  },

  register: async (userData) => {
    console.log('Mock: Register called with', userData);
    return { data: { success: true } };
  },

  logout: async () => {
    console.log('Mock: Logout called');
    return { data: { success: true } };
  },

  verifyToken: async (token) => {
    console.log('Mock: Verify token called');
    return { data: { valid: true, user: { id: 1, name: 'Demo User' } } };
  },
};