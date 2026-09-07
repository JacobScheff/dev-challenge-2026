import type { Restaurant, RestaurantSpend } from './types';

export const SORT_OPTIONS = [
  { key: 'name', label: 'Name', forward: 'A–Z', reverse: 'Z–A' },
  { key: 'spent', label: 'Spent', forward: 'High–low', reverse: 'Low–high' },
  { key: 'lastVisit', label: 'Last visit', forward: 'Newest', reverse: 'Oldest' },
] as const;

export type RestaurantSortKey = (typeof SORT_OPTIONS)[number]['key'];

export interface RestaurantListItem extends Restaurant {
  totalSpent: number;
  visitCount: number;
  lastVisit: string | null;
}

export function toRestaurantListItem(
  restaurant: Restaurant,
  spend: RestaurantSpend | undefined
): RestaurantListItem {
  return {
    ...restaurant,
    totalSpent: spend?.totalSpent ?? 0,
    visitCount: spend?.visitCount ?? 0,
    lastVisit: spend?.lastVisit ?? null,
  };
}

/** Default direction is A–Z, most spent, most recent. */
function isDefaultDescending(key: RestaurantSortKey): boolean {
  return key !== 'name';
}

function compareNames(a: RestaurantListItem, b: RestaurantListItem): number {
  return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }) || a.id - b.id;
}

function compare(a: RestaurantListItem, b: RestaurantListItem, key: RestaurantSortKey): number {
  if (key === 'spent') {
    return a.totalSpent - b.totalSpent || compareNames(a, b);
  }
  if (key === 'lastVisit') {
    return (a.lastVisit ?? '').localeCompare(b.lastVisit ?? '') || compareNames(a, b);
  }
  return compareNames(a, b);
}

export function sortRestaurants(
  restaurants: RestaurantListItem[],
  key: RestaurantSortKey,
  reversed: boolean
): RestaurantListItem[] {
  const descending = isDefaultDescending(key) !== reversed;
  return [...restaurants].sort((a, b) => {
    const result = compare(a, b, key);
    return descending ? -result : result;
  });
}

function optionFor(key: RestaurantSortKey) {
  return SORT_OPTIONS.find((item) => item.key === key)!;
}

export function directionLabel(key: RestaurantSortKey, reversed: boolean): string {
  const option = optionFor(key);
  return reversed ? option.reverse : option.forward;
}

export function sortLabel(key: RestaurantSortKey): string {
  return optionFor(key).label;
}

function isSortKey(value: unknown): value is RestaurantSortKey {
  return SORT_OPTIONS.some((option) => option.key === value);
}

export function parseSortState(raw: string | null): {
  key: RestaurantSortKey;
  reversed: boolean;
} | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    const { key, reversed } = parsed as { key?: unknown; reversed?: unknown };
    if (!isSortKey(key) || typeof reversed !== 'boolean') return null;
    return { key, reversed };
  } catch {
    return null;
  }
}
