export type ReportPeriod = 'today' | 'week' | 'month' | 'custom';

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** "week" is a rolling last-7-days window (today included), not a Mon–Sun calendar week —
 *  avoids showing empty future days. "month" is month-to-date (1st of this month through today). */
export function getPeriodRange(period: Exclude<ReportPeriod, 'custom'>): { dateFrom: string; dateTo: string } {
  const today = new Date();
  const dateTo = toDateString(today);

  if (period === 'today') {
    return { dateFrom: dateTo, dateTo };
  }
  if (period === 'week') {
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);
    return { dateFrom: toDateString(weekAgo), dateTo };
  }
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  return { dateFrom: toDateString(monthStart), dateTo };
}
