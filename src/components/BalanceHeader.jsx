/* BalanceHeader v3 - Balance display with privacy blur + i18n
 * Purpose: Prominent balance with animated count-up, privacy mode
 * Callers: App.jsx
 * Deps: store, i18next
 */

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { formatCurrency } from '../lib/currency';

export default function BalanceHeader() {
  const { t } = useTranslation();
  const { activeTracker, getBalance, getCurrencySymbol, privacyMode, updateTrackerOpeningBalance } = useStore();
  const balance = getBalance();
  const symbol = getCurrencySymbol();
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [openingBalanceInput, setOpeningBalanceInput] = useState('');
  const prevBalance = useRef(balance);

  useEffect(() => {
    const start = prevBalance.current;
    const end = balance;
    const duration = 400;
    const startTime = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayBalance(start + (end - start) * eased);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
    prevBalance.current = balance;
  }, [balance]);

  const formatted = formatCurrency(displayBalance, { symbol, privacyMode }).replace(symbol, '');

  const handleSaveOpeningBalance = async () => {
    if (!activeTracker) return;
    const val = parseFloat(openingBalanceInput);
    if (isNaN(val)) return;
    setSaving(true);
    await updateTrackerOpeningBalance(activeTracker.id, val);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div className="card text-center mb-6">
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
          {t('totalBalance')}
        </span>
        <button
          className="text-text-tertiary hover:text-primary disabled:opacity-50"
          title={t('editOpeningBalance')}
          onClick={() => {
            if (!activeTracker || saving) return;
            setOpeningBalanceInput(String(activeTracker.opening_balance ?? 0));
            setEditing(true);
          }}
          disabled={!activeTracker || saving}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        </button>
      </div>

      {editing && (
        <div className="flex items-center justify-center gap-2 mb-3">
          <input
            type="number"
            value={openingBalanceInput}
            onChange={(e) => setOpeningBalanceInput(e.target.value)}
            placeholder={`${t('openingBalancePlaceholder')} (${symbol})`}
            className="input-field text-sm max-w-[220px]"
            disabled={saving}
          />
          <button className="btn-primary text-xs px-3" onClick={handleSaveOpeningBalance} disabled={saving}>
            {saving ? t('loading') : t('save')}
          </button>
          <button className="btn-secondary text-xs px-3" onClick={() => setEditing(false)} disabled={saving}>
            {t('cancel')}
          </button>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-4xl sm:text-5xl font-bold tracking-display">
        <span className="text-text-tertiary dark:text-dark-text-secondary">{privacyMode ? '' : symbol}</span>
        <span className={`${displayBalance >= 0 ? 'text-success' : 'text-danger'} ${privacyMode ? 'blur-lg select-none' : ''}`}>
          {formatted}
        </span>
      </div>
    </div>
  );
}
