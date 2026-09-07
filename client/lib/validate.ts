import { HttpError, restaurantNotFound, visitNotFound } from '@/lib/errors';

/**
 * Path ids that aren't a positive integer (`abc`, `-1`, `1.5`, `0`) have no
 * matching row. The contract treats that as 404, not 400.
 */
function parsePositiveIntId(id: string): number | null {
  if (!/^[1-9]\d*$/.test(id)) return null;
  const parsed = Number(id);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function parseRestaurantId(id: string): number {
  const parsed = parsePositiveIntId(id);
  if (parsed === null) restaurantNotFound();
  return parsed;
}

export function parseVisitId(id: string): number {
  const parsed = parsePositiveIntId(id);
  if (parsed === null) visitNotFound();
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