/* Auth Component v3 - Login/Register + Forgot Password
 * Purpose: Auth UI with dark mode, forgot password flow
 * Callers: App.jsx (when user not logged in)
 * Deps: store, react-hook-form, zod, i18next
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';

const authSchema = z.object({
  email: z.string().email('Valid email required'),
  password: z.string().min(6, 'Min 6 characters'),
});

const resetSchema = z.object({
  email: z.string().email('Valid email required'),
});

export default function Auth() {
  const { t } = useTranslation();
  const [mode, setMode] = useState('login'); // login | register | forgot
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signIn, signUp, resetPassword } = useStore();

  const {
    register, handleSubmit, formState: { errors, isSubmitting }, reset,
  } = useForm({ resolver: zodResolver(mode === 'forgot' ? resetSchema : authSchema) });

  const onSubmit = async (data) => {
    setError('');
    setSuccess('');
    try {
      if (mode === 'login') {
        await signIn(data.email, data.password);
      } else if (mode === 'register') {
        await signUp(data.email, data.password);
        setSuccess(t('checkEmail'));
      } else {
        await resetPassword(data.email);
        setSuccess(t('resetSent'));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    reset();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-display text-text-primary dark:text-dark-text mb-2">
            {t('expenseTracker')}
          </h1>
          <p className="text-text-secondary dark:text-dark-text-secondary text-sm">
            {mode === 'login' ? t('signIn') : mode === 'register' ? t('signUp') : t('forgotPassword')}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">
              {t('email')}
            </label>
            <input
              {...register('email')}
              type="email"
              className="input-field"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-danger text-xs mt-1">{errors.email.message}</p>}
          </div>

          {mode !== 'forgot' && (
            <div>
              <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">
                {t('password')}
              </label>
              <input
                {...register('password')}
                type="password"
                className="input-field"
                placeholder="Min 6 characters"
              />
              {errors.password && <p className="text-danger text-xs mt-1">{errors.password.message}</p>}
            </div>
          )}

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 border border-red-200 text-danger text-sm rounded-lg p-3
                           dark:bg-red-950 dark:border-red-800"
              >
                {error}
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-green-50 border border-green-200 text-success text-sm rounded-lg p-3
                           dark:bg-green-950 dark:border-green-800"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isSubmitting
              ? t('loading')
              : mode === 'login'
                ? t('signIn')
                : mode === 'register'
                  ? t('signUp')
                  : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center">
          {mode === 'login' && (
            <>
              <button
                onClick={() => switchMode('forgot')}
                className="block w-full text-sm text-text-secondary dark:text-dark-text-secondary hover:text-primary transition-colors"
              >
                {t('forgotPassword')}
              </button>
              <button
                onClick={() => switchMode('register')}
                className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
              >
                {t('noAccount')}
              </button>
            </>
          )}
          {mode === 'register' && (
            <button
              onClick={() => switchMode('login')}
              className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
            >
              {t('hasAccount')}
            </button>
          )}
          {mode === 'forgot' && (
            <button
              onClick={() => switchMode('login')}
              className="text-sm text-primary hover:text-primary-hover font-medium transition-colors"
            >
              ← Back to {t('signIn')}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
