'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormError } from '@/components/FormError';
import { RestaurantList } from '@/components/RestaurantList';
import { StarRating } from '@/components/StarRating';
import { UnsavedChangesProvider, useUnsavedChanges } from '@/components/UnsavedChanges';
import { ApiError, createRestaurant } from '@/lib/apiClient';
import type { RestaurantListItem } from '@/lib/restaurantSort';

const inlineName =
  'w-full min-w-0 bg-transparent font-medium text-stone-900 outline-none border-b border-stone-300 focus:border-stone-800 placeholder:text-stone-400';
const inlineDetail =
  'min-w-0 flex-1 bg-transparent text-sm text-stone-500 outline-none border-b border-stone-300 focus:border-stone-800 placeholder:text-stone-400';

export function RestaurantsSection({
  restaurants,
}: {
  restaurants: RestaurantListItem[];
}) {
  return (
    <UnsavedChangesProvider>
      <RestaurantsSectionInner restaurants={restaurants} />
    </UnsavedChangesProvider>
  );
}

function RestaurantsSectionInner({
  restaurants,
}: {
  restaurants: RestaurantListItem[];
}) {
  const [creating, setCreating] = useState(false);

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-stone-500">Restaurants</h2>
        {creating ? null : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-stone-800"
          >
            Add restaurant
          </button>
        )}
      </div>
      {restaurants.length === 0 && !creating ? (
        <p className="rounded-xl border border-dashed border-stone-300 bg-white px-4 py-8 text-center text-sm text-stone-500">
          No restaurants yet. Add one to start tracking visits.
        </p>
      ) : (
        <RestaurantList
          restaurants={restaurants}
          leading={
            creating ? <NewRestaurantRow onClose={() => setCreating(false)} /> : null
          }
        />
      )}
    </section>
  );
}

function NewRestaurantRow({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [address, setAddress] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useUnsavedChanges('restaurant-new', true);

  async function save() {
    const trimmedName = name.trim();
    if (trimmedName === '') {
      setError('Name is required.');
      return;
    }
    if (rating != null && (rating < 0 || rating > 5)) {
      setError('Rating must be between 0 and 5.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await createRestaurant({
        name: trimmedName,
        cuisine: cuisine.trim() === '' ? null : cuisine.trim(),
        address: address.trim() === '' ? null : address.trim(),
        rating,
      });
      onClose();
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save restaurant');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className="flex items-start justify-between gap-4 px-4 py-3.5">
        <div className="min-w-0 flex-1 overflow-hidden">
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="Name"
            placeholder="Name"
            autoFocus
            className={inlineName}
          />
          <div className="mt-0.5">
            <StarRating rating={rating} onChange={setRating} />
          </div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <input
              type="text"
              value={cuisine}
              onChange={(event) => setCuisine(event.target.value)}
              aria-label="Cuisine"
              placeholder="Cuisine"
              className={inlineDetail}
            />
            <span className="shrink-0 text-sm text-stone-400" aria-hidden="true">
              ·
            </span>
            <input
              type="text"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              aria-label="Address"
              placeholder="Address"
              className={inlineDetail}
            />
          </div>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-800 shadow-sm transition hover:bg-stone-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="rounded-lg bg-stone-900 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
      {error ? (
        <div className="px-4 pb-3">
          <FormError message={error} />
        </div>
      ) : null}
    </form>
  );
}
