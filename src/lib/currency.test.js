import { describe, expect, it } from 'vitest';
import { formatCurrency } from './currency';

describe('formatCurrency', () => {
  it('formats positive values with symbol', () => {
    expect(formatCurrency(1234.5, { symbol: '$' })).toBe('$1,234.50');
  });

  it('formats negative values with leading minus', () => {
    expect(formatCurrency(-99.9, { symbol: 'Rp' })).toBe('-Rp99.90');
  });

  it('returns privacy mask when privacy mode is on', () => {
    expect(formatCurrency(500, { symbol: '$', privacyMode: true })).toBe('••••');
  });
});
