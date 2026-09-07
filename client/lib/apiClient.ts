/**
 * The client side of the API: helpers the frontend uses to call the endpoints.
 *
 * Don't confuse this with `app/api/`, which is the other side of the same
 * boundary - the route handlers that *implement* those endpoints. This file
 * only ever talks to them over HTTP.
 *
 * The shapes these helpers return live in `lib/types.ts`, shared with the
 * handlers that produce them.
 */
import type { Restaurant, SpendSummary, Visit } from './types';

// Server Components fetch on the server, where relative URLs don't resolve.
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

type RestaurantWrite = {
  name: string;
  cuisine?: string | null;
  address?: string | null;
  rating?: number | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: 'no-store', ...init });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body: unknown = await res.json();
      if (
        body &&
        typeof body === 'object' &&
        'error' in body &&
        typeof (body as { error: unknown }).error === 'string'
      ) {
        message = (body as { error: string }).error;
      }
    } catch {
      // Keep the status fallback if the body wasn't JSON.
    }
    throw new ApiError(res.status, message);
  }
  // DELETE returns 204 with an empty body.
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json();
}

export function getRestaurants(): Promise<Restaurant[]> {
  return request('/api/restaurants');
}

export function getRestaurant(id: number | string): Promise<Restaurant> {
  return request(`/api/restaurants/${id}`);
}

export function getRestaurantVisits(id: number | string): Promise<Visit[]> {
  return request(`/api/restaurants/${id}/visits`);
}

export function getSummary(): Promise<SpendSummary> {
  return request('/api/summary');
}

type VisitWrite = {
  date: string;
  amountSpent: number;
  notes?: string | null;
};

export function createVisit(input: VisitWrite & { restaurantId: number }): Promise<Visit> {
  return request('/api/visits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export function updateVisit(id: number | string, input: VisitWrite): Promise<Visit> {
  return request(`/api/visits/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export function deleteVisit(id: number | string): Promise<void> {
  return request(`/api/visits/${id}`, { method: 'DELETE' });
}

export function createRestaurant(input: RestaurantWrite): Promise<Restaurant> {
  return request('/api/restaurants', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export function updateRestaurant(
  id: number | string,
  input: RestaurantWrite
): Promise<Restaurant> {
  return request(`/api/restaurants/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
}

export function deleteRestaurant(id: number | string): Promise<void> {
  return request(`/api/restaurants/${id}`, { method: 'DELETE' });
}
