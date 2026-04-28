/* MonthlySummary v3 - Monthly stats with i18n + privacy
 * Purpose: Month nav + stats grid
 * Callers: App.jsx
 * Deps: store, framer-motion, i18next
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';

export default function MonthlySummary() {
  const { t } = useTranslation();
  const { currentMonth, navigateMonth, getMonthlyTransactions, getCurrencySymbol, privacyMode } = useStore();
  const monthly = getMonthlyTransactions();
  const symbol = getCurrencySymbol();
  const total = monthly.reduce((s, txn) => s + Number(txn.amount), 0);
  const count = monthly.length;

  const fmt = (n) => privacyMode
    ? '••••'
    : `${symbol}${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(n)}`;
  const fmtMonth = (d) => d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="card">
      <h2 className="section-title mb-4">{t('monthlySummary')}</h2>
      <div className="flex items-center justify-center gap-4 mb-6">
        <button onClick={() => navigateMonth(-1)}
          className="p-2 rounded-lg bg-surface dark:bg-dark-surface border border-card-border dark:border-dark-border
                     hover:bg-card-border dark:hover:bg-dark-border transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <AnimatePresence mode="wait">
          <motion.span key={currentMonth.toISOString()}
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
            className="text-base font-semibold min-w-[140px] text-center dark:text-dark-text">
            {fmtMonth(currentMonth)}
          </motion.span>
        </AnimatePresence>
        <button onClick={() => navigateMonth(1)}
          className="p-2 rounded-lg bg-surface dark:bg-dark-surface border border-card-border dark:border-dark-border
                     hover:bg-card-border dark:hover:bg-dark-border transition-colors">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col items-center gap-1 p-3 bg-surface dark:bg-dark-surface rounded-lg">
          <span className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
            {t('totalSpent')}
          </span>
          <motion.span key={`t-${currentMonth.getMonth()}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`text-xl font-semibold text-text-primary dark:text-dark-text ${privacyMode ? 'blur-sm' : ''}`}>
            {fmt(total)}
          </motion.span>
        </div>
        <div className="flex flex-col items-center gap-1 p-3 bg-surface dark:bg-dark-surface rounded-lg">
          <span className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary uppercase tracking-wider">
            {t('transactionCount')}
          </span>
          <motion.span key={`c-${currentMonth.getMonth()}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="text-xl font-semibold text-text-primary dark:text-dark-text">
            {count}
          </motion.span>
        </div>
      </div>
    </div>
  );
}
