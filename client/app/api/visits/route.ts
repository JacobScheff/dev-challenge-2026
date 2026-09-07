import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError, restaurantNotFound } from '@/lib/errors';
import { VISIT_COLUMNS, toVisit } from '@/lib/types';
import { parseVisitBody } from './validate';

/**
 * POST /api/visits
 * Log a visit. The restaurant must already exist.
 */
export async function POST(req: Request) {
  try {
    const { restaurantId, date, amountSpent, notes } = parseVisitBody(await req.json());

    // INSERT ... SELECT so a missing restaurant is 0 rows, not an FK 500.
    const { rows } = await pool.query(
      `INSERT INTO visits ("restaurantId", date, "amountSpent", notes)
       SELECT $1, $2, $3, $4
       WHERE EXISTS (SELECT 1 FROM restaurants WHERE id = $1)
       RETURNING ${VISIT_COLUMNS}`,
      [restaurantId, date, amountSpent, notes]
    );

    if (rows.length === 0) {
      restaurantNotFound();
    }

    return NextResponse.json(toVisit(rows[0]), { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
