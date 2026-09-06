import { HttpError } from '@/lib/errors';

/**
 * Ids that aren't a positive integer (`abc`, `-1`, `1.5`, `0`) have no
 * matching row. The contract treats that as 404, not 400.
 */
export function parseRestaurantId(id: string): number {
  if (!/^[1-9]\d*$/.test(id)) {
    throw new HttpError(404, 'Restaurant not found');
  }

  const parsed = Number(id);
  if (!Number.isSafeInteger(parsed)) {
    throw new HttpError(404, 'Restaurant not found');
  }

  return parsed;
}

export type RestaurantInput = {
  name: string;
  cuisine: string | null;
  address: string | null;
  rating: number | null;
};

function optionalString(value: unknown, field: string): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    throw new HttpError(400, `${field} must be a string`);
  }
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

/**
 * Shared by POST and PUT. Rejects missing `name`, wrong types, and a
 * `rating` outside 0–5 before anything reaches the database.
 */
export function parseRestaurantBody(body: unknown): RestaurantInput {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Invalid body');
  }

  const { name, cuisine, address, rating } = body as Record<string, unknown>;

  if (typeof name !== 'string' || name.trim() === '') {
    throw new HttpError(400, 'name is required');
  }

  if (rating !== undefined && rating !== null) {
    if (typeof rating !== 'number' || !Number.isFinite(rating)) {
      throw new HttpError(400, 'rating must be a number');
    }
    if (rating < 0 || rating > 5) {
      throw new HttpError(400, 'rating must be between 0 and 5');
    }
  }

  return {
    name: name.trim(),
    cuisine: optionalString(cuisine, 'cuisine'),
    address: optionalString(address, 'address'),
    rating: rating === undefined || rating === null ? null : rating,
  };
}
