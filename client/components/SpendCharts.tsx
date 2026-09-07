'use client';

import type { ReactNode } from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import { chartScale, toLineChartModel } from '@/lib/spendChart';
import type { MonthSpend } from '@/lib/types';
import { axisMoney, formatMonth, money, visitLabel } from '@/lib/format';

const AXIS = { fontSize: 11, fill: '#78716c' };
const GRID = '#d6d3d1';
const VISIT_LINE = '#2563eb';

function visitScale(max: number): { ticks: number[]; scaleMax: number } {
  const top = Math.max(1, Math.ceil(max));
  const step = top <= 5 ? 1 : Math.ceil(top / 4);
  const scaleMax = Math.ceil(top / step) * step;
  const ticks: number[] = [];
  for (let value = 0; value <= scaleMax; value += step) ticks.push(value);
  return { ticks, scaleMax };
}

function TooltipFrame({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2 shadow-md">
      <p className="text-xs font-medium text-stone-500">{title}</p>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function LineTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const rows = [...payload].sort(
    (a, b) => Number(b.value ?? 0) - Number(a.value ?? 0)
  );

  return (
    <TooltipFrame title={formatMonth(String(label ?? ''))}>
      <ul className="space-y-0.5">
        {rows.map((item) => (
          <li
            key={String(item.dataKey)}
            className="flex items-center justify-between gap-6 text-xs"
          >
            <span className="flex items-center gap-1.5" style={{ color: item.color }}>
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              {item.name}
            </span>
            <span className="font-medium tabular-nums text-stone-800">
              {money(Number(item.value ?? 0))}
            </span>
          </li>
        ))}
      </ul>
    </TooltipFrame>
  );
}

function BarTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  const spent = Number(row?.totalSpent ?? 0);
  const visits = Number(row?.visitCount ?? 0);

  return (
    <TooltipFrame title={formatMonth(String(label ?? ''))}>
      <p className="text-sm font-medium tabular-nums text-stone-800">{money(spent)}</p>
      <p className="mt-0.5 text-xs font-medium" style={{ color: VISIT_LINE }}>
        {visitLabel(visits)}
      </p>
    </TooltipFrame>
  );
}

export function MonthlyBarChart({ months }: { months: MonthSpend[] }) {
  const spend = chartScale(
    Math.max(...months.map((month) => month.totalSpent), 0)
  );
  const visits = visitScale(
    Math.max(...months.map((month) => month.visitCount), 0)
  );

  return (
    <div className="w-full">
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={months}
            margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="month"
              tick={AXIS}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: string) => formatMonth(value)}
            />
            <YAxis
              yAxisId="spend"
              tick={AXIS}
              tickLine={false}
              axisLine={false}
              width={44}
              ticks={spend.ticks}
              domain={[0, spend.scaleMax]}
              tickFormatter={(value: number) => axisMoney(value)}
            />
            <YAxis
              yAxisId="visits"
              orientation="right"
              tick={AXIS}
              tickLine={false}
              axisLine={false}
              width={28}
              allowDecimals={false}
              ticks={visits.ticks}
              domain={[0, visits.scaleMax]}
            />
            <Tooltip
              cursor={{ fill: 'rgba(28, 25, 23, 0.06)' }}
              content={<BarTooltip />}
            />
            <Bar
              yAxisId="spend"
              dataKey="totalSpent"
              name="Spent"
              fill="#1c1917"
              radius={[4, 4, 0, 0]}
            />
            <Line
              yAxisId="visits"
              type="monotone"
              dataKey="visitCount"
              name="Visits"
              stroke={VISIT_LINE}
              strokeWidth={2.25}
              dot={{ r: 3, fill: VISIT_LINE, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        <li className="flex items-center gap-1.5 text-xs text-stone-600">
          <span
            className="inline-block h-2 w-2.5 rounded-sm bg-stone-900"
            aria-hidden="true"
          />
          Spent
        </li>
        <li className="flex items-center gap-1.5 text-xs text-stone-600">
          <span
            className="inline-block h-0.5 w-3.5 rounded-full"
            style={{ backgroundColor: VISIT_LINE }}
            aria-hidden="true"
          />
          Visits
        </li>
      </ul>
    </div>
  );
}

export function RunningTotalChart({
  months,
  showTotal,
}: {
  months: MonthSpend[];
  showTotal: boolean;
}) {
  const { rows, series, restaurantMax, totalMax } = toLineChartModel(months);
  const visibleSeries = showTotal ? series : series.filter((line) => !line.isTotal);
  const { ticks, scaleMax } = chartScale(showTotal ? totalMax : restaurantMax);

  return (
    <div className="w-full">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows} margin={{ top: 8, right: 16, left: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={GRID} />
            <XAxis
              dataKey="month"
              tick={AXIS}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value: string) => formatMonth(value)}
            />
            <YAxis
              tick={AXIS}
              tickLine={false}
              axisLine={false}
              width={48}
              ticks={ticks}
              domain={[0, scaleMax]}
              tickFormatter={(value: number) => axisMoney(value)}
            />
            <Tooltip
              cursor={{ stroke: '#a8a29e', strokeDasharray: '3 3' }}
              content={<LineTooltip />}
            />
            {visibleSeries.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.label}
                stroke={line.color}
                strokeWidth={line.isTotal ? 2.75 : 2}
                dot={{ r: line.isTotal ? 3.5 : 2.75, fill: line.color, strokeWidth: 0 }}
                activeDot={{ r: line.isTotal ? 5 : 4.5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {visibleSeries.map((line) => (
          <li key={line.key} className="flex items-center gap-1.5 text-xs">
            <span
              className="inline-block h-0.5 w-3.5 rounded-full"
              style={{ backgroundColor: line.color }}
              aria-hidden="true"
            />
            <span
              className={line.isTotal ? 'font-semibold text-stone-900' : 'text-stone-600'}
            >
              {line.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
