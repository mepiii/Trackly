/* DonutChart v3 - Category breakdown with i18n + privacy
 * Purpose: Chart.js doughnut with dark mode + privacy blur
 * Callers: App.jsx
 * Deps: react-chartjs-2, chart.js, store, i18next
 */

import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { SkeletonCard } from './Skeleton';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DonutChart() {
  const { t } = useTranslation();
  const { getCategoryBreakdown, getCategoryColor, getCurrencySymbol, theme, loading, privacyMode } = useStore();
  const breakdown = getCategoryBreakdown();
  const labels = Object.keys(breakdown);
  const values = Object.values(breakdown);
  const symbol = getCurrencySymbol();
  const isDark = theme === 'dark';

  if (loading) return <SkeletonCard />;

  if (labels.length === 0) {
    return (
      <div className="card">
        <h2 className="section-title mb-4">{t('spendingByCategory')}</h2>
        <div className="flex flex-col items-center justify-center py-8 text-text-tertiary dark:text-dark-text-secondary min-h-[250px]">
          <svg className="w-12 h-12 mb-3 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" />
          </svg>
          <p className="font-medium text-text-secondary dark:text-dark-text-secondary">{t('addToSeeChart')}</p>
        </div>
      </div>
    );
  }

  const data = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: labels.map((cat) => getCategoryColor(cat)),
      borderWidth: 0, hoverOffset: 4,
    }],
  };

  const options = {
    responsive: true, maintainAspectRatio: true, cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 16, usePointStyle: true, pointStyle: 'circle',
          color: isDark ? '#fafafa' : '#1c2024',
          font: { family: 'Inter', size: 13 },
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            if (privacyMode) return `${ctx.label}: ••••`;
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const pct = ((ctx.raw / total) * 100).toFixed(1);
            return `${ctx.label}: ${symbol}${ctx.raw.toFixed(2)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="card">
      <h2 className="section-title mb-4">{t('spendingByCategory')}</h2>
      <div className={`relative min-h-[250px] flex items-center justify-center ${privacyMode ? 'blur-md' : ''}`}>
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}
