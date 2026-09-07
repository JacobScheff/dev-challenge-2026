import type { MonthSpend } from './types';

const LINE_COLORS = [
  '#0d9488',
  '#d97706',
  '#e11d48',
  '#4f46e5',
  '#ea580c',
  '#65a30d',
  '#0284c7',
] as const;

const TOTAL_COLOR = '#1c1917';

type LineSeries = {
  key: string;
  label: string;
  color: string;
  isTotal: boolean;
};

function restaurantMeta(months: MonthSpend[]): { id: number; name: string }[] {
  const names = new Map<number, string>();
  for (const month of months) {
    for (const row of month.byRestaurant) names.set(row.id, row.name);
  }
  return [...names.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([id, name]) => ({ id, name }));
}

function niceTicks(max: number): number[] {
  if (max <= 0) return [0];
  const rough = max / 4;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const residual = rough / mag;
  const nice = residual >= 5 ? 10 : residual >= 2 ? 5 : residual >= 1 ? 2 : 1;
  const step = nice * mag;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= top + 1e-8; value += step) {
    ticks.push(value);
  }
  return ticks;
}

export function chartScale(max: number): { ticks: number[]; scaleMax: number } {
  const ticks = niceTicks(max);
  return { ticks, scaleMax: ticks[ticks.length - 1] ?? 1 };
}

export function toLineChartModel(months: MonthSpend[]): {
  rows: Record<string, string | number>[];
  series: LineSeries[];
  restaurantMax: number;
  totalMax: number;
} {
  const restaurants = restaurantMeta(months);
  const series: LineSeries[] = [
    ...restaurants.map((restaurant, index) => ({
      key: `r${restaurant.id}`,
      label: restaurant.name,
      color: LINE_COLORS[index % LINE_COLORS.length],
      isTotal: false,
    })),
    { key: 'total', label: 'Total', color: TOTAL_COLOR, isTotal: true },
  ];

  const runningById = new Map<number, number>(restaurants.map((row) => [row.id, 0]));
  let totalRunning = 0;
  const rows: Record<string, string | number>[] = [];

  for (const month of months) {
    const spentById = new Map(month.byRestaurant.map((row) => [row.id, row.totalSpent]));
    totalRunning += month.totalSpent;
    const row: Record<string, string | number> = { month: month.month, total: totalRunning };
    for (const restaurant of restaurants) {
      const next = (runningById.get(restaurant.id) ?? 0) + (spentById.get(restaurant.id) ?? 0);
      runningById.set(restaurant.id, next);
      row[`r${restaurant.id}`] = next;
    }
    rows.push(row);
  }

  // Spend is non-negative, so running totals peak on the last month.
  const last = rows[rows.length - 1];
  const totalMax = last ? Number(last.total) || 0 : 0;
  const restaurantMax = last
    ? Math.max(0, ...restaurants.map((restaurant) => Number(last[`r${restaurant.id}`]) || 0))
    : 0;
  return { rows, series, restaurantMax, totalMax };
}
