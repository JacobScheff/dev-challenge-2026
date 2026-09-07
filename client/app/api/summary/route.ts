import { NextResponse } from 'next/server';
import { pool } from '@/db/pool';
import { handleError } from '@/lib/errors';
import { toSpendSummary } from '@/lib/types';

/**
 * GET /api/summary
 * The running tab: totals across every visit, then a per-restaurant
 * breakdown. Restaurants with no visits are omitted.
 */
export async function GET() {
  try {
    const [totals, byRestaurant] = await Promise.all([
      pool.query(
        `SELECT COALESCE(SUM("amountSpent"), 0) AS "totalSpent",
                COUNT(*)::int AS "visitCount",
                MAX(date) AS "lastVisit"
         FROM visits`
      ),
      pool.query(
        `SELECT r.id, r.name,
                COALESCE(SUM(v."amountSpent"), 0) AS "totalSpent",
                COUNT(v.id)::int AS "visitCount",
                MAX(v.date) AS "lastVisit"
         FROM visits v
         JOIN restaurants r ON r.id = v."restaurantId"
         GROUP BY r.id, r.name
         ORDER BY SUM(v."amountSpent") DESC NULLS LAST, r.name ASC`
      ),
    ]);

    return NextResponse.json(toSpendSummary(totals.rows[0], byRestaurant.rows));
  } catch (err) {
    return handleError(err);
  }
}
