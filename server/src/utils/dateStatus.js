/**
 * Community Fridge Log - Shared Server Date Status Logic
 * Status computation:
 *  - expired: daysRemaining < 0
 *  - use_today: daysRemaining === 0
 *  - soon: daysRemaining === 1 || daysRemaining === 2
 *  - ok: daysRemaining > 2
 */

export const normalizeToCalendarMidnight = (input) => {
  if (!input) return null;

  if (typeof input === 'string') {
    const trimmed = input.trim();
    // If string begins with YYYY-MM-DD, extract the intended calendar date directly
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

export const getDaysRemaining = (dateInput, referenceDate = new Date()) => {
  if (!dateInput) return null;

  const targetMidnight = normalizeToCalendarMidnight(dateInput);
  const refMidnight = normalizeToCalendarMidnight(referenceDate);

  if (targetMidnight === null || refMidnight === null) return null;

  const diffMs = targetMidnight - refMidnight;
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
};

export const computeUseByStatus = (dateInput, referenceDate = new Date()) => {
  const days = getDaysRemaining(dateInput, referenceDate);
  if (days === null) return 'unknown';

  if (days < 0) return 'expired';
  if (days === 0) return 'use_today';
  if (days <= 2) return 'soon';
  return 'ok';
};
