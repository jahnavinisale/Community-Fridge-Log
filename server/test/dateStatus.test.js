import { describe, it, expect } from 'vitest';
import { computeUseByStatus, getDaysRemaining } from '../src/utils/dateStatus.js';

describe('Phase 3 Date Status Unit Tests with Comprehensive Edge Cases', () => {
  const reference = new Date(2026, 10, 17, 12, 0, 0); // 17 Nov 2026

  describe('1. Today Edge Cases (use_today)', () => {
    it('returns use_today for start of today (00:00:00)', () => {
      const todayStart = new Date(2026, 10, 17, 0, 0, 0);
      expect(computeUseByStatus(todayStart, reference)).toBe('use_today');
      expect(getDaysRemaining(todayStart, reference)).toBe(0);
    });

    it('returns use_today for end of today (23:59:59)', () => {
      const todayEnd = new Date(2026, 10, 17, 23, 59, 59);
      expect(computeUseByStatus(todayEnd, reference)).toBe('use_today');
      expect(getDaysRemaining(todayEnd, reference)).toBe(0);
    });

    it('returns use_today for plain date string YYYY-MM-DD', () => {
      expect(computeUseByStatus('2026-11-17', '2026-11-17')).toBe('use_today');
      expect(getDaysRemaining('2026-11-17', '2026-11-17')).toBe(0);
    });
  });

  describe('2. Tomorrow Edge Cases (soon: 1 day)', () => {
    it('returns soon for tomorrow start (00:00:01)', () => {
      const tomorrowStart = new Date(2026, 10, 18, 0, 0, 1);
      expect(computeUseByStatus(tomorrowStart, reference)).toBe('soon');
      expect(getDaysRemaining(tomorrowStart, reference)).toBe(1);
    });

    it('returns soon for tomorrow evening (23:59:59)', () => {
      const tomorrowEnd = new Date(2026, 10, 18, 23, 59, 59);
      expect(computeUseByStatus(tomorrowEnd, reference)).toBe('soon');
      expect(getDaysRemaining(tomorrowEnd, reference)).toBe(1);
    });

    it('returns soon for 2 days remaining', () => {
      const inTwoDays = new Date(2026, 10, 19, 14, 0, 0);
      expect(computeUseByStatus(inTwoDays, reference)).toBe('soon');
      expect(getDaysRemaining(inTwoDays, reference)).toBe(2);
    });
  });

  describe('3. Yesterday Edge Cases (expired: -1 day)', () => {
    it('returns expired for yesterday end of day (23:59:59)', () => {
      const yesterdayEnd = new Date(2026, 10, 16, 23, 59, 59);
      expect(computeUseByStatus(yesterdayEnd, reference)).toBe('expired');
      expect(getDaysRemaining(yesterdayEnd, reference)).toBe(-1);
    });

    it('returns expired for yesterday start of day (00:00:00)', () => {
      const yesterdayStart = new Date(2026, 10, 16, 0, 0, 0);
      expect(computeUseByStatus(yesterdayStart, reference)).toBe('expired');
      expect(getDaysRemaining(yesterdayStart, reference)).toBe(-1);
    });

    it('returns expired for multiple days in the past', () => {
      const tenDaysAgo = new Date(2026, 10, 7, 12, 0, 0);
      expect(computeUseByStatus(tenDaysAgo, reference)).toBe('expired');
      expect(getDaysRemaining(tenDaysAgo, reference)).toBe(-10);
    });
  });

  describe('4. Timezone & Boundary Transitions', () => {
    it('handles month boundaries correctly (e.g. 31 Oct to 1 Nov)', () => {
      const oct31 = new Date(2026, 9, 31, 12, 0, 0);
      const nov01 = new Date(2026, 10, 1, 10, 0, 0);
      const nov02 = new Date(2026, 10, 2, 10, 0, 0);
      const nov03 = new Date(2026, 10, 3, 10, 0, 0);

      expect(getDaysRemaining(nov01, oct31)).toBe(1);
      expect(computeUseByStatus(nov01, oct31)).toBe('soon');

      expect(getDaysRemaining(nov02, oct31)).toBe(2);
      expect(computeUseByStatus(nov02, oct31)).toBe('soon');

      expect(getDaysRemaining(nov03, oct31)).toBe(3);
      expect(computeUseByStatus(nov03, oct31)).toBe('ok');
    });

    it('handles year transitions correctly (e.g. 31 Dec to 1 Jan)', () => {
      const dec31 = new Date(2026, 11, 31, 14, 0, 0);
      const jan01 = new Date(2027, 0, 1, 9, 0, 0);

      expect(getDaysRemaining(jan01, dec31)).toBe(1);
      expect(computeUseByStatus(jan01, dec31)).toBe('soon');
    });

    it('handles leap year boundaries correctly (2028 is leap year)', () => {
      const feb28 = new Date(2028, 1, 28, 12, 0, 0);
      const feb29 = new Date(2028, 1, 29, 12, 0, 0);
      const mar01 = new Date(2028, 2, 1, 12, 0, 0);

      expect(getDaysRemaining(feb29, feb28)).toBe(1);
      expect(computeUseByStatus(feb29, feb28)).toBe('soon');

      expect(getDaysRemaining(mar01, feb28)).toBe(2);
      expect(computeUseByStatus(mar01, feb28)).toBe('soon');
    });

    it('handles ISO strings with timezone offsets', () => {
      expect(computeUseByStatus('2026-11-18T10:00:00+05:30', '2026-11-17T12:00:00+05:30')).toBe('soon');
      expect(computeUseByStatus('2026-11-16T18:00:00-05:00', '2026-11-17T12:00:00-05:00')).toBe('expired');
    });
  });

  describe('5. Invalid and Null Inputs', () => {
    it('returns unknown and null for null, undefined, and non-date strings', () => {
      expect(computeUseByStatus(null, reference)).toBe('unknown');
      expect(computeUseByStatus(undefined, reference)).toBe('unknown');
      expect(computeUseByStatus('not-a-valid-date', reference)).toBe('unknown');
      expect(getDaysRemaining(null, reference)).toBeNull();
      expect(getDaysRemaining(undefined, reference)).toBeNull();
      expect(getDaysRemaining('invalid', reference)).toBeNull();
    });
  });
});
