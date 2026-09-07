import { notFound } from 'next/navigation';
import { BackLink } from '@/components/BackLink';
import { MonthlyBarChart } from '@/components/SpendCharts';
import { ApiError, getRestaurant, getRestaurantVisits } from '@/lib/apiClient';
import { money, visitLabel } from '@/lib/format';
import { monthsFromVisits } from '@/lib/types';
import { LogVisitForm } from './LogVisitForm';
import { RestaurantHeader } from './RestaurantHeader';
import { VisitList } from './VisitList';

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
  const byMonth = monthsFromVisits(visits);

  return (
    <div className="space-y-8">
      <div>
        <BackLink />

        <header className="mt-4">
          <RestaurantHeader restaurant={restaurant} />

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

      {byMonth.length > 0 ? (
        <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            The tab by month
          </p>
          <p className="mt-1 text-sm text-stone-500">
            What this restaurant added to the tab each month, plus visits.
          </p>
          <div className="mt-4">
            <MonthlyBarChart months={byMonth} />
          </div>
        </section>
      ) : null}

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
          <VisitList visits={visits} />
        )}
      </section>
    </div>
  );
}
