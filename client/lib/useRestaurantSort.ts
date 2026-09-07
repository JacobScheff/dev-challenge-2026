'use client';

import { useLayoutEffect, useState } from 'react';
import {
  SORT_STORAGE_KEY,
  parseSortState,
  type RestaurantSortKey,
} from './restaurantSort';

export type RestaurantSortState = {
  key: RestaurantSortKey;
  reversed: boolean;
};

const DEFAULT_SORT: RestaurantSortState = { key: 'name', reversed: false };

const listeners = new Set<(state: RestaurantSortState) => void>();

function readSort(): RestaurantSortState {
  try {
    return parseSortState(window.localStorage.getItem(SORT_STORAGE_KEY)) ?? DEFAULT_SORT;
  } catch {
    return DEFAULT_SORT;
  }
}

export function useRestaurantSort() {
  const [state, setState] = useState<RestaurantSortState>(DEFAULT_SORT);

  useLayoutEffect(() => {
    setState(readSort());
    const onChange = (next: RestaurantSortState) => setState(next);
    listeners.add(onChange);
    return () => {
      listeners.delete(onChange);
    };
  }, []);

  function applySort(nextKey: RestaurantSortKey) {
    const next: RestaurantSortState = {
      key: nextKey,
      reversed: nextKey === state.key ? !state.reversed : false,
    };
    window.localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(next));
    listeners.forEach((listener) => listener(next));
  }

  return { sortKey: state.key, reversed: state.reversed, applySort };
}
