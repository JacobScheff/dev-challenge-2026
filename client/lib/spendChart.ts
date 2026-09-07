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

export const SPEND_COLOR = '#1c1917';

export type LineSeries = {
  key: string;
  label: string;
  color: string;
};

function restaurantId(series: LineSeries): number {
  return Number(series.key.slice(1));
}

function restaurantMeta(months: MonthSpend[]): { id: number; name: string }[] {
  const names = new Map<number, string>();
  for (const month of months) {
    for (const row of month.byRestaurant) names.set(row.id, row.name);
  }
  return [...names.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([id, name]) => ({ id, name }));
}

/** Label order follows the restaurant list. */
export function orderedLineSeries(
  series: LineSeries[],
  restaurantOrder: number[] | undefined
): LineSeries[] {
  const rank = new Map((restaurantOrder ?? []).map((id, index) => [id, index]));
  return [...series].sort((a, b) => {
    const left = rank.get(restaurantId(a));
    const right = rank.get(restaurantId(b));
    if (left == null && right == null) return restaurantId(a) - restaurantId(b);
    if (left == null) return 1;
    if (right == null) return -1;
    return left - right;
  });
}

function colorForRestaurant(id: number, idsById: number[]): string {
  const index = idsById.indexOf(id);
  return LINE_COLORS[(index < 0 ? 0 : index) % LINE_COLORS.length];
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

type Scale = { ticks: number[]; scaleMax: number };

export function chartScale(max: number): Scale {
  const ticks = niceTicks(max);
  return { ticks, scaleMax: ticks[ticks.length - 1] ?? 1 };
}

export function visitScale(max: number): Scale {
  const top = Math.max(1, Math.ceil(max));
  const step = top <= 5 ? 1 : Math.ceil(top / 4);
  const scaleMax = Math.ceil(top / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= scaleMax; value += step) ticks.push(value);
  return { ticks, scaleMax };
}

export function toLineChartModel(months: MonthSpend[]): {
  rows: Record<string, string | number>[];
  series: LineSeries[];
  restaurantMax: number;
} {
  const restaurants = restaurantMeta(months);
  const idsById = [...restaurants].map((row) => row.id).sort((a, b) => a - b);
  const series: LineSeries[] = restaurants.map((restaurant) => ({
    key: `r${restaurant.id}`,
    label: restaurant.name,
    color: colorForRestaurant(restaurant.id, idsById),
  }));

  const runningById = new Map<number, number>(restaurants.map((row) => [row.id, 0]));
  const rows: Record<string, string | number>[] = [];

  for (const month of months) {
    const spentById = new Map(month.byRestaurant.map((row) => [row.id, row.totalSpent]));
    const row: Record<string, string | number> = { month: month.month };
    for (const restaurant of restaurants) {
      const next = (runningById.get(restaurant.id) ?? 0) + (spentById.get(restaurant.id) ?? 0);
      runningById.set(restaurant.id, next);
      row[`r${restaurant.id}`] = next;
    }
    rows.push(row);
  }

  // Spend is non-negative, so running totals peak on the last month.
  const last = rows[rows.length - 1];
  const restaurantMax = last
    ? Math.max(0, ...restaurants.map((restaurant) => Number(last[`r${restaurant.id}`]) || 0))
    : 0;
  return { rows, series, restaurantMax };
}
