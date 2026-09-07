'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormError } from '@/components/FormError';
import { RestaurantForm } from '@/components/RestaurantForm';
import { StarRating } from '@/components/StarRating';
import { ApiError, deleteRestaurant, updateRestaurant } from '@/lib/apiClient';
import type { Restaurant } from '@/lib/types';

export function RestaurantHeader({ restaurant }: { restaurant: Restaurant }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  if (editing) {
    return (
      <RestaurantForm
        initial={restaurant}
        submitLabel="Save changes"
        onCancel={() => setEditing(false)}
        onSubmit={async (values) => {
          await updateRestaurant(restaurant.id, values);
          setEditing(false);
          router.refresh();
        }}
      />
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{restaurant.name}</h2>
          <p className="mt-1 text-sm text-stone-500">
            {[restaurant.cuisine, restaurant.address].filter(Boolean).join(' · ') ||
              'No details yet'}
          </p>
        </div>
        <StarRating rating={restaurant.rating} size="md" />
      </div>

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
      ) : (
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
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
        </div>
      )}
    </div>
  );
}
