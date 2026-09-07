'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormError } from '@/components/FormError';
import { VisitForm } from '@/components/VisitForm';
import { ApiError, deleteVisit, updateVisit } from '@/lib/apiClient';
import { formatDate, money } from '@/lib/format';
import type { Visit } from '@/lib/types';

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
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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

  if (editing) {
    return (
      <li className={`px-4 py-3 ${rowBorder}`}>
        <VisitForm
          initial={visit}
          submitLabel="Save changes"
          onCancel={() => setEditing(false)}
          onSubmit={async (values) => {
            await updateVisit(visit.id, values);
            setEditing(false);
            router.refresh();
          }}
        />
      </li>
    );
  }

  return (
    <li
      className={`group transition ${rowBorder} ${
        confirmingDelete ? '' : 'hover:bg-stone-50'
      }`}
    >
      <div className="flex items-start">
        <div className="min-w-0 flex-1 px-4 py-3">
          <p className="text-sm font-medium">{formatDate(visit.date)}</p>
          {visit.notes ? (
            <p className="mt-0.5 text-sm text-stone-500">{visit.notes}</p>
          ) : null}
        </div>
        <p className="shrink-0 py-3 text-sm font-medium tabular-nums">
          {visit.amountSpent == null ? '—' : money(visit.amountSpent)}
        </p>
        {confirmingDelete ? (
          <div className="w-4 shrink-0" />
        ) : (
          <>
            <div className="flex w-max max-w-0 justify-end overflow-hidden transition-[max-width] duration-500 ease-in-out group-hover:max-w-[12rem] group-focus-within:max-w-[12rem] [@media(hover:none)]:max-w-[12rem]">
              <div className="flex gap-1.5 py-3 pl-2">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
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
