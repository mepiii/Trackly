/* KeyboardShortcuts - Vim-style shortcut handler
 * Purpose: Global keyboard shortcuts: n=new, /=search, t=tracker, p=privacy
 * Callers: App.jsx
 * Deps: react
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const SHORTCUTS = [
  { key: 'n', action: 'new', desc: 'New Transaction' },
  { key: '/', action: 'search', desc: 'Search Transactions' },
  { key: 't', action: 'tracker', desc: 'Switch Tracker' },
  { key: 'p', action: 'privacy', desc: 'Toggle Privacy' },
  { key: '?', action: 'help', desc: 'Show Shortcuts' },
];

function isEditableNode(node) {
  if (!(node instanceof HTMLElement)) return false;
  if (node.isContentEditable) return true;
  if (['INPUT', 'TEXTAREA', 'SELECT'].includes(node.tagName)) return true;
  const role = node.getAttribute('role');
  return role === 'textbox' || role === 'combobox';
}

function isTypingContext(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return true;
  if (isEditableNode(event.target)) return true;
  return event.composedPath?.().some(isEditableNode) ?? false;
}

export default function KeyboardShortcuts({ onAction }) {
  const { t } = useTranslation();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if (isTypingContext(e)) return;

      const shortcut = SHORTCUTS.find((s) => s.key === e.key);
      if (!shortcut) return;

      e.preventDefault();
      if (shortcut.action === 'help') {
        setShowHelp((p) => !p);
      } else {
        onAction?.(shortcut.action);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onAction]);

  return (
    <AnimatePresence>
      {showHelp && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 dark:bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setShowHelp(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="card w-full max-w-xs" onClick={(e) => e.stopPropagation()}
          >
            <h3 className="section-title text-base mb-4">{t('shortcuts')}</h3>
            <div className="space-y-2">
              {SHORTCUTS.map((s) => (
                <div key={s.key} className="flex items-center justify-between">
                  <span className="text-sm text-text-secondary dark:text-dark-text-secondary">{s.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-surface dark:bg-dark-surface border border-card-border
                                  dark:border-dark-border text-xs font-mono text-text-primary dark:text-dark-text">
                    {s.key}
                  </kbd>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
