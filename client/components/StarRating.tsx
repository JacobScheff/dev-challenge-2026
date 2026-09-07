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

export function StarRating({
  rating,
  size = 'sm',
}: {
  rating: number | null;
  size?: 'sm' | 'md';
}) {
  const sizeClass = size === 'md' ? 'h-5 w-5' : 'h-4 w-4';
  const value = rating == null ? 0 : Math.min(5, Math.max(0, rating));
  const label =
    rating == null ? 'Unrated' : `${value.toFixed(1).replace(/\.0$/, '')} out of 5 stars`;

  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={label} title={label}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star key={index} fill={value - index} sizeClass={sizeClass} />
      ))}
    </span>
  );
}
