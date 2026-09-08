import { BackLink } from '@/components/BackLink';

export default function RestaurantNotFound() {
  return (
    <div className="rounded-xl border border-stone-200 bg-white px-5 py-10 text-center shadow-sm">
      <h2 className="text-lg font-semibold tracking-tight">Restaurant not found</h2>
      <p className="mt-2 text-sm text-stone-500">
        That id does not match a restaurant.
      </p>
      <p className="mt-5">
        <BackLink />
      </p>
    </div>
  );
}
