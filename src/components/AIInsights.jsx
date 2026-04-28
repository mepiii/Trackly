/* AIInsights v3 - Persistent smart panel with runway prediction
 * Purpose: AI insight + balance runway (zero-date) + skeleton loading
 * Callers: App.jsx
 * Deps: lib/ai, store, i18next, framer-motion
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { getFinancialInsight } from '../lib/ai';
import { Skeleton, SkeletonText } from './Skeleton';

export default function AIInsights() {
  const { t } = useTranslation();
  const { getMonthlyTransactions, currentMonth, getCurrencySymbol, getRunwayDays, getBalance, privacyMode } = useStore();
  const monthly = getMonthlyTransactions();
  const symbol = getCurrencySymbol();
  const runwayDays = getRunwayDays();
  const remainingBalance = getBalance();
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      if (monthly.length < 2) { setInsight(''); return; }
      setLoading(true);
      const result = await getFinancialInsight(monthly, symbol, remainingBalance, runwayDays);
      if (!cancelled) { setInsight(result); setLoading(false); }
    };
    fetch();
    return () => { cancelled = true; };
  }, [monthly.length, currentMonth.getMonth(), symbol, remainingBalance, runwayDays]);

  // Runway zero-date
  const zeroDate = runwayDays != null && runwayDays > 0
    ? new Date(Date.now() + runwayDays * 86400000).toLocaleDateString()
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card border-l-4 border-l-primary"
    >
      {/* AI Insight */}
      <div className="flex items-start gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
            <line x1="9" y1="21" x2="15" y2="21" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-text-primary dark:text-dark-text mb-1">
            {t('aiInsight')}
          </h3>
          {loading ? (
            <SkeletonText lines={2} />
          ) : insight ? (
            <p className="text-sm text-text-secondary dark:text-dark-text-secondary leading-relaxed">{insight}</p>
          ) : (
            <p className="text-sm text-text-tertiary dark:text-dark-text-secondary italic">
              Add 2+ transactions to get insights
            </p>
          )}
        </div>
      </div>

      {/* Runway Prediction */}
      <div className="flex items-center gap-3 p-3 bg-surface dark:bg-dark-surface rounded-lg">
        <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div>
          <h4 className="text-xs font-semibold text-text-primary dark:text-dark-text">{t('runway')}</h4>
          {runwayDays != null ? (
            <p className={`text-sm font-medium ${runwayDays <= 7 ? 'text-danger' : runwayDays <= 30 ? 'text-yellow-600' : 'text-success'}`}>
              {privacyMode ? '•• days' : t('runwayDays', { days: runwayDays })}
              {zeroDate && !privacyMode && (
                <span className="text-text-tertiary dark:text-dark-text-secondary ml-1 text-xs font-normal">
                  (~{zeroDate})
                </span>
              )}
            </p>
          ) : (
            <p className="text-xs text-text-tertiary dark:text-dark-text-secondary">Not enough data</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
