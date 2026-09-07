'use client';

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Customized,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import {
  SPEND_COLOR,
  chartScale,
  orderedLineSeries,
  toLineChartModel,
  visitScale,
  type LineSeries,
} from '@/lib/spendChart';
import type { MonthSpend } from '@/lib/types';
import { axisMoney, formatMonth, money, visitLabel } from '@/lib/format';

const AXIS = { fontSize: 11, fill: '#78716c' };
const GRID = '#d6d3d1';
const VISIT_LINE = '#2563eb';
const LINE_DRAW_MS = 1500;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const monthAxis = {
  dataKey: 'month' as const,
  tick: AXIS,
  tickLine: false,
  axisLine: false,
  tickFormatter: (value: string) => formatMonth(value),
};

const valueAxis = {
  tick: AXIS,
  tickLine: false,
  axisLine: false,
};

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

function ChartLegend({
  items,
}: {
  items: {
    key: string;
    label: string;
    color: string;
    swatch: 'bar' | 'line';
    emphasize?: boolean;
  }[];
}) {
  return (
    <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-1.5 text-xs">
          <span
            className={
              item.swatch === 'bar'
                ? 'inline-block h-2 w-2.5 rounded-sm'
                : 'inline-block h-0.5 w-3.5 rounded-full'
            }
            style={{ backgroundColor: item.color }}
            aria-hidden="true"
          />
          <span
            className={item.emphasize ? 'font-semibold text-stone-900' : 'text-stone-600'}
          >
            {item.label}
          </span>
        </li>
      ))}
    </ul>
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
            <XAxis {...monthAxis} />
            <YAxis
              {...valueAxis}
              yAxisId="spend"
              width={44}
              ticks={spend.ticks}
              domain={[0, spend.scaleMax]}
              tickFormatter={(value: number) => axisMoney(value)}
            />
            <YAxis
              {...valueAxis}
              yAxisId="visits"
              orientation="right"
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
              fill={SPEND_COLOR}
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
      <ChartLegend
        items={[
          { key: 'spent', label: 'Spent', color: SPEND_COLOR, swatch: 'bar' },
          { key: 'visits', label: 'Visits', color: VISIT_LINE, swatch: 'line' },
        ]}
      />
    </div>
  );
}

function axisScale<T>(map: unknown): ((value: T) => number) | null {
  if (!map || typeof map !== 'object') return null;
  const first = Object.values(
    map as Record<
      string,
      { scale?: ((value: T) => number) & { bandwidth?: () => number } }
    >
  )[0];
  const scale = first?.scale;
  if (typeof scale !== 'function') return null;
  const bandwidth = scale.bandwidth?.() ?? 0;
  return (value: T) => scale(value) + bandwidth / 2;
}

function signNonZero(value: number) {
  return value < 0 ? -1 : 1;
}

/** Steffen slope at the middle point — same as d3-shape curveMonotoneX. */
function monotoneSlope(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
) {
  const h0 = x1 - x0;
  const h1 = x2 - x1;
  const s0 = (y1 - y0) / (h0 || (h1 < 0 ? -0 : 0));
  const s1 = (y2 - y1) / (h1 || (h0 < 0 ? -0 : 0));
  const p = (s0 * h1 + s1 * h0) / (h0 + h1);
  return (
    (signNonZero(s0) + signNonZero(s1)) *
      Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0
  );
}

function endpointSlope(y0: number, y1: number, h: number, other: number) {
  return h ? (3 * (y1 - y0) / h - other) / 2 : other;
}

function monotoneTangents(xs: number[], ys: number[]): number[] {
  const n = xs.length;
  const slopes = new Array<number>(n).fill(0);
  if (n < 2) return slopes;
  if (n === 2) {
    const slope = (ys[1] - ys[0]) / (xs[1] - xs[0] || 1);
    slopes[0] = slope;
    slopes[1] = slope;
    return slopes;
  }
  for (let i = 1; i < n - 1; i += 1) {
    slopes[i] = monotoneSlope(xs[i - 1], ys[i - 1], xs[i], ys[i], xs[i + 1], ys[i + 1]);
  }
  slopes[0] = endpointSlope(ys[0], ys[1], xs[1] - xs[0], slopes[1]);
  slopes[n - 1] = endpointSlope(ys[n - 2], ys[n - 1], xs[n - 1] - xs[n - 2], slopes[n - 2]);
  return slopes;
}

