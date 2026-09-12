import type { DashboardStats } from '@/types/dashboard';
import { mockDashboardStats } from '@/mock/dashboard.mock';

// Simulates real network latency so loading states (built below) are visible
// during development, instead of resolving instantly.
function simulateDelay<T>(data: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    return simulateDelay(mockDashboardStats);
  },
};