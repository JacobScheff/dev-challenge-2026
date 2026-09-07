import { HttpError } from '@/lib/errors';

export type VisitInput = {
  restaurantId: number;
  date: string;
  amountSpent: number;
  notes: string | null;
};

function todayYmd(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

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

/**
 * Shared by POST /api/visits. restaurantId must be a positive integer
 * in the body (400 if it isn't). A well-formed id that doesn't exist
 * is a 404 — the route checks that after parsing.
 */
export function parseVisitBody(body: unknown): VisitInput {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new HttpError(400, 'Invalid body');
  }

  const { restaurantId, date, amountSpent, notes } = body as Record<string, unknown>;

  if (
    typeof restaurantId !== 'number' ||
    !Number.isInteger(restaurantId) ||
    restaurantId < 1
  ) {
    throw new HttpError(400, 'restaurantId must be a positive integer');
  }

  let parsedNotes: string | null = null;
  if (notes !== undefined && notes !== null) {
    if (typeof notes !== 'string') {
      throw new HttpError(400, 'notes must be a string');
    }
    const trimmed = notes.trim();
    if (trimmed.length > 2000) {
      throw new HttpError(400, 'notes must be 2000 characters or fewer');
    }
    parsedNotes = trimmed === '' ? null : trimmed;
  }

  return {
    restaurantId,
    date: parseDateOnly(date),
    amountSpent: parseAmountSpent(amountSpent),
    notes: parsedNotes,
  };
}
