import Link from 'next/link';
import { RestaurantList } from '@/components/RestaurantList';
import { SpendOverTime } from '@/components/SpendOverTime';
import { getRestaurants, getSummary } from '@/lib/apiClient';
import { formatDate, money, visitLabel } from '@/lib/format';
import { toRestaurantListItem } from '@/lib/restaurantSort';

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
          <RestaurantList
            restaurants={restaurants.map((restaurant) =>
              toRestaurantListItem(restaurant, spendById.get(restaurant.id))
            )}
          />
        )}
      </section>
    </div>
  );
}
