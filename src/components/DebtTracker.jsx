/* DebtTracker - Lent/Borrowed money manager
 * Purpose: Track debts with settle/delete, WhatsApp reminder link
 * Callers: App.jsx
 * Deps: store, framer-motion, i18next
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';

export default function DebtTracker() {
  const { t } = useTranslation();
  const { debts, addDebt, settleDebt, deleteDebt, getCurrencySymbol, getDebtSummary, privacyMode } = useStore();
  const symbol = getCurrencySymbol();
  const summary = getDebtSummary();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ personName: '', amount: '', type: 'lent', description: '', phone: '', dueDate: '' });
  const [error, setError] = useState('');

  const fmt = (n) => privacyMode ? '••••' : `${symbol}${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(n)}`;

  const handleAdd = async () => {
    if (!form.personName.trim() || !form.amount) return;
    setError('');
    try {
      await addDebt(form.personName.trim(), form.amount, form.type, form.description, form.phone, form.dueDate || null);
      setForm({ personName: '', amount: '', type: 'lent', description: '', phone: '', dueDate: '' });
      setShowForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const sendWhatsAppReminder = (debt) => {
    if (!debt.phone) return;
    const msg = encodeURIComponent(
      `Hi ${debt.person_name}, friendly reminder about the ${symbol}${Number(debt.amount).toFixed(2)} ${debt.type === 'lent' ? 'I lent you' : 'I borrowed from you'}. ${debt.description || ''}`
    );
    window.open(`https://wa.me/${debt.phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
  };

  const activeDebts = debts.filter((d) => !d.is_settled);
  const settledDebts = debts.filter((d) => d.is_settled);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title text-base">{t('debts')}</h2>
        <button onClick={() => setShowForm(!showForm)}
          className="text-xs text-primary hover:text-primary-hover transition-colors font-medium">
          + {t('addDebt')}
        </button>
      </div>

      {/* Summary cards */}
      {(summary.lent > 0 || summary.borrowed > 0) && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 bg-green-50 dark:bg-green-950 rounded-lg">
            <span className="text-xs text-success font-medium">{t('lent')}</span>
            <p className="text-sm font-semibold text-success">{fmt(summary.lent)}</p>
          </div>
          <div className="text-center p-2 bg-red-50 dark:bg-red-950 rounded-lg">
            <span className="text-xs text-danger font-medium">{t('borrowed')}</span>
            <p className="text-sm font-semibold text-danger">{fmt(summary.borrowed)}</p>
          </div>
          <div className="text-center p-2 bg-surface dark:bg-dark-surface rounded-lg">
            <span className="text-xs text-text-secondary dark:text-dark-text-secondary font-medium">{t('netBalance')}</span>
            <p className={`text-sm font-semibold ${summary.net >= 0 ? 'text-success' : 'text-danger'}`}>{fmt(Math.abs(summary.net))}</p>
          </div>
        </div>
      )}

      {/* Add form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="space-y-3 mb-4 p-3 bg-surface dark:bg-dark-surface rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <input value={form.personName} onChange={(e) => setForm({ ...form, personName: e.target.value })}
                className="input-field text-sm" placeholder={t('personName')} />
              <input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="input-field text-sm" placeholder={`${t('totalAmount')} (${symbol})`} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field text-sm">
                <option value="lent">{t('lent')}</option>
                <option value="borrowed">{t('borrowed')}</option>
              </select>
              <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="input-field text-sm" placeholder={t('dueDate')} />
            </div>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="input-field text-sm" placeholder={t('phone')} />
            <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input-field text-sm" placeholder="Description (optional)" />
            {error && <p className="text-danger text-xs">{error}</p>}
            <button onClick={handleAdd} className="btn-primary text-xs w-full">{t('addDebt')}</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active debts */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
        <AnimatePresence initial={false}>
          {activeDebts.map((d) => (
            <motion.div key={d.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                d.type === 'lent'
                  ? 'border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30'
                  : 'border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30'
              }`}>
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium text-text-primary dark:text-dark-text">{d.person_name}</span>
                <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-dark-text-secondary">
                  <span className={`font-medium ${d.type === 'lent' ? 'text-success' : 'text-danger'}`}>
                    {d.type === 'lent' ? t('lent') : t('borrowed')}
                  </span>
                  {d.due_date && <span>Due: {new Date(d.due_date).toLocaleDateString()}</span>}
                </div>
                {d.description && <span className="text-xs text-text-tertiary truncate">{d.description}</span>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-sm font-semibold ${d.type === 'lent' ? 'text-success' : 'text-danger'}`}>
                  {fmt(d.amount)}
                </span>
                {d.phone && (
                  <button onClick={() => sendWhatsAppReminder(d)} className="text-green-600 p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors" title="WhatsApp">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    </svg>
                  </button>
                )}
                <button onClick={() => settleDebt(d.id)} className="text-success p-1 hover:bg-green-100 dark:hover:bg-green-900 rounded transition-colors" title={t('settle')}>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
                <button onClick={() => deleteDebt(d.id)} className="text-text-tertiary hover:text-danger p-1 rounded transition-colors">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {activeDebts.length === 0 && (
          <p className="text-sm text-text-tertiary dark:text-dark-text-secondary text-center py-4">{t('noDebts')}</p>
        )}
      </div>

      {/* Settled (collapsed) */}
      {settledDebts.length > 0 && (
        <details className="mt-3">
          <summary className="text-xs text-text-tertiary dark:text-dark-text-secondary cursor-pointer hover:text-text-secondary">
            {settledDebts.length} {t('settled')}
          </summary>
          <div className="space-y-1 mt-2">
            {settledDebts.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-2 rounded-lg bg-surface dark:bg-dark-surface opacity-60">
                <span className="text-xs text-text-secondary dark:text-dark-text-secondary line-through">
                  {d.person_name} — {fmt(d.amount)}
                </span>
                <button onClick={() => deleteDebt(d.id)} className="text-text-tertiary hover:text-danger p-1 text-xs">✕</button>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
