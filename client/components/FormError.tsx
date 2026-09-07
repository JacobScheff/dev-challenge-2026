import { formatUiError } from '@/lib/format';

export function FormError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
    >
      {formatUiError(message)}
    </p>
  );
}
