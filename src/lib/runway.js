/* runway - Balance runway calculation helper
 * Purpose: Compute projected runway days from transaction history and balance
 * Callers: tests, AIInsights-compatible logic
 * Deps: Date, Math
 * API: getRunwayDays(transactions, balance)
 */

export function getRunwayDays(transactions, balance, now = new Date()) {
  if (!transactions?.length) return null;
  const currentBalance = Number(balance);
  if (currentBalance <= 0) return 0;

  // Filter transaksi 30 hari terakhir
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - 30);
  const recent = transactions.filter((t) => new Date(t.date) >= cutoff);

  if (!recent.length) return null;

  // Hitung total pengeluaran murni
  const totalRecentSpend = recent.reduce((sum, txn) => sum + Number(txn.amount), 0);

  const avgDailySpend = totalRecentSpend / 30;

  // Kalkulasi akhir: Saldo dibagi rata-rata murni
  return avgDailySpend > 0 ? Math.ceil(currentBalance / avgDailySpend) : null;
}