/* CategoryManager v3 - With i18n
 * Purpose: Edit/delete categories within active tracker
 * Callers: App.jsx (modal)
 * Deps: store, framer-motion, i18next
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';

export default function CategoryManager({ open, onClose }) {
  const { t } = useTranslation();
  const { categories, addCategory, updateCategory, deleteCategory } = useStore();
  const [newName, setNewName] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setError('');
    try { await addCategory(newName.trim()); setNewName(''); }
    catch (err) { setError(err.message); }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    setError('');
    try { await updateCategory(id, { name: editName.trim() }); setEditId(null); setEditName(''); }
    catch (err) { setError(err.message); }
  };

  const handleDelete = async (id) => {
    setError('');
    try { await deleteCategory(id); }
    catch (err) { setError(err.message); }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/30 dark:bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
          className="card w-full max-w-sm max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">{t('categories')}</h2>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface dark:hover:bg-dark-surface transition-colors">
              <svg className="w-5 h-5 text-text-secondary dark:text-dark-text-secondary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {error && <p className="text-danger text-xs mb-3">{error}</p>}

          <div className="space-y-2 mb-4">
            {categories.map((cat) => (
              <div key={cat.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-card-border dark:border-dark-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  {editId === cat.id ? (
                    <input value={editName} onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                      className="input-field text-sm py-1 px-2 w-32" autoFocus />
                  ) : (
                    <span className="text-sm text-text-primary dark:text-dark-text">
                      {cat.name}
                      {cat.is_default && <span className="text-xs text-text-tertiary ml-1">(default)</span>}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {editId === cat.id ? (
                    <>
                      <button onClick={() => handleUpdate(cat.id)} className="text-success p-1">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                      <button onClick={() => setEditId(null)} className="text-text-tertiary p-1">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(cat.id); setEditName(cat.name); }}
                        className="text-text-tertiary hover:text-primary p-1 transition-colors">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(cat.id)}
                        className="text-text-tertiary hover:text-danger p-1 transition-colors">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input value={newName} onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="input-field text-sm flex-1" placeholder={t('newCategory')} />
            <button onClick={handleAdd} className="btn-primary text-xs px-3">{t('addCategory')}</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
