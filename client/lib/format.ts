export function todayYmd(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export function money(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/** Chart-axis currency: drop `.00` on whole dollars. */
export function axisMoney(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

/** Format an API calendar month (`YYYY-MM`) without timezone shift. */
export function formatMonth(yyyyMm: string): string {
  const [year, month] = yyyyMm.split('-').map(Number);
  if (!year || !month) return yyyyMm;
  return new Date(year, month - 1, 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

/** Format an API calendar date (`YYYY-MM-DD`) without timezone shift. */
export function formatDate(ymd: string): string {
  const [year, month, day] = ymd.split('-').map(Number);
  if (!year || !month || !day) return ymd;
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function visitLabel(count: number): string {
  return count === 1 ? '1 visit' : `${count} visits`;
}

export function restaurantDetails(
  cuisine: string | null,
  address: string | null
): string {
  return [cuisine, address].filter(Boolean).join(' · ') || 'No details yet';
}

/** Make API/field errors readable in the UI (sentence case, trailing period). */
export function formatUiError(message: string): string {
  const trimmed = message.trim();
  if (trimmed === '') return 'Something went wrong.';
  const capitalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  return /[.!?]$/.test(capitalized) ? capitalized : `${capitalized}.`;
}
