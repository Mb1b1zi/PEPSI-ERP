import type { DepotPagedResponse, FactoryPageParams, Paged } from '@/types/api';

/** Depot already returns every field Paged<T> needs — this is a straight field rename. */
export function pagedFromDepotResponse<T>(response: DepotPagedResponse<T>): Paged<T> {
  return {
    items: response.items,
    total: response.total,
    page: response.page,
    pageSize: response.page_size,
    totalPages: response.total_pages,
  };
}

/**
 * Factory's backend caps `limit` at 10 (see docs/api/factory.md) and returns a bare
 * array with no total count, so `total`/`totalPages` cannot be read from the response —
 * they are estimated from the page size: a short page (fewer items than `limit`) means
 * this was the last page and the true total is now known; otherwise the total is not yet
 * known and the values below are a lower bound, not a fact.
 */
export function pagedFromFactoryList<T>(items: T[], params: FactoryPageParams): Paged<T> {
  const { skip, limit } = params;
  const page = Math.floor(skip / limit) + 1;
  const isLastPage = items.length < limit;

  return {
    items,
    total: skip + items.length,
    page,
    pageSize: limit,
    totalPages: isLastPage ? page : page + 1,
  };
}
