/* TransactionList v3 - With i18n, privacy blur, search, skeleton
 * Purpose: Display transactions with search, Framer Motion, privacy mode
 * Callers: App.jsx
 * Deps: framer-motion, store, i18next
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { SkeletonTransaction } from './Skeleton';

export default function TransactionList({ searchActive }) {
  const { t } = useTranslation();
  const { transactions, loading, deleteTransaction, getCategoryColor, getCurrencySymbol, privacyMode } = useStore();
  const symbol = getCurrencySymbol();
  const [search, setSearch] = useState('');

  const fmt = (n) => privacyMode
    ? '••••'
    : `${symbol}${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(n)}`;
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const filtered = search
    ? transactions.filter((t) =>
        t.item_name.toLowerCase().includes(search.toLowerCase()) ||
        t.category_name.toLowerCase().includes(search.toLowerCase())
      )
    : transactions;

  if (loading) {
    return (
      <div className="card">
        <h2 className="section-title mb-4">{t('transactions')}</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <SkeletonTransaction key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">{t('transactions')}</h2>
        <span className="text-xs text-text-tertiary dark:text-dark-text-secondary">
          {filtered.length} {filtered.length !== transactions.length ? `/ ${transactions.length}` : ''}
        </span>
      </div>

      {/* Search bar */}
      {(searchActive || search) && (
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field text-sm mb-3"
          placeholder="Search transactions..."
          autoFocus={searchActive}
        />
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-text-tertiary dark:text-dark-text-secondary">
          <svg className="w-12 h-12 mb-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <p className="font-medium text-text-secondary dark:text-dark-text-secondary">{t('noTransactions')}</p>
          <span className="text-sm">{t('addFirst')}</span>
        </div>
      ) : (
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-3">
          <AnimatePresence initial={false}>
            {filtered.map((txn) => (
              <motion.div
                key={txn.id} layout
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0 }} transition={{ duration: 0.2 }}
                className="flex items-center justify-between p-3 bg-surface dark:bg-dark-surface rounded-lg
                           border border-card-border dark:border-dark-border
                           hover:-translate-y-px hover:shadow-whisper dark:hover:shadow-dark-whisper transition-all"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-medium text-[0.9375rem] text-text-primary dark:text-dark-text truncate">
                    {txn.item_name}
                    {txn.is_recurring && <span className="ml-1.5 text-xs text-primary">↻</span>}
                  </span>
                  <div className="flex items-center gap-2 text-[0.8125rem] text-text-secondary dark:text-dark-text-secondary">
                    <span className="inline-flex px-2 py-0.5 rounded-pill text-xs font-medium text-white"
                      style={{ backgroundColor: getCategoryColor(txn.category_name) }}>
                      {txn.category_name}
                    </span>
                    {txn.quantity > 1 && (
                      <span className="text-text-tertiary">{txn.quantity} × {fmt(txn.unit_price)}</span>
                    )}
                    <span>{fmtDate(txn.date)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`font-semibold ${privacyMode ? 'blur-sm' : ''} text-text-primary dark:text-dark-text`}>
                    {fmt(txn.amount)}
                  </span>
                  <button onClick={() => deleteTransaction(txn.id)}
                    className="text-text-tertiary hover:text-danger p-1 rounded transition-colors" aria-label="Delete">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
