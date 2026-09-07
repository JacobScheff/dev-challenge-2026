'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormError } from '@/components/FormError';
import { StarRating } from '@/components/StarRating';
import { useUnsavedChanges } from '@/components/UnsavedChanges';
import { ApiError, deleteRestaurant, updateRestaurant } from '@/lib/apiClient';
import { restaurantDetails } from '@/lib/format';
import type { Restaurant } from '@/lib/types';

const inlineName =
  'w-full min-w-0 max-w-full bg-transparent text-2xl font-semibold tracking-tight text-stone-900 outline-none border-b border-stone-300 focus:border-stone-800 placeholder:text-stone-400';
const inlineDetail =
  'min-w-0 flex-1 bg-transparent text-sm text-stone-500 outline-none border-b border-stone-300 focus:border-stone-800 placeholder:text-stone-400';

export function RestaurantHeader({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(restaurant.name);
  const [cuisine, setCuisine] = useState(restaurant.cuisine ?? '');
  const [address, setAddress] = useState(restaurant.address ?? '');
  const [rating, setRating] = useState<number | null>(restaurant.rating);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  useUnsavedChanges(`restaurant-${restaurant.id}`, editing);

  function startEdit() {
    setName(restaurant.name);
    setCuisine(restaurant.cuisine ?? '');
    setAddress(restaurant.address ?? '');
    setRating(restaurant.rating);
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

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
      await updateRestaurant(restaurant.id, {
        name: trimmedName,
        cuisine: cuisine.trim() === '' ? null : cuisine.trim(),
        address: address.trim() === '' ? null : address.trim(),
        rating,
      });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save restaurant');
    } finally {
      setSaving(false);
    }
  }

  async function onConfirmDelete() {
    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteRestaurant(restaurant.id);
      router.push('/');
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Could not delete restaurant');
      setDeleting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 overflow-hidden">
          {editing ? (
            <input
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              aria-label="Name"
              placeholder="Name"
              className={inlineName}
            />
          ) : (
            <h2 className="break-words text-2xl font-semibold tracking-tight [overflow-wrap:anywhere]">
              {restaurant.name}
            </h2>
          )}
          <div className="mt-1">
            <StarRating
              rating={editing ? rating : restaurant.rating}
              size="md"
              onChange={editing ? setRating : undefined}
            />
          </div>
          {editing ? (
            <div className="mt-1 flex items-center gap-1.5">
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
          ) : (
            <p className="mt-1 break-words text-sm text-stone-500 [overflow-wrap:anywhere]">
              {restaurantDetails(restaurant.cuisine, restaurant.address)}
            </p>
          )}
        </div>
        {confirmingDelete ? null : (
          <div className="flex shrink-0 flex-wrap justify-end gap-2">
            {editing ? (
              <>
                <button
                  type="button"
                  disabled={saving}
                  onClick={cancelEdit}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-stone-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void save()}
                  className="rounded-lg bg-stone-900 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={startEdit}
                  className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-stone-50"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(true)}
                  className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-50"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {error ? (
        <div className="mt-3">
          <FormError message={error} />
        </div>
      ) : null}

      {confirmingDelete ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-900">
            Delete {restaurant.name}? This also removes every visit logged here.
            This cannot be undone.
          </p>
          {deleteError ? (
            <div className="mt-2">
              <FormError message={deleteError} />
            </div>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={deleting}
              onClick={onConfirmDelete}
              className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-800 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete restaurant'}
            </button>
            <button
              type="button"
              disabled={deleting}
              onClick={() => {
                setConfirmingDelete(false);
                setDeleteError(null);
              }}
              className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-stone-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
