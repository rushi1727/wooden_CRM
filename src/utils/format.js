import { CURRENCY, STATUS_TONES } from '../data/masterData';

export const inr = (value, opts = {}) => {
  const n = Number(value || 0);
  if (opts.compact) {
    if (Math.abs(n) >= 10000000) return `${CURRENCY}${(n / 10000000).toFixed(2)} Cr`;
    if (Math.abs(n) >= 100000) return `${CURRENCY}${(n / 100000).toFixed(2)} L`;
    if (Math.abs(n) >= 1000) return `${CURRENCY}${(n / 1000).toFixed(1)}k`;
  }
  return `${CURRENCY}${n.toLocaleString('en-IN', { maximumFractionDigits: opts.decimals ?? 0 })}`;
};

export const num = (value) => Number(value || 0).toLocaleString('en-IN');

export const pct = (value, decimals = 0) => `${Number(value || 0).toFixed(decimals)}%`;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const formatDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(`${iso}`.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export const formatDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return formatDate(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const suffix = h >= 12 ? 'PM' : 'AM';
  return `${formatDate(iso)}, ${((h + 11) % 12) + 1}:${m} ${suffix}`;
};

export const formatShortDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(`${iso}`.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]}`;
};

export const monthLabel = (monthIndex) => MONTHS[monthIndex] || '';

export const todayISO = () => new Date().toISOString().slice(0, 10);

export const daysBetween = (a, b) => {
  const d1 = new Date(`${a}T00:00:00`);
  const d2 = new Date(`${b}T00:00:00`);
  return Math.round((d2 - d1) / 86400000);
};

export const daysUntil = (iso) => daysBetween(todayISO(), iso);

export const isOverdue = (iso) => !!iso && daysUntil(iso) < 0;

export const relativeTime = (iso) => {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return 'Just now';
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(iso);
};

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

export const statusTone = (status) => STATUS_TONES[status] || 'gray';

export const titleCase = (s = '') => s.replace(/(^|\s)\S/g, (t) => t.toUpperCase());

export const plural = (count, singular, pluralForm) => `${count} ${count === 1 ? singular : pluralForm || `${singular}s`}`;

export const truncate = (str = '', len = 40) => (str.length > len ? `${str.slice(0, len)}…` : str);

export const exportedSlug = (s = '') => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');

export const nextId = (prefix, items = [], start = 1) => {
  const max = items.reduce((acc, item) => {
    const m = String(item.id || '').match(/(\d+)$/);
    return m ? Math.max(acc, Number(m[1])) : acc;
  }, start - 1);
  return `${prefix}${max + 1}`;
};

export const downloadCSV = (filename, rows, columns) => {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const header = columns.map((c) => esc(c.label)).join(',');
  const body = rows.map((row) => columns.map((c) => {
    const value = typeof c.value === 'function' ? c.value(row) : row[c.key];
    return esc(value);
  }).join(',')).join('\n');
  const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${todayISO()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const sumBy = (items, fn) => items.reduce((acc, item) => acc + (Number(fn(item)) || 0), 0);

export const average = (items, fn) => (items.length ? sumBy(items, fn) / items.length : 0);
