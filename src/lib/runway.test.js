import { describe, expect, it } from 'vitest';
import { getRunwayDays } from './runway';

describe('getRunwayDays', () => {
  it('returns null for no transactions', () => {
    expect(getRunwayDays([], 100)).toBeNull();
  });

  it('returns zero for non-positive remaining balance', () => {
    expect(getRunwayDays([
      { amount: 50, date: '2026-04-01' },
      { amount: 50, date: '2026-04-03' },
    ], 0)).toBe(0);
  });

  it('returns null when there is no spending in last 30 days', () => {
    expect(getRunwayDays([
      { amount: 20, date: '2025-01-01' },
      { amount: 30, date: '2025-01-03' },
    ], 80, new Date('2026-04-21'))).toBeNull();
  });

  it('uses last 30 days average daily spend', () => {
    expect(getRunwayDays([
      { amount: 30, date: '2026-04-20' },
      { amount: 90, date: '2026-04-15' },
      { amount: 200, date: '2026-02-01' },
    ], 150, new Date('2026-04-21'))).toBe(38);
  });
});
