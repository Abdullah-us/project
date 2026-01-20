// Application configuration
export const appConfig = {
  appName: 'TaskFlow Pro',
  version: '1.0.0',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  defaultPageSize: 20,
  maxUploadSize: 5 * 1024 * 1024, // 5MB
};

// Environment helpers
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;