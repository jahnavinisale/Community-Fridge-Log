import { describe, it, expect } from 'vitest';
import { getUseByStatus, getDaysRemaining } from './dateStatus.js';

describe('Client Date Status Unit Tests with Edge Cases', () => {
  const reference = new Date(2026, 10, 17, 12, 0, 0); // 17 Nov 2026

  it('identifies today start and end of day as use_today', () => {
    const todayMorning = new Date(2026, 10, 17, 0, 0, 0);
    const todayEvening = new Date(2026, 10, 17, 23, 59, 59);

    expect(getUseByStatus(todayMorning, reference)).toBe('use_today');
    expect(getUseByStatus(todayEvening, reference)).toBe('use_today');
    expect(getDaysRemaining(todayMorning, reference)).toBe(0);
    expect(getDaysRemaining(todayEvening, reference)).toBe(0);
  });

  it('identifies tomorrow start and end as soon (1 day)', () => {
    const tomorrowStart = new Date(2026, 10, 18, 0, 0, 1);
    const tomorrowEnd = new Date(2026, 10, 18, 23, 59, 59);

    expect(getUseByStatus(tomorrowStart, reference)).toBe('soon');
    expect(getUseByStatus(tomorrowEnd, reference)).toBe('soon');
    expect(getDaysRemaining(tomorrowStart, reference)).toBe(1);
    expect(getDaysRemaining(tomorrowEnd, reference)).toBe(1);
  });

  it('identifies yesterday as expired (-1 day)', () => {
    const yesterday = new Date(2026, 10, 16, 23, 59, 59);
    expect(getUseByStatus(yesterday, reference)).toBe('expired');
    expect(getDaysRemaining(yesterday, reference)).toBe(-1);
  });

  it('handles month boundaries (31 Oct to 1 Nov)', () => {
    const oct31 = new Date(2026, 9, 31, 12, 0, 0);
    const nov01 = new Date(2026, 10, 1, 10, 0, 0);

    expect(getDaysRemaining(nov01, oct31)).toBe(1);
    expect(getUseByStatus(nov01, oct31)).toBe('soon');
  });

  it('handles year boundaries (31 Dec to 1 Jan)', () => {
    const dec31 = new Date(2026, 11, 31, 14, 0, 0);
    const jan01 = new Date(2027, 0, 1, 9, 0, 0);

    expect(getDaysRemaining(jan01, dec31)).toBe(1);
    expect(getUseByStatus(jan01, dec31)).toBe('soon');
  });

  it('handles leap year boundaries (28 Feb to 29 Feb in 2028)', () => {
    const feb28 = new Date(2028, 1, 28, 12, 0, 0);
    const feb29 = new Date(2028, 1, 29, 12, 0, 0);

    expect(getDaysRemaining(feb29, feb28)).toBe(1);
    expect(getUseByStatus(feb29, feb28)).toBe('soon');
  });

  it('handles null, undefined and invalid date inputs', () => {
    expect(getUseByStatus(null, reference)).toBe('unknown');
    expect(getUseByStatus(undefined, reference)).toBe('unknown');
    expect(getUseByStatus('invalid-date', reference)).toBe('unknown');
    expect(getDaysRemaining(null, reference)).toBeNull();
  });
});
