import type { Restaurant, RestaurantSpend } from './types';

export type RestaurantSortKey = 'name' | 'spent' | 'lastVisit';

export interface RestaurantListItem extends Restaurant {
  totalSpent: number;
  visitCount: number;
  lastVisit: string | null;
}

export const SORT_OPTIONS: {
  key: RestaurantSortKey;
  label: string;
  forward: string;
  reverse: string;
}[] = [
  { key: 'name', label: 'Name', forward: 'A–Z', reverse: 'Z–A' },
  { key: 'spent', label: 'Spent', forward: 'High–low', reverse: 'Low–high' },
  { key: 'lastVisit', label: 'Last visit', forward: 'Newest', reverse: 'Oldest' },
];

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
export function isDefaultDescending(key: RestaurantSortKey): boolean {
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

export function directionLabel(key: RestaurantSortKey, reversed: boolean): string {
  const option = SORT_OPTIONS.find((item) => item.key === key);
  if (!option) return '';
  return reversed ? option.reverse : option.forward;
}
