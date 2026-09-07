import { HttpError } from '@/lib/errors';
import { optionalString, requireBody } from '@/lib/validate';

/**
 * Shared by POST and PUT. Rejects missing `name`, wrong types, and a
 * `rating` outside 0–5 before anything reaches the database.
 */
export function parseRestaurantBody(body: unknown) {
  const { name, cuisine, address, rating } = requireBody(body);

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
