'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormError } from '@/components/FormError';
import { ApiError, deleteVisit, updateVisit } from '@/lib/apiClient';
import { formatDate, money, todayYmd } from '@/lib/format';
import type { Visit } from '@/lib/types';

const inlineDate =
  'h-6 bg-transparent p-0 text-sm font-medium leading-6 text-stone-900 outline-none border-b border-stone-300 focus:border-stone-800 [color-scheme:light]';
const inlineNotes =
  'mt-0.5 max-h-40 w-full min-w-0 resize-none overflow-hidden bg-transparent p-0 text-sm leading-5 text-stone-500 outline-none border-b border-stone-300 focus:border-stone-800 placeholder:text-stone-400 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
const inlineAmount =
  'h-6 w-20 min-w-0 bg-transparent p-0 text-right text-sm font-medium leading-6 tabular-nums text-stone-900 outline-none border-b border-stone-300 focus:border-stone-800 placeholder:text-stone-400';

function amountField(value: number | null | undefined): string {
  return value == null ? '' : String(value);
}

export function VisitList({ visits }: { visits: Visit[] }) {
  return (
    <ul className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
      {visits.map((visit, index) => (
        <VisitRow key={visit.id} visit={visit} bordered={index > 0} />
      ))}
    </ul>
  );
}

function VisitRow({ visit, bordered }: { visit: Visit; bordered: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState(visit.date);
  const [amount, setAmount] = useState(amountField(visit.amountSpent));
  const [notes, setNotes] = useState(visit.notes ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (!editing) return;
    const el = notesRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [editing, notes]);

  function startEdit() {
    setDate(visit.date);
    setAmount(amountField(visit.amountSpent));
    setNotes(visit.notes ?? '');
    setError(null);
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setError(null);
  }

  async function save() {
    const amountSpent = Number(amount);
    if (date === '') {
      setError('Date is required.');
      return;
    }
    if (amount.trim() === '' || !Number.isFinite(amountSpent)) {
      setError('Enter how much was spent.');
      return;
    }

    setError(null);
    setSaving(true);
    try {
      await updateVisit(visit.id, {
        date,
        amountSpent,
        notes: notes.trim() === '' ? null : notes.trim(),
      });
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not save visit');
    } finally {
      setSaving(false);
    }
  }

  async function onConfirmDelete() {
    setDeleteError(null);
    setDeleting(true);
    try {
      await deleteVisit(visit.id);
      router.refresh();
    } catch (err) {
      setDeleteError(err instanceof ApiError ? err.message : 'Could not delete visit');
      setDeleting(false);
    }
  }

  const rowBorder = bordered ? 'border-t border-stone-100' : '';

  return (
    <li
      className={`group transition ${rowBorder} ${
        confirmingDelete || editing ? '' : 'hover:bg-stone-50'
      }`}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (editing) void save();
        }}
      >
        <div className="flex items-start">
          <div className="min-w-0 flex-1 px-4 py-3">
            {editing ? (
              <input
                type="date"
                required
                max={todayYmd()}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                aria-label="Date"
                className={inlineDate}
              />
            ) : (
              <p className="text-sm font-medium">{formatDate(visit.date)}</p>
            )}
            {editing ? (
              <textarea
                ref={notesRef}
                rows={1}
                maxLength={2000}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                aria-label="Notes"
                placeholder="Notes"
                className={inlineNotes}
              />
            ) : visit.notes ? (
              <p className="mt-0.5 text-sm text-stone-500">{visit.notes}</p>
            ) : null}
          </div>
          {editing ? (
            <div className="flex shrink-0 items-baseline gap-0.5 py-3">
              <span aria-hidden="true" className="text-sm text-stone-500">
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                required
                placeholder="0.00"
                value={amount}
                onChange={(event) => {
                  const next = event.target.value;
                  if (next === '' || /^\d*\.?\d{0,2}$/.test(next)) {
                    setAmount(next);
                  }
                }}
                aria-label="Amount spent"
                className={inlineAmount}
              />
            </div>
          ) : (
            <p className="shrink-0 py-3 text-sm font-medium tabular-nums">
              {visit.amountSpent == null ? '—' : money(visit.amountSpent)}
            </p>
          )}
          {confirmingDelete ? (
            <div className="w-4 shrink-0" />
          ) : editing ? (
            <div className="flex shrink-0 gap-1.5 py-3 pl-2 pr-4">
              <button
                type="button"
                disabled={saving}
                onClick={cancelEdit}
                className="rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-800 shadow-sm transition hover:bg-stone-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-stone-900 px-2.5 py-1 text-xs font-medium text-white transition hover:bg-stone-800 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          ) : (
            <>
              <div className="flex w-max max-w-0 justify-end overflow-hidden transition-[max-width] duration-500 ease-in-out group-hover:max-w-[12rem] group-focus-within:max-w-[12rem] [@media(hover:none)]:max-w-[12rem]">
                <div className="flex gap-1.5 py-3 pl-2">
                  <button
                    type="button"
                    onClick={startEdit}
                    className="rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-800 shadow-sm transition hover:bg-stone-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingDelete(true)}
                    className="rounded-lg border border-red-200 bg-white px-2.5 py-1 text-xs font-medium text-red-700 shadow-sm transition hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="w-4 shrink-0" />
            </>
          )}
        </div>

        {error ? (
          <div className="px-4 pb-3">
            <FormError message={error} />
          </div>
        ) : null}
      </form>

      {confirmingDelete ? (
        <div className="mx-4 mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-900">
            {`Delete the visit on ${formatDate(visit.date)}${
              visit.amountSpent == null ? '' : ` for ${money(visit.amountSpent)}`
            }? This cannot be undone.`}
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
              {deleting ? 'Deleting...' : 'Delete visit'}
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
    </li>
  );
}
