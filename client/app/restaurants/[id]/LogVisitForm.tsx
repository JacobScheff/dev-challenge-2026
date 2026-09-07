'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, createVisit } from '@/lib/apiClient';

function todayYmd(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function LogVisitForm({ restaurantId }: { restaurantId: number }) {
  const router = useRouter();
  const [date, setDate] = useState(todayYmd);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = notesRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [notes]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const amountSpent = Number(amount);
    if (amount.trim() === '' || !Number.isFinite(amountSpent)) {
      setError('Enter how much was spent');
      return;
    }

    setSubmitting(true);
    try {
      await createVisit({
        restaurantId,
        date,
        amountSpent,
        notes: notes.trim() === '' ? null : notes,
      });
      setAmount('');
      setNotes('');
      setDate(todayYmd());
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not log visit');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-stone-700">Date</span>
          <input
            type="date"
            required
            max={todayYmd()}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="field"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-stone-700">Amount spent</span>
          <span className="field flex items-center gap-1.5 py-0 pl-3 focus-within:border-stone-800 focus-within:ring-1 focus-within:ring-stone-800">
            <span aria-hidden="true" className="text-stone-500">
              $
            </span>
            <input
              type="text"
              inputMode="decimal"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => {
                const next = e.target.value;
                if (next === '' || /^\d*\.?\d{0,2}$/.test(next)) {
                  setAmount(next);
                }
              }}
              className="w-full border-0 bg-transparent py-2 pr-3 outline-none placeholder:text-stone-400"
            />
          </span>
        </label>
      </div>
      <label className="block text-sm">
        <span className="font-medium text-stone-700">Notes</span>
        <textarea
          ref={notesRef}
          rows={2}
          maxLength={2000}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you get?"
          className="field max-h-80 min-h-[3.75rem] resize-none overflow-y-auto"
        />
      </label>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
      >
        {submitting ? 'Saving...' : 'Log visit'}
      </button>
    </form>
  );
}
