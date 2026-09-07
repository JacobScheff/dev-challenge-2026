import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ApiError, getRestaurant, getRestaurantVisits } from '@/lib/apiClient';
import { StarRating } from '@/components/StarRating';
import { formatDate, money, visitLabel } from '@/lib/format';
import { LogVisitForm } from './LogVisitForm';

type Params = { params: { id: string } };

export default async function RestaurantPage({ params }: Params) {
  let restaurant;
  let visits;
  try {
    [restaurant, visits] = await Promise.all([
      getRestaurant(params.id),
      getRestaurantVisits(params.id),
    ]);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  }

  const totalSpent = visits.reduce((sum, visit) => sum + (visit.amountSpent ?? 0), 0);

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-stone-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.83 10l3.94 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>

        <header className="mt-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight">
                {restaurant.name}
              </h2>
              <p className="mt-1 text-sm text-stone-500">
                {[restaurant.cuisine, restaurant.address].filter(Boolean).join(' · ') ||
                  'No details yet'}
              </p>
            </div>
            <StarRating rating={restaurant.rating} size="md" />
          </div>

          <dl className="mt-5 grid grid-cols-2 gap-3 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
            <div>
              <dt className="text-xs text-stone-500">Total Spent</dt>
              <dd className="mt-0.5 text-lg font-semibold tabular-nums">
                {money(totalSpent)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-stone-500">Visits</dt>
              <dd className="mt-0.5 text-lg font-semibold">
                {visitLabel(visits.length)}
              </dd>
            </div>
          </dl>
        </header>
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-medium">Log a visit</h3>
        <p className="mt-0.5 text-sm text-stone-500">
          Add what this meal cost. Notes are optional.
        </p>
        <div className="mt-4">
          <LogVisitForm restaurantId={restaurant.id} />
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-medium text-stone-500">Visits</h3>
        {visits.length === 0 ? (
          <p className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-8 text-center text-sm text-stone-500">
            Nothing logged yet. Use the form above to add the first visit.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
            {visits.map((visit, index) => (
              <li
                key={visit.id}
                className={`flex items-start justify-between gap-4 px-4 py-3 ${
                  index > 0 ? 'border-t border-stone-100' : ''
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{formatDate(visit.date)}</p>
                  {visit.notes ? (
                    <p className="mt-0.5 text-sm text-stone-500">{visit.notes}</p>
                  ) : null}
                </div>
                <p className="shrink-0 text-sm font-medium tabular-nums">
                  {visit.amountSpent == null ? '—' : money(visit.amountSpent)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
