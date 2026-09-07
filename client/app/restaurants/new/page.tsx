import { BackLink } from '@/components/BackLink';
import { NewRestaurantForm } from './NewRestaurantForm';

export default function NewRestaurantPage() {
  return (
    <div className="space-y-8">
      <div>
        <BackLink />
        <header className="mt-4">
          <h2 className="text-2xl font-semibold tracking-tight">Add a restaurant</h2>
          <p className="mt-1 text-sm text-stone-500">
            Name is required. Cuisine, address, and rating can wait.
          </p>
        </header>
      </div>

      <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
        <NewRestaurantForm />
      </section>
    </div>
  );
}
