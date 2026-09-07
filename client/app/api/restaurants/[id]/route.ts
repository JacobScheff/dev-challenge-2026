import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError, restaurantNotFound } from '@/lib/errors';
import { RESTAURANT_COLUMNS, toRestaurant } from '@/lib/types';
import { parseRestaurantId } from '@/lib/validate';
import { parseRestaurantBody } from '../validate';

type Params = { params: { id: string } };

/**
 * GET /api/restaurants/:id
 * Returns a single restaurant, or 404 if it doesn't exist.
 */
export async function GET(_req: Request, { params }: Params) {
  try {
    const id = parseRestaurantId(params.id);
    const { rows } = await pool.query(
      `SELECT ${RESTAURANT_COLUMNS} FROM restaurants WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      restaurantNotFound();
    }

    return NextResponse.json(toRestaurant(rows[0]));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * PUT /api/restaurants/:id
 * Update an existing restaurant.
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    const id = parseRestaurantId(params.id);
    const { name, cuisine, address, rating } = parseRestaurantBody(await req.json());

    const { rows } = await pool.query(
      `UPDATE restaurants
       SET name = $1, cuisine = $2, address = $3, rating = $4
       WHERE id = $5
       RETURNING ${RESTAURANT_COLUMNS}`,
      [name, cuisine, address, rating, id]
    );

    if (rows.length === 0) {
      restaurantNotFound();
    }

    return NextResponse.json(toRestaurant(rows[0]));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * DELETE /api/restaurants/:id
 * Delete a restaurant and all visits associated with it.
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const id = parseRestaurantId(params.id);
    const { rows } = await pool.query(
      'DELETE FROM restaurants WHERE id = $1 RETURNING id',
      [id]
    );

    if (rows.length === 0) {
      restaurantNotFound();
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
