/**
 * Community Fridge Log - Shared Client Date Status Logic
 * Status is computed from useByDate:
 *  - expired (past)
 *  - use_today
 *  - soon (1 to 2 days)
 *  - ok (3+ days)
 */

export const normalizeToCalendarMidnight = (input) => {
  if (!input) return null;

  if (typeof input === 'string') {
    const trimmed = input.trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
    if (match) {
      const year = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const day = parseInt(match[3], 10);
      return Date.UTC(year, month, day);
    }
  }

  const d = new Date(input);
  if (isNaN(d.getTime())) return null;

  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
};

export const getDaysRemaining = (dateString, referenceDate = new Date()) => {
  if (!dateString) return null;

  const targetMidnight = normalizeToCalendarMidnight(dateString);
  const refMidnight = normalizeToCalendarMidnight(referenceDate);

  if (targetMidnight === null || refMidnight === null) return null;

  const diffMs = targetMidnight - refMidnight;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export const getUseByStatus = (dateString, referenceDate = new Date()) => {
  const days = getDaysRemaining(dateString, referenceDate);
  if (days === null) return 'unknown';

  if (days < 0) return 'expired';
  if (days === 0) return 'use_today';
  if (days <= 2) return 'soon';
  return 'ok';
};

export const STATUS_CONFIG = {
  expired: {
    label: 'Expired',
    shortLabel: 'Expired',
    tagline: 'Do not distribute without safety check; discard if spoiled or past date',
    bg: 'bg-red-50',
    text: 'text-red-900',
    border: 'border-red-300',
    accentBorder: 'border-l-4 border-l-red-700',
    badgeClass: 'bg-red-50 text-red-900 border-red-300 font-semibold',
    icon: 'AlertOctagon',
  },
  use_today: {
    label: 'Use Today',
    shortLabel: 'Use Today',
    tagline: 'High priority: must be distributed or used today',
    bg: 'bg-amber-50',
    text: 'text-amber-950',
    border: 'border-amber-300',
    accentBorder: 'border-l-4 border-l-amber-600',
    badgeClass: 'bg-amber-50 text-amber-950 border-amber-300 font-semibold',
    icon: 'AlertTriangle',
  },
  soon: {
    label: 'Soon (1-2 days)',
    shortLabel: '1-2 Days',
    tagline: 'Moderate priority: use or distribute within 2 days',
    bg: 'bg-amber-50/70',
    text: 'text-amber-900',
    border: 'border-amber-200',
    accentBorder: 'border-l-4 border-l-amber-500',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200 font-semibold',
    icon: 'Clock',
  },
  use_within_2_days: {
    label: 'Soon (1-2 days)',
    shortLabel: '1-2 Days',
    tagline: 'Moderate priority: use or distribute within 2 days',
    bg: 'bg-amber-50/70',
    text: 'text-amber-900',
    border: 'border-amber-200',
    accentBorder: 'border-l-4 border-l-amber-500',
    badgeClass: 'bg-amber-50 text-amber-900 border-amber-200 font-semibold',
    icon: 'Clock',
  },
  ok: {
    label: 'Adequate Shelf Life',
    shortLabel: 'Safe (3+ days)',
    tagline: 'Stock has plenty of shelf life remaining',
    bg: 'bg-emerald-50',
    text: 'text-emerald-950',
    border: 'border-emerald-200',
    accentBorder: 'border-l-4 border-l-[#1F5E43]',
    badgeClass: 'bg-emerald-50 text-emerald-950 border-emerald-200 font-medium',
    icon: 'CheckCircle2',
  },
  unknown: {
    label: 'Unknown Date',
    shortLabel: 'Unknown',
    tagline: 'No use-by date specified',
    bg: 'bg-stone-100',
    text: 'text-stone-800',
    border: 'border-stone-300',
    accentBorder: 'border-l-4 border-l-stone-400',
    badgeClass: 'bg-stone-100 text-stone-800 border-stone-300',
    icon: 'HelpCircle',
  },
};
