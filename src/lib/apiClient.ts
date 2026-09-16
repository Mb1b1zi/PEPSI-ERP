import { apiConfig } from './config';
import { getStoredSession, clearStoredSession } from './authSession';
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

/**
 * Set by AuthProvider on mount so a 401 from any request can send the user back to /login
 * without apiClient needing to know about React Router. Left null (no-op) until then, e.g.
 * for requests made before the app has finished its first render.
 */
let onUnauthorized: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const session = getStoredSession();

  const response = await fetch(`${apiConfig.baseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const error = await parseApiError(response);
    if (error.status === 401) {
      clearStoredSession();
      onUnauthorized?.();
    }
    throw error;
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
/** Narrows an unknown catch value to the ApiError shape thrown by apiRequest above. */
function isApiError(err: unknown): err is ApiError {
  return typeof err === 'object' && err !== null && 'status' in err && 'message' in err;
}

/**
 * Surfaces the backend's own error message (e.g. a 409 "insufficient stock") when available,
 * falling back to a generic message for network failures or anything not shaped like ApiError.
 */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  return isApiError(err) ? err.message : fallback;
}

export function assertBusinessStatus<T extends { status: string }>(
  body: T,
  failureStatus: T['status'],
): T {
  if (body.status === failureStatus) {
    throw new Error(`Business operation reported failure status "${body.status}"`);
  }
  return body;
}
