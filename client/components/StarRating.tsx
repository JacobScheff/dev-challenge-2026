'use client';

import { useState, type ChangeEvent, type FormEvent, type PointerEvent } from 'react';

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z';

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d={STAR_PATH} />
    </svg>
  );
}

function Star({ fill, sizeClass }: { fill: number; sizeClass: string }) {
  const clamped = Math.min(1, Math.max(0, fill));
  const unfilled = `${((1 - clamped) * 100).toFixed(2)}%`;

  return (
    <span className={`relative inline-block shrink-0 ${sizeClass}`}>
      <StarIcon className={`absolute inset-0 ${sizeClass} text-stone-300`} />
      {clamped > 0 ? (
        <span
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${unfilled} 0 0)` }}
        >
          <StarIcon className={`${sizeClass} text-amber-400`} />
        </span>
      ) : null}
    </span>
  );
}

function ratingFromPointer(event: PointerEvent<HTMLElement>): number {
  const rect = event.currentTarget.getBoundingClientRect();
  if (rect.width <= 0) return 0;
  const fraction = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
  return Math.round(fraction * 50) / 10;
}

function formatRatingLabel(rating: number | null): string {
  if (rating == null) return 'Unrated';
  const value = Math.min(5, Math.max(0, rating));
  return `${value.toFixed(1).replace(/\.0$/, '')} out of 5 stars`;
}

function formatRatingInput(rating: number | null): string {
  if (rating == null) return '';
  return rating.toFixed(1);
}

function parseRatingInput(raw: string): number | null {
  const trimmed = raw.trim();
  if (trimmed === '' || trimmed === '-' || trimmed === '.' || trimmed === '-.') return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed * 10) / 10;
}

function isAllowedRatingDraft(raw: string): boolean {
  return /^-?\d*\.?\d?$/.test(raw);
}

export function StarRating({
  rating,
  size = 'sm',
  onChange,
}: {
  rating: number | null;
  size?: 'sm' | 'md';
  onChange?: (rating: number) => void;
}) {
  const sizeClass = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  const value = rating == null ? 0 : Math.min(5, Math.max(0, rating));
  const [preview, setPreview] = useState<number | null>(null);
  const [draft, setDraft] = useState<string | null>(null);
  const display = preview ?? value;
  const label = formatRatingLabel(preview ?? rating);
  const interactive = onChange != null;

  function commitStars(event: PointerEvent<HTMLElement>) {
    setDraft(null);
    onChange?.(ratingFromPointer(event));
  }

  function onNumberBeforeInput(event: FormEvent<HTMLInputElement>) {
    const data = (event.nativeEvent as InputEvent).data;
    if (data == null) return;
    const input = event.currentTarget;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const next = input.value.slice(0, start) + data + input.value.slice(end);
    if (!isAllowedRatingDraft(next)) event.preventDefault();
  }

  function onNumberChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    if (!isAllowedRatingDraft(raw)) return;
    setDraft(raw);
    const parsed = parseRatingInput(raw);
    if (parsed != null) onChange?.(parsed);
  }

  function onNumberBlur() {
    setDraft(null);
  }

  const stars = (
    <span
      className={`inline-flex items-center gap-0.5${interactive ? ' cursor-pointer outline-none' : ''}`}
      role={interactive ? 'slider' : 'img'}
      aria-label={interactive ? 'Star rating' : label}
      aria-valuemin={interactive ? 0 : undefined}
      aria-valuemax={interactive ? 5 : undefined}
      aria-valuenow={interactive ? display : undefined}
      aria-valuetext={label}
      title={interactive ? 'Click to set rating' : label}
      tabIndex={interactive ? 0 : undefined}
      onPointerDown={
        interactive
          ? (event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              commitStars(event);
            }
          : undefined
      }
      onPointerMove={
        interactive
          ? (event) => {
              const next = ratingFromPointer(event);
              setPreview(next);
              if (event.buttons !== 0) {
                setDraft(null);
                onChange(next);
              }
            }
          : undefined
      }
      onPointerUp={interactive ? () => setPreview(null) : undefined}
      onPointerLeave={interactive ? () => setPreview(null) : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
                event.preventDefault();
                setDraft(null);
                onChange(Math.min(5, Math.round((value + 0.1) * 10) / 10));
              } else if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
                event.preventDefault();
                setDraft(null);
                onChange(Math.max(0, Math.round((value - 0.1) * 10) / 10));
              }
            }
          : undefined
      }
    >
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} fill={display - index} sizeClass={sizeClass} />
      ))}
    </span>
  );

  if (!interactive) return stars;

  return (
    <span className="inline-flex items-center gap-2">
      <span className="border-b border-stone-300 pb-0.5 focus-within:border-stone-800">
        {stars}
      </span>
      <input
        type="text"
        inputMode="decimal"
        aria-label="Rating"
        placeholder="—"
        value={draft ?? formatRatingInput(preview ?? rating)}
        onBeforeInput={onNumberBeforeInput}
        onChange={onNumberChange}
        onBlur={onNumberBlur}
        className="w-14 bg-transparent text-sm tabular-nums text-stone-500 outline-none border-b border-stone-300 focus:border-stone-800"
      />
    </span>
  );
}
