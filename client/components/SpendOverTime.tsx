'use client';

import { useLayoutEffect, useState } from 'react';
import { RunningTotalChart } from '@/components/SpendCharts';
import type { MonthSpend } from '@/lib/types';

const SHOW_TOTAL_KEY = 'feeding-brennen.show-total';

function readShowTotal(): boolean {
  return window.localStorage.getItem(SHOW_TOTAL_KEY) === '1';
}

function EmptyChart() {
  return (
    <p className="rounded-lg border border-dashed border-stone-200 bg-stone-50 px-3 py-6 text-center text-sm text-stone-500">
      No visits yet. Log a meal to see spending over time.
    </p>
  );
}

function TotalToggle({
  checked,
  onChange,
  animate,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  animate: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="inline-flex shrink-0 items-center gap-2 text-xs font-medium text-stone-600"
    >
      <span
        className={`relative inline-block h-5 w-9 shrink-0 rounded-full ${
          animate ? 'transition-colors' : ''
        } ${checked ? 'bg-stone-900' : 'bg-stone-300'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 block h-4 w-4 rounded-full bg-white shadow-sm ${
            animate ? 'transition-transform' : ''
          } ${checked ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </span>
      Show total
    </button>
  );
}

export function SpendOverTime({ byMonth }: { byMonth: MonthSpend[] }) {
  const [showTotal, setShowTotal] = useState(false);
  const [chartReady, setChartReady] = useState(false);
  const [animateToggle, setAnimateToggle] = useState(false);

  useLayoutEffect(() => {
    setShowTotal(readShowTotal());
    const frame = requestAnimationFrame(() => {
      setChartReady(true);
      setAnimateToggle(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  function handleShowTotal(next: boolean) {
    setShowTotal(next);
    window.localStorage.setItem(SHOW_TOTAL_KEY, next ? '1' : '0');
  }

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Spending over time
          </p>
          <p className="mt-1 text-sm text-stone-500">
            {showTotal
              ? 'Running tab across every restaurant, plus a Total line. Hover a point for the amount.'
              : 'Running tab per restaurant. Turn on Total to see the combined line.'}
          </p>
        </div>
        {byMonth.length > 0 ? (
          <TotalToggle
            checked={showTotal}
            onChange={handleShowTotal}
            animate={animateToggle}
          />
        ) : null}
      </div>
      <div className="mt-4">
        {byMonth.length === 0 ? (
          <EmptyChart />
        ) : chartReady ? (
          <RunningTotalChart months={byMonth} showTotal={showTotal} />
        ) : (
          <div className="h-56 w-full" />
        )}
      </div>
    </section>
  );
}
