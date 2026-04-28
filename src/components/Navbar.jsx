/* Navbar v3 - Top nav with i18n, privacy, delete account
 * Purpose: Dark mode, account switcher, language toggle, privacy toggle, delete account
 * Callers: App.jsx
 * Deps: store, i18next, framer-motion
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const {
    user, theme, toggleTheme, signOut, signIn,
    savedSessions, switchAccount, removeSession,
    trackers, activeTracker, setActiveTracker,
    privacyMode, togglePrivacy, language, setLanguage,
    deleteAccount, changeEmail,
  } = useStore();

  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowAccountMenu(false);
        setShowAddAccount(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSwitchAccount = async (email) => {
    try {
      await switchAccount(email);
      setShowAccountMenu(false);
    } catch (err) {
      console.error('Switch failed:', err);
    }
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      await signIn(addEmail, addPassword);
      setAddEmail('');
      setAddPassword('');
      setShowAddAccount(false);
      setShowAccountMenu(false);
    } catch (err) {
      setAddError(err.message);
    }
    setAddLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== 'DELETE') return;
    setDeleteError('');
    try {
      await deleteAccount();
      setShowDeleteConfirm(false);
      setDeleteText('');
    } catch (err) {
      console.error('Delete account failed:', err);
      setDeleteError(err.message || 'Delete failed');
    }
  };

  const handleChangeEmail = async () => {
    setEmailMsg('');
    try {
      await changeEmail(newEmail);
      setEmailMsg('Confirmation email sent!');
      setNewEmail('');
    } catch (err) {
      setEmailMsg(err.message);
    }
  };

  const handleLangToggle = () => {
    const next = language === 'en' ? 'id' : 'en';
    i18n.changeLanguage(next);
    setLanguage(next);
  };

  const hasTrackerInfo = trackers.length > 0;

  return (
    <>
      <nav className={`flex items-center mb-6 ${hasTrackerInfo ? 'justify-between' : 'justify-end'}`}>
        {/* Left: Tracker */}
        <div className="flex items-center gap-4">
          {trackers.length > 1 && (
            <select
              value={activeTracker?.id || ''}
              onChange={(e) => setActiveTracker(e.target.value)}
              className="text-sm bg-transparent border border-card-border dark:border-dark-border rounded-lg px-2 py-1
                         text-text-secondary dark:text-dark-text-secondary focus:outline-none focus:border-primary"
            >
              {trackers.map((t) => (
                <option key={t.id} value={t.id}>{t.name} ({t.currency_symbol})</option>
              ))}
            </select>
          )}
          {trackers.length === 1 && activeTracker && (
            <span className="text-sm text-text-secondary dark:text-dark-text-secondary">
              {activeTracker.name} ({activeTracker.currency_symbol})
            </span>
          )}
        </div>

        {/* Right: Lang + Privacy + Dark + Account */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={handleLangToggle}
            className="px-2 py-1.5 rounded-lg border border-card-border dark:border-dark-border
                       bg-white dark:bg-dark-card hover:bg-surface dark:hover:bg-dark-surface transition-colors
                       text-xs font-semibold text-text-secondary dark:text-dark-text-secondary"
            title="Toggle language"
          >
            {language === 'en' ? 'ID' : 'EN'}
          </button>

          {/* Privacy toggle */}
          <button
            onClick={togglePrivacy}
            className={`p-2 rounded-pill border transition-colors ${
              privacyMode
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-card-border dark:border-dark-border bg-white dark:bg-dark-card text-text-secondary dark:text-dark-text-secondary hover:bg-surface dark:hover:bg-dark-surface'
            }`}
            title={t('privacyMode')}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {privacyMode ? (
                <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                <line x1="1" y1="1" x2="23" y2="23" /></>
              ) : (
                <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" /></>
              )}
            </svg>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-pill border border-card-border dark:border-dark-border
                       bg-white dark:bg-dark-card hover:bg-surface dark:hover:bg-dark-surface transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'light' ? (
              <svg className="w-5 h-5 text-text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-dark-text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>

          {/* Account menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowAccountMenu(!showAccountMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-card-border dark:border-dark-border
                         bg-white dark:bg-dark-card hover:bg-surface dark:hover:bg-dark-surface transition-colors text-sm"
            >
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-primary">
                  {user?.email?.[0]?.toUpperCase() || '?'}
                </span>
              </div>
              <span className="hidden sm:block text-text-primary dark:text-dark-text max-w-[120px] truncate">
                {user?.email}
              </span>
              <svg className="w-3 h-3 text-text-tertiary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            <AnimatePresence>
              {showAccountMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-dark-card border border-card-border
                             dark:border-dark-border rounded-xl shadow-elevated z-50 overflow-hidden"
                >
                  {/* Current account */}
                  <div className="p-3 border-b border-card-border dark:border-dark-border">
                    <p className="text-xs text-text-tertiary dark:text-dark-text-secondary mb-1">{t('signedInAs')}</p>
                    <p className="text-sm font-medium text-text-primary dark:text-dark-text truncate">{user?.email}</p>
                  </div>

                  {/* Other sessions */}
                  {savedSessions.filter((s) => s.email !== user?.email).length > 0 && (
                    <div className="p-2 border-b border-card-border dark:border-dark-border">
                      <p className="text-xs text-text-tertiary dark:text-dark-text-secondary px-2 mb-1">{t('switchAccount')}</p>
                      {savedSessions.filter((s) => s.email !== user?.email).map((s) => (
                        <div key={s.email} className="flex items-center justify-between">
                          <button
                            onClick={() => handleSwitchAccount(s.email)}
                            className="flex-1 text-left px-2 py-1.5 text-sm rounded-lg hover:bg-surface
                                       dark:hover:bg-dark-surface transition-colors text-text-primary dark:text-dark-text"
                          >
                            {s.email}
                          </button>
                          <button
                            onClick={() => removeSession(s.email)}
                            className="p-1 text-text-tertiary hover:text-danger transition-colors"
                          >
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add account */}
                  <div className="p-2 border-b border-card-border dark:border-dark-border">
                    {showAddAccount ? (
                      <form onSubmit={handleAddAccount} className="space-y-2 p-2">
                        <input type="email" value={addEmail} onChange={(e) => setAddEmail(e.target.value)}
                          placeholder={t('email')} className="input-field text-sm py-2" required />
                        <input type="password" value={addPassword} onChange={(e) => setAddPassword(e.target.value)}
                          placeholder={t('password')} className="input-field text-sm py-2" required />
                        {addError && <p className="text-danger text-xs">{addError}</p>}
                        <button type="submit" disabled={addLoading} className="btn-primary w-full text-xs py-2">
                          {addLoading ? t('loading') : t('signIn')}
                        </button>
                      </form>
                    ) : (
                      <button onClick={() => setShowAddAccount(true)}
                        className="w-full text-left px-2 py-1.5 text-sm text-primary hover:bg-surface
                                   dark:hover:bg-dark-surface rounded-lg transition-colors">
                        {t('addAccount')}
                      </button>
                    )}
                  </div>

                  {/* Change email */}
                  <div className="p-2 border-b border-card-border dark:border-dark-border">
                    {showChangeEmail ? (
                      <div className="space-y-2 p-2">
                        <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="New email" className="input-field text-sm py-2" />
                        {emailMsg && <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{emailMsg}</p>}
                        <div className="flex gap-2">
                          <button onClick={handleChangeEmail} className="btn-primary text-xs py-1.5 px-3 flex-1">{t('save')}</button>
                          <button onClick={() => { setShowChangeEmail(false); setEmailMsg(''); }}
                            className="btn-secondary text-xs py-1.5 px-3">{t('cancel')}</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => setShowChangeEmail(true)}
                        className="w-full text-left px-2 py-1.5 text-sm text-text-primary dark:text-dark-text
                                   hover:bg-surface dark:hover:bg-dark-surface rounded-lg transition-colors">
                        {t('changeEmail')}
                      </button>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-2 space-y-1">
                    <button onClick={signOut}
                      className="w-full text-left px-2 py-1.5 text-sm text-text-primary dark:text-dark-text
                                 hover:bg-surface dark:hover:bg-dark-surface rounded-lg transition-colors">
                      {t('signOut')}
                    </button>
                    <button onClick={() => setShowDeleteConfirm(true)}
                      className="w-full text-left px-2 py-1.5 text-sm text-danger
                                 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors">
                      {t('deleteAccount')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Delete account modal (double confirmation) */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 dark:bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="card w-full max-w-sm" onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-danger mb-2">{t('deleteAccount')}</h3>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-2">
                {t('deleteAccountWarning')}
              </p>
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-4">
                {t('typeToConfirm')}
              </p>
              <input
                value={deleteText} onChange={(e) => setDeleteText(e.target.value)}
                className="input-field mb-4" placeholder='Type "DELETE"'
              />
              {deleteError && (
                <p className="text-xs text-danger mb-4">{deleteError}</p>
              )}
              <div className="flex gap-3">
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteText(''); }}
                  className="btn-secondary flex-1">{t('cancel')}</button>
                <button onClick={handleDeleteAccount} disabled={deleteText !== 'DELETE'}
                  className="btn-danger flex-1 disabled:opacity-50">{t('delete')}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
