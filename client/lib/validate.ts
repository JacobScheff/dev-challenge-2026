import { HttpError, restaurantNotFound } from '@/lib/errors';

/**
 * Path ids that aren't a positive integer (`abc`, `-1`, `1.5`, `0`) have no
 * matching row. The contract treats that as 404, not 400.
 */
export function parseRestaurantId(id: string): number {
  if (!/^[1-9]\d*$/.test(id)) {
    restaurantNotFound();
  }

  const parsed = Number(id);
  if (!Number.isSafeInteger(parsed)) {
    restaurantNotFound();
  }

  return parsed;
}

export function requireBody(body: unknown): Record<string, unknown> {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Invalid body');
  }
  return body as Record<string, unknown>;
}

export function optionalString(
  value: unknown,
  field: string,
  maxLength?: number
): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') {
    throw new HttpError(400, `${field} must be a string`);
  }
  const trimmed = value.trim();
  if (maxLength !== undefined && trimmed.length > maxLength) {
    throw new HttpError(400, `${field} must be ${maxLength} characters or fewer`);
  }
  return trimmed === '' ? null : trimmed;
}