function sampleAlongLine(
  xs: number[],
  ys: number[],
  x: number
): { y: number; angle: number } {
  if (xs.length === 0) return { y: 0, angle: 0 };
  if (xs.length === 1) return { y: ys[0], angle: 0 };

  let index = 0;
  while (index < xs.length - 2 && xs[index + 1] < x) index += 1;
  if (x <= xs[0]) index = 0;
  if (x >= xs[xs.length - 1]) index = xs.length - 2;

  const tangents = monotoneTangents(xs, ys);
  const h = xs[index + 1] - xs[index] || 1;
  const t = Math.min(1, Math.max(0, (x - xs[index]) / h));
  const y0 = ys[index];
  const y1 = ys[index + 1];
  const m0 = tangents[index];
  const m1 = tangents[index + 1];
  const t2 = t * t;
  const t3 = t2 * t;
  const y =
    (2 * t3 - 3 * t2 + 1) * y0 +
    (t3 - 2 * t2 + t) * h * m0 +
    (-2 * t3 + 3 * t2) * y1 +
    (t3 - t2) * h * m1;
  const dy =
    ((6 * t2 - 6 * t) * y0 +
      (3 * t2 - 4 * t + 1) * h * m0 +
      (-6 * t2 + 6 * t) * y1 +
      (3 * t2 - 2 * t) * h * m1) /
    h;
  return { y, angle: (Math.atan2(dy, 1) * 180) / Math.PI };
}

const LABEL_MOVE_MS = 1600;

type PlotScales = {
  xs: number[];
  yScale: (value: number) => number;
};

type PlotStore = {
  get: () => PlotScales | null;
  set: (update: PlotScales | ((prev: PlotScales | null) => PlotScales | null)) => void;
  subscribe: (listener: () => void) => () => void;
};

function usePlotStore(): PlotStore {
  const plotRef = useRef<PlotScales | null>(null);
  const listenersRef = useRef(new Set<() => void>());
  return useMemo(
    () => ({
      get() {
        return plotRef.current;
      },
      set(update) {
        const next = typeof update === 'function' ? update(plotRef.current) : update;
        if (next === plotRef.current) return;
        plotRef.current = next;
        listenersRef.current.forEach((listener) => listener());
      },
      subscribe(listener) {
        listenersRef.current.add(listener);
        return () => {
          listenersRef.current.delete(listener);
        };
      },
    }),
    []
  );
}

const PlotStoreContext = createContext<PlotStore>({
  get: () => null,
  set: () => {},
  subscribe: () => () => {},
});

function usePlot(): PlotScales | null {
  const store = useContext(PlotStoreContext);
  const [plot, setPlot] = useState<PlotScales | null>(() => store.get());
  useLayoutEffect(() => store.subscribe(() => setPlot(store.get())), [store]);
  return plot;
}

function drawLinePaths(root: HTMLElement) {
  const paths = [...root.querySelectorAll<SVGPathElement>('.recharts-line-curve')];
  if (paths.length === 0) return false;
  const lengths = paths.map((path) => {
    try {
      return path.getTotalLength();
    } catch {
      return 0;
    }
  });
  if (lengths.some((length) => length < 2)) return false;

  root.classList.add('is-drawing');
  for (const [index, path] of paths.entries()) {
    const length = lengths[index];
    path.style.transition = 'none';
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
  }
  void root.offsetWidth;
  for (const path of paths) {
    path.style.transition = `stroke-dashoffset ${LINE_DRAW_MS}ms ease`;
    path.style.strokeDashoffset = '0';
  }
  window.setTimeout(() => root.classList.remove('is-drawing'), LINE_DRAW_MS);
  return true;
}

