/**
 * Dashboard Module — GET /dashboard/summary. Real but undocumented in any .md (see
 * docs/api/README.md open question 12); confirmed against openapi.json and a live call.
 * Maps the Dto to a domain shape before it leaves this file and switches between mock and
 * real data on apiConfig.useMockApi, matching every other module.
 */
import { apiRequest } from '@/lib/apiClient';
import { apiConfig } from '@/lib/config';
import { mockDashboardSummary } from '@/mock/dashboardSummary.mock';
import type { SummaryResponseDto, DashboardSummary } from '@/types/dashboardSummary';

function simulateDelay<T>(data: T, ms = 400): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), ms));
}

function toDashboardSummary(dto: SummaryResponseDto): DashboardSummary {
  return {
    generatedAt: dto.generated_at,
    cards: dto.cards.map((card) => ({
      key: card.key,
      title: card.title,
      value: card.value,
      subtitle: card.subtitle,
      link: card.link,
    })),
  };
}

export const dashboardSummaryService = {
  async getSummary(): Promise<DashboardSummary> {
    if (apiConfig.useMockApi) {
      return simulateDelay(mockDashboardSummary);
    }
    const dto = await apiRequest<SummaryResponseDto>('/dashboard/summary');
    return toDashboardSummary(dto);
  },
};
