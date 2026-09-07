'use client';

import { useRouter } from 'next/navigation';
import { RestaurantForm } from '@/components/RestaurantForm';
import { createRestaurant } from '@/lib/apiClient';

export function NewRestaurantForm() {
  const router = useRouter();

  return (
    <RestaurantForm
      submitLabel="Add restaurant"
      onSubmit={async (values) => {
        const created = await createRestaurant(values);
        router.push(`/restaurants/${created.id}`);
        router.refresh();
      }}
    />
  );
}
