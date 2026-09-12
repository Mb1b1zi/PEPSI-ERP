import { apiConfig } from './config';
import type { ApiError, FastApiValidationError } from '@/types/api';

async function parseApiError(response: Response): Promise<ApiError> {
  let message = response.statusText;
  let validationErrors: FastApiValidationError[] | undefined;

  try {
    const body: unknown = await response.json();
    const detail = (body as { detail?: unknown } | null)?.detail;

    if (response.status === 422 && Array.isArray(detail)) {
      validationErrors = detail as FastApiValidationError[];
      message = 'Request validation failed';
    } else if (typeof detail === 'string') {
      message = detail;
    }
  } catch {
    // No JSON body to read — fall back to the status text above.
  }

  return { status: response.status, message, validationErrors };
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiConfig.baseUrl}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    throw await parseApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/**
 * Some endpoints in this API return a 2xx HTTP status even when the business operation
 * itself did not succeed — the outcome lives in a `status` field on the response body,
 * not the HTTP status code. Documented case: `POST /depot/restock/{supply_history_id}/confirm`
 * (docs/api/depot.md) always returns 201 Created, even when the delivered quantity doesn't
 * match what Factory dispatched — in that case the body comes back with `"status": "rejected"`
 * instead of `"status": "confirmed"`, and `apiRequest` above sees a perfectly successful
 * response and returns it normally. Callers must run the body through this helper (or read
 * `body.status` themselves) before treating a 2xx response as a business success.
 */
export function assertBusinessStatus<T extends { status: string }>(
  body: T,
  failureStatus: T['status'],
): T {
  if (body.status === failureStatus) {
    throw new Error(`Business operation reported failure status "${body.status}"`);
  }
  return body;
}
