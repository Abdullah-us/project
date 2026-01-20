// Authentication API endpoints
export const authEndpoints = {
  login: () => '/auth/login',
  register: () => '/auth/register',
  logout: () => '/auth/logout',
  refreshToken: () => '/auth/refresh',
  verifyToken: () => '/auth/verify',
  forgotPassword: () => '/auth/forgot-password',
  resetPassword: () => '/auth/reset-password',
};