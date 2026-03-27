/**
 * Format a Unix timestamp (in SECONDS, per spec §6.1) to a human-readable date/time string.
 */
export function formatTimestamp(seconds: number): string {
  const date = new Date(seconds * 1000);
  return date.toLocaleString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format a YYYY-MM-DD working-day string for display.
 */
export function formatWorkingDay(dateStr: string): string {
  // dateStr is already in YYYY-MM-DD; parse safely without timezone shift
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, (month ?? 1) - 1, day);
  return date.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Returns YYYY-MM-DD string for a given Date object (local time).
 */
export function toYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
