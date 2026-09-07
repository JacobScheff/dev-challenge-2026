import Link from 'next/link';
import { SpendOverTime } from '@/components/SpendOverTime';
import { StarRating } from '@/components/StarRating';
import { getRestaurants, getSummary } from '@/lib/apiClient';
import { formatDate, money, visitLabel } from '@/lib/format';

export default async function HomePage() {
  const [restaurants, summary] = await Promise.all([
    getRestaurants(),
    getSummary(),
  ]);

  const spendById = new Map(summary.byRestaurant.map((row) => [row.id, row]));

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
          The tab
        </p>
        <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">
          {money(summary.totalSpent)}
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-stone-100 pt-4 text-sm">
          <div>
            <dt className="text-stone-500">Visits</dt>
            <dd className="mt-0.5 font-medium">{visitLabel(summary.visitCount)}</dd>
          </div>
          <div>
            <dt className="text-stone-500">Last visit</dt>
            <dd className="mt-0.5 font-medium">
              {summary.lastVisit ? formatDate(summary.lastVisit) : '—'}
            </dd>
          </div>
        </dl>
      </section>

      <SpendOverTime byMonth={summary.byMonth} />

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-stone-500">Restaurants</h2>
          <Link
            href="/restaurants/new"
            className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Add restaurant
          </Link>
        </div>
        {restaurants.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-8 text-center text-sm text-stone-500">
            No restaurants yet. Add one to start tracking visits.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            {restaurants.map((restaurant, index) => {
              const spend = spendById.get(restaurant.id);
              return (
                <li
                  key={restaurant.id}
                  className={index > 0 ? 'border-t border-stone-100' : ''}
                >
                  <Link
                    href={`/restaurants/${restaurant.id}`}
                    className="flex items-start justify-between gap-4 px-4 py-3.5 transition hover:bg-stone-50"
                  >
                    <div className="min-w-0">
                      <span className="font-medium">{restaurant.name}</span>
                      <div className="mt-0.5">
                        <StarRating rating={restaurant.rating} />
                      </div>
                      <p className="mt-0.5 truncate text-sm text-stone-500">
                        {[restaurant.cuisine, restaurant.address]
                          .filter(Boolean)
                          .join(' · ') || 'No details yet'}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      {spend ? (
                        <>
                          <p className="font-medium tabular-nums">
                            {money(spend.totalSpent)}
                          </p>
                          <p className="mt-0.5 text-xs text-stone-500">
                            {visitLabel(spend.visitCount)}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-stone-400">No visits</p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
