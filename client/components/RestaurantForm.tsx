'use client';

import { useState } from 'react';
import { FormError } from '@/components/FormError';
import { ApiError } from '@/lib/apiClient';

export type RestaurantFormValues = {
  name: string;
  cuisine: string | null;
  address: string | null;
  rating: number | null;
};

export function RestaurantForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<RestaurantFormValues>;
  submitLabel: string;
  onSubmit: (values: RestaurantFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [cuisine, setCuisine] = useState(initial?.cuisine ?? '');
  const [address, setAddress] = useState(initial?.address ?? '');
  const [rating, setRating] = useState(
    initial?.rating == null ? '' : String(initial.rating)
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    if (trimmedName === '') {
      setError('Name is required.');
      return;
    }

    let parsedRating: number | null = null;
    if (rating.trim() !== '') {
      parsedRating = Number(rating);
      if (!Number.isFinite(parsedRating)) {
        setError('Rating must be a number.');
        return;
      }
      if (parsedRating < 0 || parsedRating > 5) {
        setError('Rating must be between 0 and 5.');
        return;
      }
    }

    setSubmitting(true);
    try {
      await onSubmit({
        name: trimmedName,
        cuisine: cuisine.trim() === '' ? null : cuisine.trim(),
        address: address.trim() === '' ? null : address.trim(),
        rating: parsedRating,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save restaurant');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block text-sm">
        <span className="font-medium text-stone-700">Name</span>
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="The Rusty Spoon"
          className="field"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-stone-700">Cuisine</span>
          <input
            type="text"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
            placeholder="American"
            className="field"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-stone-700">Rating</span>
          <input
            type="text"
            inputMode="decimal"
            value={rating}
            onChange={(e) => {
              const next = e.target.value;
              if (next === '' || /^-?\d*\.?\d{0,1}$/.test(next)) {
                setRating(next);
              }
            }}
            placeholder="0–5"
            className="field"
          />
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-medium text-stone-700">Address</span>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="12 Main St"
          className="field"
        />
      </label>
      {error ? <FormError message={error} /> : null}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-stone-50 disabled:opacity-50"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}
