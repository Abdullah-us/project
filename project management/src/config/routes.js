// Route configuration
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROJECTS: '/projects',
  TASKS: '/tasks',
  TASK_BOARD: '/task-board',
  TEAM: '/team',
  ANALYTICS: '/analytics',
  NOT_FOUND: '*',
};

// Routes that require authentication
export const protectedRoutes = [
  ROUTES.DASHBOARD,
  ROUTES.PROJECTS,
  ROUTES.TASK_BOARD,
  ROUTES.TEAM,
  ROUTES.ANALYTICS,
];