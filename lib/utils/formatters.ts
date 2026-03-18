import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—';
  return dayjs(date).format('DD MMM YYYY');
}

export function formatDateTime(date: string | null | undefined): string {
  if (!date) return '—';
  return dayjs(date).format('DD MMM YYYY, HH:mm');
}

export function formatRelativeTime(date: string | null | undefined): string {
  if (!date) return '—';
  return dayjs(date).fromNow();
}

export function formatMoney(amount: string | null | undefined, currency = 'NGN'): string {
  if (!amount) return '—';
  const num = parseFloat(amount);
  if (isNaN(num)) return '—';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(num);
}

export function formatWeight(kg: string | null | undefined): string {
  if (!kg) return '—';
  const num = parseFloat(kg);
  if (isNaN(num)) return '—';
  return `${num.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kg`;
}

export function formatPercentage(pct: string | number | null | undefined): string {
  if (pct === null || pct === undefined) return '—';
  const num = typeof pct === 'string' ? parseFloat(pct) : pct;
  if (isNaN(num)) return '—';
  return `${num.toFixed(2)}%`;
}

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString('en');
}

export function formatBags(count: number | null | undefined): string {
  if (count === null || count === undefined) return '—';
  return `${count.toLocaleString('en')} bag${count !== 1 ? 's' : ''}`;
}
