/* Export - CSV and XLSX generation
 * Purpose: Export transaction data to downloadable files
 * Callers: App.jsx (export buttons)
 * Deps: xlsx
 */

import * as XLSX from 'xlsx';

/**
 * Export transactions to CSV and trigger download.
 */
export function exportCSV(transactions, trackerName, currencySymbol) {
  const headers = ['Date', 'Item', 'Category', 'Qty', 'Unit Price', 'Amount', 'Recurring'];
  const rows = transactions.map((t) => [
    new Date(t.date).toLocaleDateString(),
    t.item_name,
    t.category_name,
    t.quantity,
    `${currencySymbol}${Number(t.unit_price).toFixed(2)}`,
    `${currencySymbol}${Number(t.amount).toFixed(2)}`,
    t.is_recurring ? 'Yes' : 'No',
  ]);

  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${trackerName}-transactions.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export transactions to XLSX and trigger download.
 * Filename: Report_[TrackerName]_[Date].xlsx
 * Includes total summary row at bottom.
 */
export function exportXLSX(transactions, trackerName, currencySymbol) {
  const rows = transactions.map((t) => ({
    Date: new Date(t.date).toLocaleDateString(),
    Item: t.item_name,
    Category: t.category_name,
    Qty: Number(t.quantity),
    Price: Number(t.unit_price),
    Total: Number(t.amount),
  }));
  const total = transactions.reduce((s, t) => s + Number(t.amount), 0);
  rows.push({ Date: '', Item: '', Category: '', Qty: '', Price: 'Total', Total: total });
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Report');
  XLSX.writeFile(wb, `Report_${trackerName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
