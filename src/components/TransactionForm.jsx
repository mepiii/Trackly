/* TransactionForm v3 - Add expense with qty × price + OCR receipt
 * Purpose: RHF + Zod, auto-calculate, recurring toggle, receipt scan
 * Note: Auto-categorize on blur DISABLED per Prompt3 spec
 * Callers: App.jsx
 * Deps: react-hook-form, zod, store, lib/ai
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';

const schema = z.object({
  itemName: z.string().min(1, 'Item name required'),
  quantity: z.number({ invalid_type_error: 'Enter a number' }).positive('Must be positive'),
  unitPrice: z.number({ invalid_type_error: 'Enter a number' }).positive('Must be positive'),
  amount: z.number({ invalid_type_error: 'Enter a number' }).positive('Must be positive'),
  category: z.string().min(1, 'Select a category'),
});

export default function TransactionForm() {
  const { t } = useTranslation();
  const { categories, addTransaction, addCategory, getCurrencySymbol } = useStore();
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [toast, setToast] = useState(null);
  const [manualAmount, setManualAmount] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
    
  const currencySymbol = getCurrencySymbol();
  const categoryNames = categories.map((c) => c.name);

  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { itemName: '', quantity: 1, unitPrice: '', amount: '', category: '' },
  });

  const qty = watch('quantity');
  const unitPrice = watch('unitPrice');

  // Auto-calculate amount = qty × unitPrice
  useEffect(() => {
    if (manualAmount) return;
    const q = parseFloat(qty) || 0;
    const p = parseFloat(unitPrice) || 0;
    if (q > 0 && p > 0) setValue('amount', parseFloat((q * p).toFixed(2)));
  }, [qty, unitPrice, manualAmount, setValue]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const onSubmit = async (data) => {
    try {
      await addTransaction(data.itemName, data.quantity, data.unitPrice, data.amount, data.category, isRecurring);
      reset({ itemName: '', quantity: 1, unitPrice: '', amount: '', category: '' });
      setManualAmount(false);
      setIsRecurring(false);
      showToast(t('transactionAdded'));
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddCategory = async () => {
    const name = customName.trim();
    if (!name) return;
    try {
      await addCategory(name);
      setCustomName('');
      setShowCustom(false);
      showToast(`Category "${name}" added`);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="section-title">{t('addTransaction')}</h2>
        </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Item Name */}
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">
            {t('itemName')}
          </label>
          <input {...register('itemName')} className="input-field" placeholder="e.g., Coffee, Bus ticket" />
          {errors.itemName && <p className="text-danger text-xs mt-1">{errors.itemName.message}</p>}
        </div>

        {/* Quantity + Unit Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">
              {t('quantity')}
            </label>
            <input {...register('quantity', { valueAsNumber: true })} type="number" step="any" min="0.01" className="input-field" placeholder="1" />
            {errors.quantity && <p className="text-danger text-xs mt-1">{errors.quantity.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">
              {t('unitPrice')} ({currencySymbol})
            </label>
            <input {...register('unitPrice', { valueAsNumber: true })} type="number" step="0.01" min="0.01" className="input-field" placeholder="0.00" />
            {errors.unitPrice && <p className="text-danger text-xs mt-1">{errors.unitPrice.message}</p>}
          </div>
        </div>

        {/* Total Amount */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary">
              {t('totalAmount')} ({currencySymbol})
            </label>
            <button type="button" onClick={() => setManualAmount(!manualAmount)}
              className="text-xs text-primary hover:text-primary-hover transition-colors">
              {manualAmount ? t('autoCalc') : t('override')}
            </button>
          </div>
          <input {...register('amount', { valueAsNumber: true })} type="number" step="0.01" min="0.01"
            className={`input-field ${!manualAmount ? 'bg-surface/50 dark:bg-dark-surface/50' : ''}`}
            placeholder="0.00" readOnly={!manualAmount} />
          {errors.amount && <p className="text-danger text-xs mt-1">{errors.amount.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-1">
            {t('category')}
          </label>
          <select {...register('category')} className="input-field">
            <option value="">{t('selectCategory')}</option>
            {categoryNames.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          {errors.category && <p className="text-danger text-xs mt-1">{errors.category.message}</p>}
        </div>

        {/* Custom Category */}
        {showCustom ? (
          <div className="flex gap-2">
            <input value={customName} onChange={(e) => setCustomName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
              className="input-field flex-1" placeholder={t('newCategory')} />
            <button type="button" onClick={handleAddCategory} className="btn-secondary">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => setShowCustom(true)}
            className="text-sm text-primary font-medium hover:text-primary-hover transition-colors">
            {t('addCustomCategory')}
          </button>
        )}

        {/* Recurring toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)}
            className="w-4 h-4 rounded border-input-border text-primary focus:ring-primary" />
          <span className="text-sm text-text-secondary dark:text-dark-text-secondary">{t('recurring')}</span>
        </label>

        {/* Submit */}
        <button type="submit" disabled={isSubmitting} className="btn-primary w-full disabled:opacity-50">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {isSubmitting ? t('adding') : t('addTransaction')}
        </button>
      </form>

      {/* Toast */}
      {toast && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className={`mt-4 p-3 rounded-lg text-sm ${
            toast.type === 'error'
              ? 'bg-red-50 text-danger border border-red-200 dark:bg-red-950 dark:border-red-800'
              : 'bg-green-50 text-success border border-green-200 dark:bg-green-950 dark:border-green-800'
          }`}>
          {toast.msg}
        </motion.div>
      )}
    </div>
  );
}
