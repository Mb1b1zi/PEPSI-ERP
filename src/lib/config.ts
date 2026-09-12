/**
 * Base URL for the real backend once services start calling it. No module calls the
 * backend yet — the app runs entirely on mock data (see src/mock/, src/services/).
 */
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
} as const;
