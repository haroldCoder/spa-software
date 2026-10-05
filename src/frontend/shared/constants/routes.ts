/**
 * Application Routes Constants
 * Single source of truth for all internal frontend navigation paths.
 * Adheres to DRY and Open/Closed principles.
 */
export const APP_ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    REGISTER: '/register',
  },
  DASHBOARD: {
    ROOT: '/dashboard',
    REGISTER_WORKER: '/dashboard/register-worker',
    REGISTER_CLIENT: '/dashboard/register-client',
    SERVICES: '/dashboard/servicios',
  },
  SERVICIOS: '/servicios',
  DOCS: '/docs',
} as const;

export type AppRoutes = typeof APP_ROUTES;
