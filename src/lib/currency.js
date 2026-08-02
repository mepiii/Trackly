/* currency - Shared money formatting helpers
 * Purpose: Format currency consistently across UI and tests
 * Callers: BalanceHeader.jsx, tests
 * Deps: Intl
 * API: formatCurrency(amount, options)
 */

export function formatCurrency(amount, { symbol = '$', privacyMode = false, locale = 'en-US' } = {}) {
  if (privacyMode) return '••••';
  const value = Number(amount || 0);
  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  return `${value < 0 ? '-' : ''}${symbol}${formatted}`;
}
