/* App - Root component v4
 * Purpose: Auth gate, dashboard layout, modals, shortcuts, export actions
 * Callers: main.jsx
 * Deps: store, all dashboard components, export utils
 * Side effects: keyboard shortcuts, file downloads
 */

import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from './store/useStore';
import { exportCSV, exportXLSX } from './lib/export';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import BalanceHeader from './components/BalanceHeader';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import DonutChart from './components/DonutChart';
import MonthlySummary from './components/MonthlySummary';
import AIInsights from './components/AIInsights';
import TrackerManager from './components/TrackerManager';
import CategoryManager from './components/CategoryManager';
import BudgetBar from './components/BudgetBar';
import KeyboardShortcuts from './components/KeyboardShortcuts';
import { SkeletonCard } from './components/Skeleton';

const DebtTracker = lazy(() => import('./components/DebtTracker'));
const SpendingHeatmap = lazy(() => import('./components/SpendingHeatmap'));
const Gamification = lazy(() => import('./components/Gamification'));

export default function App() {
  const { t } = useTranslation();
  const {
    user, authLoading, initAuth, loading,
    transactions, activeTracker, getCurrencySymbol,
  } = useStore();
  const [showTrackers, setShowTrackers] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [exportingXLSX, setExportingXLSX] = useState(false);
  const newTxnBtnRef = useRef(null);

  useEffect(() => { initAuth(); }, [initAuth]);

  const currencySymbol = getCurrencySymbol();

  const handleExportCSV = () => {
    if (!transactions.length || !activeTracker) return;
    exportCSV(transactions, activeTracker.name, currencySymbol);
  };

  const handleExportXLSX = async () => {
    if (!transactions.length || !activeTracker) return;
    setExportingXLSX(true);
    exportXLSX(transactions, activeTracker.name, currencySymbol);
    setExportingXLSX(false);
  };

  const handleShortcut = (action) => {
    if (action === 'new') newTxnBtnRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (action === 'search') setSearchActive((s) => !s);
    if (action === 'tracker') setShowTrackers(true);
    if (action === 'privacy') document.querySelector('[title="Privacy Mode"]')?.click();
  };

  const skeletonGrid = useMemo(() => (
    <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex flex-col gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
      <div className="flex flex-col gap-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </main>
  ), []);

  const lazyCard = <SkeletonCard className="min-h-[140px]" />;

  if (authLoading) {
    return (
      <div className="min-h-screen max-w-[1200px] mx-auto p-4 sm:p-6">
        <SkeletonCard className="mb-6" />
        {skeletonGrid}
      </div>
    );
  }

  if (!user) return <Auth />;

  return (
    <div className="max-w-[1200px] mx-auto p-4 sm:p-6">
      <KeyboardShortcuts onAction={handleShortcut} />

      <Navbar />
      <BalanceHeader />

      {/* Top controls */}
      <div className="flex flex-wrap gap-2 mb-6" ref={newTxnBtnRef}>
        <button onClick={() => setShowTrackers(true)} className="btn-secondary text-xs">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
          {t('trackers')}
        </button>
        <button onClick={() => setShowCategories(true)} className="btn-secondary text-xs">
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          {t('categories')}
        </button>
        <button onClick={handleExportCSV} className="btn-secondary text-xs" disabled={!transactions.length}>
          {t('exportCSV')}
        </button>
        <button onClick={handleExportXLSX} className="btn-secondary text-xs" disabled={!transactions.length || exportingXLSX}>
          {exportingXLSX ? t('loading') : t('exportExcel')}
        </button>
      </div>

      {loading ? skeletonGrid : (
        <>
          {/* Main grid */}
          <main className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-6">
              <TransactionForm />
              <BudgetBar />
              <TransactionList searchActive={searchActive} />
              <Suspense fallback={lazyCard}>
                <DebtTracker />
              </Suspense>
            </div>
            <div className="flex flex-col gap-6">
              <AIInsights />
              <DonutChart />
              <MonthlySummary />
              <Suspense fallback={lazyCard}>
                <SpendingHeatmap />
              </Suspense>
              <Suspense fallback={lazyCard}>
                <Gamification />
              </Suspense>
            </div>
          </main>
        </>
      )}

      <TrackerManager open={showTrackers} onClose={() => setShowTrackers(false)} />
      <CategoryManager open={showCategories} onClose={() => setShowCategories(false)} />
    </div>
  );
}
