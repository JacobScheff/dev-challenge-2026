import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError, visitNotFound } from '@/lib/errors';
import { VISIT_COLUMNS, toVisit } from '@/lib/types';
import { parseVisitId } from '@/lib/validate';
import { parseVisitWrite } from '../validate';

type Params = { params: { id: string } };

/**
 * PUT /api/visits/:id
 * Update an existing visit's date, amount, and notes.
 */
export async function PUT(req: Request, { params }: Params) {
  try {
    const id = parseVisitId(params.id);
    const { date, amountSpent, notes } = parseVisitWrite(await req.json());

    const { rows } = await pool.query(
      `UPDATE visits
       SET date = $1, "amountSpent" = $2, notes = $3
       WHERE id = $4
       RETURNING ${VISIT_COLUMNS}`,
      [date, amountSpent, notes, id]
    );

    if (rows.length === 0) {
      visitNotFound();
    }

    return NextResponse.json(toVisit(rows[0]));
  } catch (err) {
    return handleError(err);
  }
}

/**
 * DELETE /api/visits/:id
 * Delete a single visit.
 */
export async function DELETE(_req: Request, { params }: Params) {
  try {
    const id = parseVisitId(params.id);
    const { rows } = await pool.query(
      'DELETE FROM visits WHERE id = $1 RETURNING id',
      [id]
    );

    if (rows.length === 0) {
      visitNotFound();
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return handleError(err);
  }
}
