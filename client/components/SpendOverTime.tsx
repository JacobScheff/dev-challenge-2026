'use client';

import { useLayoutEffect, useState } from 'react';
import { RunningTotalChart } from '@/components/SpendCharts';
import { sortRestaurants, type RestaurantListItem } from '@/lib/restaurantSort';
import type { MonthSpend } from '@/lib/types';
import { useRestaurantSort } from '@/lib/useRestaurantSort';

function EmptyChart() {
  return (
    <p className="rounded-lg border border-dashed border-stone-200 bg-stone-50 px-3 py-6 text-center text-sm text-stone-500">
      No visits yet. Log a meal to see spending over time.
    </p>
  );
}

export function SpendOverTime({
  byMonth,
  restaurants,
}: {
  byMonth: MonthSpend[];
  restaurants: RestaurantListItem[];
}) {
  const { sortKey, reversed } = useRestaurantSort();
  const restaurantOrder = sortRestaurants(restaurants, sortKey, reversed).map(
    (restaurant) => restaurant.id
  );
  const [chartReady, setChartReady] = useState(false);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => setChartReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <section className="mx-auto w-full max-w-5xl rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
          Spending over time
        </p>
        <p className="mt-1 text-sm text-stone-500">
          Running tab per restaurant. Hover a point for the amount.
        </p>
      </div>
      <div className="mt-4">
        {byMonth.length === 0 ? (
          <EmptyChart />
        ) : chartReady ? (
          <RunningTotalChart months={byMonth} restaurantOrder={restaurantOrder} />
        ) : (
          <div className="h-[28rem] w-full" />
        )}
      </div>
    </section>
  );
}
