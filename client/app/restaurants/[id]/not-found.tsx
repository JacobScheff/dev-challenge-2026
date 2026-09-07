import Link from 'next/link';

export default function RestaurantNotFound() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-5 py-10 text-center shadow-sm">
      <h2 className="text-lg font-semibold tracking-tight">Restaurant not found</h2>
      <p className="mt-2 text-sm text-stone-500">
        That id does not match a restaurant.
      </p>
      <p className="mt-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-800 shadow-sm transition hover:bg-stone-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M12.79 5.23a.75.75 0 01-.02 1.06L8.83 10l3.94 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
              clipRule="evenodd"
            />
          </svg>
          Back
        </Link>
      </p>
    </div>
  );
}
