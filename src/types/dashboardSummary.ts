/**
 * Wire-format DTOs for GET /dashboard/summary — real but undocumented in any .md (see
 * docs/api/README.md open question 12); shape confirmed against the live openapi.json's
 * SummaryResponse/SummaryCard schemas and a real call. Field names and casing are the
 * backend's, verbatim.
 */
export interface SummaryCardDto {
  key: string;
  title: string;
  value: number;
  subtitle: string | null;
  link: string;
}

export interface SummaryResponseDto {
  generated_at: string;
  cards: SummaryCardDto[];
}

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export interface SummaryCard {
  key: string;
  title: string;
  value: number;
  subtitle: string | null;
  link: string;
}

export interface DashboardSummary {
  generatedAt: string;
  cards: SummaryCard[];
}
