import { HttpError } from '@/lib/errors';
import { todayYmd } from '@/lib/format';
import { optionalString, requireBody } from '@/lib/validate';

/**
 * Calendar date as `YYYY-MM-DD`. Rejects the wrong shape, impossible
 * days (Feb 31), and dates that haven't happened yet.
 */
function parseDateOnly(value: unknown): string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, 'date must be YYYY-MM-DD');
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    throw new HttpError(400, 'date must be a real calendar date');
  }

  if (value > todayYmd()) {
    throw new HttpError(400, 'date cannot be in the future');
  }

  return value;
}

/**
 * Amount in dollars. Required — the tab is the product — and capped to
 * NUMERIC(10, 2): non-negative, finite, at most two decimal places.
 */
function parseAmountSpent(value: unknown): number {
  if (value === undefined || value === null) {
    throw new HttpError(400, 'amountSpent is required');
  }
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new HttpError(400, 'amountSpent must be a number');
  }
  if (value < 0) {
    throw new HttpError(400, 'amountSpent cannot be negative');
  }
  if (value > 99_999_999.99) {
    throw new HttpError(400, 'amountSpent is too large');
  }

  const cents = value * 100;
  if (Math.abs(cents - Math.round(cents)) > 1e-8) {
    throw new HttpError(400, 'amountSpent can have at most two decimal places');
  }

  return Math.round(cents) / 100;
}

/** Date, spend, and notes — shared by create and update. */
export function parseVisitWrite(body: unknown) {
  const { date, amountSpent, notes } = requireBody(body);
  return {
    date: parseDateOnly(date),
    amountSpent: parseAmountSpent(amountSpent),
    notes: optionalString(notes, 'notes', 2000),
  };
}

/**
 * Shared by POST /api/visits. restaurantId must be a positive integer
 * in the body (400 if it isn't). A well-formed id that doesn't exist
 * is a 404 — the route checks that after parsing.
 */
export function parseVisitBody(body: unknown) {
  const { restaurantId } = requireBody(body);

  if (
    typeof restaurantId !== 'number' ||
    !Number.isInteger(restaurantId) ||
    restaurantId < 1
  ) {
    throw new HttpError(400, 'restaurantId must be a positive integer');
  }

  return {
    restaurantId,
    ...parseVisitWrite(body),
  };
}
