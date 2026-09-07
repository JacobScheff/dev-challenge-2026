import { NextResponse } from 'next/server';

/**
 * Throw this from a route (or a validator) and `handleError` will turn it
 * into the matching JSON response. Keeps status-code decisions in one place.
 */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
  }
}

export function restaurantNotFound(): never {
  throw new HttpError(404, 'Restaurant not found');
}

function postgresCode(err: unknown): string | undefined {
  if (err && typeof err === 'object' && 'code' in err && typeof (err as { code: unknown }).code === 'string') {
    return (err as { code: string }).code;
  }
  return undefined;
}

/**
 * Central error -> HTTP response mapper. Call it from a route's `catch` block
 * so handlers don't each invent their own status codes or leak internals.
 *
 *   try {
 *     ...
 *   } catch (err) {
 *     return handleError(err);
 *   }
 */
export function handleError(err: unknown): NextResponse {
  if (err instanceof HttpError) {
    return NextResponse.json({ error: err.message }, { status: err.status });
  }

  // Malformed JSON body from `req.json()`.
  if (err instanceof SyntaxError) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Known Postgres failures. Messages stay generic so we don't leak schema.
  switch (postgresCode(err)) {
    case '23505': // unique_violation
      return NextResponse.json({ error: 'Already exists' }, { status: 409 });
    case '23503': // foreign_key_violation
      return NextResponse.json({ error: 'Conflict' }, { status: 409 });
    case '23502': // not_null_violation
    case '23514': // check_violation
    case '22P02': // invalid_text_representation
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
  }

  console.error('Unhandled API error:', err);
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}
