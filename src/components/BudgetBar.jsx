/* BudgetBar - Monthly budget progress with i18n
 * Purpose: Show monthly budget usage and remaining amount
 * Callers: App.jsx
 * Deps: store, framer-motion, i18next
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';

export default function BudgetBar() {
  const { t } = useTranslation();
  const { activeTracker, getBudgetUsage, updateTrackerBudget, getCurrencySymbol, privacyMode } = useStore();
  const { budget, spent, pct, remaining } = getBudgetUsage();
  const symbol = getCurrencySymbol();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const hasTracker = Boolean(activeTracker);

  const fmt = (n) => privacyMode ? '••••' : `${symbol}${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(n)}`;

  const handleSave = async () => {
    if (!activeTracker) return;
    const val = parseFloat(budgetInput);
    if (isNaN(val) || val < 0) return;
    setSaving(true);
    await updateTrackerBudget(activeTracker.id, val);
    setSaving(false);
    setEditing(false);
    setBudgetInput('');
  };

  const barColor = pct > 90 ? 'bg-danger' : pct >= 70 ? 'bg-yellow-500' : 'bg-success';

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title text-base">{t('budgetUsage')}</h2>
        <button
          onClick={() => { if (!hasTracker || saving) return; setEditing(!editing); setBudgetInput(String(budget || '')); }}
          className="text-xs text-primary hover:text-primary-hover transition-colors font-medium disabled:opacity-50"
          disabled={!hasTracker || saving}
        >
          {t('setBudget')}
        </button>
      </div>

      {editing && (
        <div className="flex gap-2 mb-3">
          <input
            type="number" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)}
            className="input-field text-sm flex-1" placeholder={`Monthly budget (${symbol})`}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            disabled={saving}
          />
          <button onClick={handleSave} className="btn-primary text-xs px-3" disabled={saving}>{saving ? t('loading') : t('save')}</button>
          <button onClick={() => setEditing(false)} className="btn-secondary text-xs px-3" disabled={saving}>{t('cancel')}</button>
        </div>
      )}

      {!hasTracker ? (
        <p className="text-sm text-text-tertiary dark:text-dark-text-secondary">{t('noTrackerSelected')}</p>
      ) : budget > 0 ? (
        <>
          <div className="w-full bg-surface dark:bg-dark-surface rounded-full h-3 mb-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className={`h-full rounded-full ${barColor}`}
            />
          </div>
          <div className="flex justify-between text-xs text-text-secondary dark:text-dark-text-secondary mb-1">
            <span>{fmt(spent)} / {fmt(budget)}</span>
            <span className={pct >= 100 ? 'text-danger font-semibold' : ''}>
              {pct >= 100 ? t('overBudget') : `${Math.round(pct)}%`}
            </span>
          </div>
          <div className="flex justify-between text-xs text-text-secondary dark:text-dark-text-secondary">
            <span>{t('remainingBudget')}</span>
            <span className={remaining < 0 ? 'text-danger font-semibold' : ''}>{fmt(remaining)}</span>
          </div>
        </>
      ) : (
        <p className="text-sm text-text-tertiary dark:text-dark-text-secondary">{t('noBudgetSet')}</p>
      )}
    </div>
  );
}