function ScaleProbe({
  xAxisMap,
  yAxisMap,
  rows,
}: {
  xAxisMap?: unknown;
  yAxisMap?: unknown;
  rows: Record<string, string | number>[];
}) {
  const store = useContext(PlotStoreContext);
  const setPlot = store.set;
  const xScale = axisScale<string>(xAxisMap);
  const yScale = axisScale<number>(yAxisMap);
  const xsKey = xScale
    ? rows.map((row) => xScale(String(row.month))).join(',')
    : '';

  useLayoutEffect(() => {
    if (!xScale || !yScale || rows.length === 0) return;
    const xs = rows.map((row) => xScale(String(row.month)));
    if (xs.some((value) => !Number.isFinite(value))) return;
    setPlot((prev) => {
      if (
        prev &&
        prev.xs.length === xs.length &&
        prev.xs.every((value, index) => value === xs[index]) &&
        prev.yScale(0) === yScale(0) &&
        prev.yScale(1) === yScale(1)
      ) {
        return prev;
      }
      return { xs, yScale };
    });
  }, [setPlot, xScale, yScale, xsKey, rows]);

  return null;
}

const labelEase = cubicBezier(0.55, 0, 0.45, 1);

function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  function sample(t: number, a: number, b: number) {
    const u = 1 - t;
    return 3 * u * u * t * a + 3 * u * t * t * b + t * t * t;
  }
  function slope(t: number, a: number, b: number) {
    const u = 1 - t;
    return 3 * u * u * a + 6 * u * t * (b - a) + 3 * t * t * (1 - b);
  }
  return (t: number) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    let u = t;
    for (let i = 0; i < 6; i += 1) {
      const x = sample(u, x1, x2);
      const dx = slope(u, x1, x2);
      if (Math.abs(dx) < 1e-6) break;
      u = Math.min(1, Math.max(0, u - (x - t) / dx));
    }
    return sample(u, y1, y2);
  };
}

function targetXForIndex(index: number, count: number, firstX: number, lastX: number) {
  if (count <= 1) return firstX + (lastX - firstX) * 0.5;
  return firstX + ((lastX - firstX) * (index + 1)) / (count + 1);
}

function poseOnLine(
  x: number,
  values: number[],
  plot: PlotScales
): { x: number; y: number; angle: number } {
  const ys = values.map((value) => plot.yScale(value));
  const { y, angle } = sampleAlongLine(plot.xs, ys, x);
  const rad = (angle * Math.PI) / 180;
  const offset = 10;
  return {
    x: x + Math.sin(rad) * offset,
    y: y - Math.cos(rad) * offset,
    angle,
  };
}

