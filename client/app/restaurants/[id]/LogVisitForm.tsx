'use client';

import { useRouter } from 'next/navigation';
import { VisitForm } from '@/components/VisitForm';
import { createVisit } from '@/lib/apiClient';

export function LogVisitForm({ restaurantId }: { restaurantId: number }) {
  const router = useRouter();

  return (
    <VisitForm
      submitLabel="Log visit"
      onSubmit={async (values) => {
        await createVisit({ restaurantId, ...values });
        router.refresh();
      }}
    />
  );
}
