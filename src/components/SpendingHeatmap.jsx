/* SpendingHeatmap - GitHub-style daily spending heatmap
 * Purpose: Visualize spending intensity over last ~6 months
 * Callers: App.jsx
 * Deps: store, i18next
 */

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';

const WEEKS = 26; // ~6 months
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

export default function SpendingHeatmap() {
  const { t } = useTranslation();
  const { getHeatmapData, privacyMode, getCurrencySymbol } = useStore();
  const data = getHeatmapData();
  const symbol = getCurrencySymbol();

  const { grid, maxVal } = useMemo(() => {
    const today = new Date();
    const grid = [];
    let maxVal = 0;

    for (let w = WEEKS - 1; w >= 0; w--) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (w * 7 + (6 - d)));
        const key = date.toISOString().split('T')[0];
        const val = data[key] || 0;
        maxVal = Math.max(maxVal, val);
        week.push({ date: key, val });
      }
      grid.push(week);
    }
    return { grid, maxVal };
  }, [data]);

  const getColor = (val) => {
    if (!val) return 'bg-surface dark:bg-dark-surface';
    const intensity = maxVal > 0 ? val / maxVal : 0;
    if (intensity > 0.75) return 'bg-primary';
    if (intensity > 0.5) return 'bg-primary/70';
    if (intensity > 0.25) return 'bg-primary/40';
    return 'bg-primary/20';
  };

  const hasActivity = maxVal > 0;

  return (
    <div className="card">
      <h2 className="section-title text-base mb-3">{t('spendingHeatmap')}</h2>
      {hasActivity ? (
        <>
          <div className="overflow-x-auto">
            <div className="flex gap-0.5 min-w-fit">
              <div className="flex flex-col gap-0.5 mr-1">
                {DAYS.map((d, i) => (
                  <div key={i} className="h-3 w-6 text-[9px] text-text-tertiary dark:text-dark-text-secondary flex items-center">
                    {d}
                  </div>
                ))}
              </div>
              {grid.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-0.5">
                  {week.map((cell, di) => (
                    <div
                      key={di}
                      className={`w-3 h-3 rounded-sm ${getColor(cell.val)} transition-colors`}
                      title={privacyMode ? cell.date : `${cell.date}: ${symbol}${cell.val.toFixed(2)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2 justify-end">
            <span className="text-[9px] text-text-tertiary">Less</span>
            <div className="w-3 h-3 rounded-sm bg-surface dark:bg-dark-surface" />
            <div className="w-3 h-3 rounded-sm bg-primary/20" />
            <div className="w-3 h-3 rounded-sm bg-primary/40" />
            <div className="w-3 h-3 rounded-sm bg-primary/70" />
            <div className="w-3 h-3 rounded-sm bg-primary" />
            <span className="text-[9px] text-text-tertiary">More</span>
          </div>
        </>
      ) : (
        <p className="text-sm text-text-tertiary dark:text-dark-text-secondary">{t('noHeatmapData')}</p>
      )}
    </div>
  );
}
