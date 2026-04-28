/* TrackerManager v3 - With i18n + budget support
 * Purpose: CRUD for trackers with currency selection
 * Callers: App.jsx (modal)
 * Deps: store, framer-motion, i18next
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';

const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
];

export default function TrackerManager({ open, onClose }) {
  const { trackers, activeTracker, addTracker, deleteTracker, setActiveTracker } = useStore();
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    try {
      const cur = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];
      const tracker = await addTracker(name.trim(), cur.code, cur.symbol);
      if (tracker) await setActiveTracker(tracker.id);
      setName('');
      setCurrency('USD');
      setShowNew(false);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (trackers.length <= 1) return;
    try {
      await deleteTracker(id);
    } catch (err) {
      setError(err.message);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 dark:bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="card w-full max-w-md max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Manage Trackers</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface dark:hover:bg-dark-surface transition-colors"
            >
              <svg className="w-5 h-5 text-text-secondary dark:text-dark-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* Tracker list */}
          <div className="space-y-2 mb-4">
            {trackers.map((t) => (
              <div
                key={t.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer
                  ${t.id === activeTracker?.id
                    ? 'border-primary bg-primary/5 dark:bg-primary/10'
                    : 'border-card-border dark:border-dark-border hover:bg-surface dark:hover:bg-dark-surface'
                  }`}
                onClick={() => { setActiveTracker(t.id); onClose(); }}
              >
                <div>
                  <p className="font-medium text-sm text-text-primary dark:text-dark-text">
                    {t.name}
                    {t.id === activeTracker?.id && (
                      <span className="ml-2 text-xs text-primary font-normal">Active</span>
                    )}
                  </p>
                  <p className="text-xs text-text-tertiary dark:text-dark-text-secondary">
                    {t.currency_symbol} {t.currency_code}
                  </p>
                </div>
                {trackers.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                    className="p-1 text-text-tertiary hover:text-danger transition-colors"
                    title="Delete tracker"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* New tracker form */}
          {showNew ? (
            <form onSubmit={handleCreate} className="space-y-3 p-3 bg-surface dark:bg-dark-surface rounded-lg">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field text-sm"
                placeholder="Tracker name (e.g., Office)"
                required
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input-field text-sm"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code} — {c.name}
                  </option>
                ))}
              </select>
              {error && <p className="text-danger text-xs">{error}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={loading} className="btn-primary text-xs py-2 flex-1">
                  {loading ? 'Creating...' : 'Create Tracker'}
                </button>
                <button type="button" onClick={() => setShowNew(false)} className="btn-secondary text-xs py-2">
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowNew(true)}
              className="w-full text-sm text-primary font-medium hover:text-primary-hover transition-colors py-2"
            >
              + New Tracker
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
