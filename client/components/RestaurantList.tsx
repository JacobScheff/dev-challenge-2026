'use client';

import Link from 'next/link';
import { useLayoutEffect, useRef, useState } from 'react';
import { StarRating } from '@/components/StarRating';
import { formatDate, money, restaurantDetails, visitLabel } from '@/lib/format';
import {
  SORT_OPTIONS,
  directionLabel,
  parseSortState,
  sortLabel,
  sortRestaurants,
  type RestaurantListItem,
  type RestaurantSortKey,
} from '@/lib/restaurantSort';

const SORT_STORAGE_KEY = 'feeding-brennen.restaurant-sort';
const SORT_MOVE_MS = 450;
const SORT_MOVE_EASE = 'cubic-bezier(0.22, 1, 0.36, 1)';
const COLUMNS =
  'grid grid-cols-[minmax(0,1fr)_5.5rem_6.75rem] gap-4 sm:grid-cols-[minmax(0,1fr)_6rem_7.25rem]';

function restaurantNodes(list: HTMLElement): HTMLElement[] {
  return Array.from(list.children).filter(
    (node): node is HTMLElement =>
      node instanceof HTMLElement && Boolean(node.dataset.restaurantId)
  );
}

function captureItemTops(list: HTMLElement): Map<string, number> {
  const tops = new Map<string, number>();
  for (const node of restaurantNodes(list)) {
    tops.set(node.dataset.restaurantId!, node.getBoundingClientRect().top);
  }
  return tops;
}

function animateSortReorder(list: HTMLElement, previousTops: Map<string, number>) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const nodes = restaurantNodes(list);
  for (const node of nodes) {
    for (const animation of node.getAnimations()) {
      animation.cancel();
    }
  }

  for (const node of nodes) {
    const previousTop = previousTops.get(node.dataset.restaurantId!);
    if (previousTop == null) continue;
    const deltaY = previousTop - node.getBoundingClientRect().top;
    if (Math.abs(deltaY) < 1) continue;

    node.style.zIndex = String(Math.round(Math.abs(deltaY)));
    const animation = node.animate(
      [{ transform: `translateY(${deltaY}px)` }, { transform: 'translateY(0)' }],
      { duration: SORT_MOVE_MS, easing: SORT_MOVE_EASE }
    );
    animation.addEventListener('finish', () => {
      node.style.zIndex = '';
    });
  }
}

function readStoredSort(): { key: RestaurantSortKey; reversed: boolean } | null {
  try {
    return parseSortState(window.localStorage.getItem(SORT_STORAGE_KEY));
  } catch {
    return null;
  }
}

function SortChevron({ reversed }: { reversed: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-3.5 w-3.5 shrink-0 transition-transform ${reversed ? 'rotate-180' : ''}`}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function SortBar({
  sortKey,
  reversed,
  onSort,
}: {
  sortKey: RestaurantSortKey;
  reversed: boolean;
  onSort: (key: RestaurantSortKey) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Sort restaurants"
      className={`${COLUMNS} border-b border-stone-200 px-4`}
    >
      {SORT_OPTIONS.map((option) => {
        const active = option.key === sortKey;
        const direction = active ? directionLabel(option.key, reversed) : option.forward;
        const align = option.key === 'name' ? 'justify-start' : 'justify-end';
        return (
          <button
            key={option.key}
            type="button"
            aria-pressed={active}
            aria-label={
              active
                ? `Sorted by ${option.label}, ${direction}. Click to reverse.`
                : `Sort by ${option.label}`
            }
            title={active ? 'Click again to reverse' : `Sort by ${option.label}`}
            onClick={() => onSort(option.key)}
            className={`flex w-full cursor-pointer items-center py-2.5 text-xs font-medium underline-offset-4 transition ${align} ${
              active
                ? 'text-stone-900'
                : 'text-stone-500 hover:text-stone-800 hover:underline decoration-stone-300'
            }`}
          >
            <span className="inline-flex items-center gap-1">
              {option.label}
              {active ? <SortChevron reversed={reversed} /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function RestaurantList({ restaurants }: { restaurants: RestaurantListItem[] }) {
  const [sortKey, setSortKey] = useState<RestaurantSortKey>('name');
  const [reversed, setReversed] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);
  const previousTopsRef = useRef<Map<string, number>>(new Map());
  const shouldAnimateRef = useRef(false);

  useLayoutEffect(() => {
    const stored = readStoredSort();
    if (!stored) return;
    setSortKey(stored.key);
    setReversed(stored.reversed);
  }, []);

  useLayoutEffect(() => {
    const list = listRef.current;
    if (!list || !shouldAnimateRef.current) return;
    shouldAnimateRef.current = false;
    animateSortReorder(list, previousTopsRef.current);
  }, [sortKey, reversed]);

  function handleSort(nextKey: RestaurantSortKey) {
    const list = listRef.current;
    if (list) {
      previousTopsRef.current = captureItemTops(list);
      shouldAnimateRef.current = true;
    }
    const nextReversed = nextKey === sortKey ? !reversed : false;
    setSortKey(nextKey);
    setReversed(nextReversed);
    window.localStorage.setItem(
      SORT_STORAGE_KEY,
      JSON.stringify({ key: nextKey, reversed: nextReversed })
    );
  }

  const sorted = sortRestaurants(restaurants, sortKey, reversed);
  const currentDirection = directionLabel(sortKey, reversed);
  const currentLabel = sortLabel(sortKey);

  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      <SortBar sortKey={sortKey} reversed={reversed} onSort={handleSort} />
      <p className="sr-only" aria-live="polite">
        {`Sorted by ${currentLabel}, ${currentDirection}`}
      </p>
      <ul ref={listRef}>
        {sorted.map((restaurant, index) => {
          const hasVisits = restaurant.visitCount > 0;
          return (
            <li
              key={restaurant.id}
              data-restaurant-id={restaurant.id}
              className={`relative bg-white ${index > 0 ? 'border-t border-stone-100' : ''}`}
            >
              <Link
                href={`/restaurants/${restaurant.id}`}
                className={`${COLUMNS} items-start px-4 py-3.5 transition hover:bg-stone-50`}
              >
                <div className="min-w-0">
                  <span className="font-medium">{restaurant.name}</span>
                  <div className="mt-0.5">
                    <StarRating rating={restaurant.rating} />
                  </div>
                  <p className="mt-0.5 truncate text-sm text-stone-500">
                    {restaurantDetails(restaurant.cuisine, restaurant.address)}
                  </p>
                </div>
                <div className="text-right">
                  {hasVisits ? (
                    <>
                      <p className="font-medium tabular-nums">
                        {money(restaurant.totalSpent)}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {visitLabel(restaurant.visitCount)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-stone-400">—</p>
                  )}
                </div>
                <div className="text-right">
                  {hasVisits && restaurant.lastVisit ? (
                    <p
                      className={`whitespace-nowrap text-sm ${
                        sortKey === 'lastVisit' ? 'font-medium text-stone-800' : 'text-stone-500'
                      }`}
                    >
                      {formatDate(restaurant.lastVisit)}
                    </p>
                  ) : (
                    <p className="text-sm text-stone-400">—</p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
