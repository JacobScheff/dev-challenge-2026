import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError, restaurantNotFound } from '@/lib/errors';
import { VISIT_COLUMNS, toVisit } from '@/lib/types';
import { parseRestaurantId } from '@/lib/validate';

type Params = { params: { id: string } };

/**
 * GET /api/restaurants/:id/visits
 * Visits for one restaurant, newest first. A missing restaurant is 404
 * (not an empty list) so "never went" and "no such place" stay distinct.
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const id = parseRestaurantId(params.id);

    const restaurant = await pool.query(
      'SELECT id FROM restaurants WHERE id = $1',
      [id]
    );
    if (restaurant.rows.length === 0) {
      restaurantNotFound();
    }

    const { rows } = await pool.query(
      `SELECT ${VISIT_COLUMNS}
       FROM visits
       WHERE "restaurantId" = $1
       ORDER BY date DESC, created_at DESC`,
      [id]
    );

    return NextResponse.json(rows.map(toVisit));
  } catch (err) {
    return handleError(err);
  }
}
