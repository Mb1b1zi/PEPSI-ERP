/**
 * Base URL for the real backend, used when `useMockApi` is false.
 * `useMockApi` (VITE_USE_MOCK_API) lets a module-with-a-mock-fallback serve mock data instead
 * of calling the real API — see the "Module implementation pattern" section of CLAUDE.md.
 */
export const apiConfig = {
  baseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  useMockApi: import.meta.env.VITE_USE_MOCK_API === 'true',
} as const;