function LineNameOverlay({
  series,
  rows,
}: {
  series: LineSeries[];
  rows: Record<string, string | number>[];
}) {
  const plot = usePlot();
  const [labelsReady, setLabelsReady] = useState(false);
  const [, setFrame] = useState(0);
  const animRef = useRef(
    new Map<string, { from: number; to: number; start: number; x: number }>()
  );
  const rafRef = useRef(0);

  const targets = series.map((line, index) => ({
    ...line,
    targetX: plot
      ? targetXForIndex(index, series.length, plot.xs[0], plot.xs[plot.xs.length - 1])
      : 0,
    values: rows.map((row) => Number(row[line.key] ?? 0)),
  }));
  const orderKey = targets.map((line) => `${line.key}:${line.targetX.toFixed(1)}`).join('|');

  useLayoutEffect(() => {
    if (prefersReducedMotion()) {
      setLabelsReady(true);
      return;
    }
    const timer = window.setTimeout(() => setLabelsReady(true), LINE_DRAW_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useLayoutEffect(() => {
    if (!plot || targets.length === 0) return;

    const now = performance.now();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const keep = new Set(targets.map((line) => line.key));
    let running = false;

    for (const line of targets) {
      const prev = animRef.current.get(line.key);
      if (!prev) {
        animRef.current.set(line.key, {
          from: line.targetX,
          to: line.targetX,
          start: now,
          x: line.targetX,
        });
        continue;
      }
      if (Math.abs(prev.to - line.targetX) < 0.5) {
        prev.to = line.targetX;
        continue;
      }
      if (reduceMotion) {
        animRef.current.set(line.key, {
          from: line.targetX,
          to: line.targetX,
          start: now,
          x: line.targetX,
        });
        continue;
      }
      animRef.current.set(line.key, {
        from: prev.x,
        to: line.targetX,
        start: now,
        x: prev.x,
      });
      running = true;
    }

    for (const key of [...animRef.current.keys()]) {
      if (!keep.has(key)) animRef.current.delete(key);
    }

    cancelAnimationFrame(rafRef.current);
    if (!running) {
      setFrame((frame) => frame + 1);
      return;
    }

    const step = (time: number) => {
      let next = false;
      for (const anim of animRef.current.values()) {
        const progress = Math.min(1, (time - anim.start) / LABEL_MOVE_MS);
        anim.x = anim.from + (anim.to - anim.from) * labelEase(progress);
        if (progress < 1) next = true;
      }
      setFrame((frame) => frame + 1);
      if (next) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    setFrame((frame) => frame + 1);

    return () => cancelAnimationFrame(rafRef.current);
    // X targets come from orderKey; y-scale updates should not restart sliding.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderKey]);

  if (!labelsReady || !plot || targets.length === 0) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
      aria-hidden="true"
    >
      {targets.map((line) => {
        const anim = animRef.current.get(line.key);
        const x = anim?.x ?? line.targetX;
        const pose = poseOnLine(x, line.values, plot);
        return (
          <text
            key={line.key}
            x={pose.x}
            y={pose.y}
            fill={line.color}
            fontSize={11}
            fontWeight={500}
            textAnchor="middle"
            dominantBaseline="middle"
            transform={`rotate(${pose.angle} ${pose.x} ${pose.y})`}
            style={{ paintOrder: 'stroke', stroke: 'white', strokeWidth: 3 }}
          >
            {line.label}
          </text>
        );
      })}
    </svg>
  );
}

export function RunningTotalChart({
  months,
  restaurantOrder,
}: {
  months: MonthSpend[];
  restaurantOrder?: number[];
}) {
  const { rows, series, restaurantMax } = toLineChartModel(months);
  const { ticks, scaleMax } = chartScale(restaurantMax);
  const labelSeries = orderedLineSeries(series, restaurantOrder);
  const plotStore = usePlotStore();
  const plotRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = plotRef.current;
    if (!root || prefersReducedMotion()) return;

    let cancelled = false;
    let attempts = 0;
    let frame = 0;

    const tryDraw = () => {
      if (cancelled) return;
      if (drawLinePaths(root)) return;
      attempts += 1;
      if (attempts < 40) frame = requestAnimationFrame(tryDraw);
    };
    frame = requestAnimationFrame(tryDraw);
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <PlotStoreContext.Provider value={plotStore}>
      <div className="w-full">
        <div
          ref={plotRef}
          className="relative h-[28rem] w-full [&.is-drawing_.recharts-line-dots]:opacity-0"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rows} margin={{ top: 22, right: 28, left: 4, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke={GRID} />
              <XAxis {...monthAxis} />
              <YAxis
                {...valueAxis}
                width={48}
                ticks={ticks}
                domain={[0, scaleMax]}
                tickFormatter={(value: number) => axisMoney(value)}
              />
              <Tooltip
                cursor={{ stroke: '#a8a29e', strokeDasharray: '3 3' }}
                content={<LineTooltip />}
              />
              {series.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  name={line.label}
                  stroke={line.color}
                  strokeWidth={2}
                  dot={{ r: 2.75, fill: line.color, strokeWidth: 0 }}
                  activeDot={{ r: 4.5 }}
                  isAnimationActive={false}
                />
              ))}
              <Customized
                component={(props: Record<string, unknown>) => (
                  <ScaleProbe
                    xAxisMap={props.xAxisMap}
                    yAxisMap={props.yAxisMap}
                    rows={rows}
                  />
                )}
              />
            </LineChart>
          </ResponsiveContainer>
          <LineNameOverlay series={labelSeries} rows={rows} />
        </div>
      </div>
    </PlotStoreContext.Provider>
  );
}
