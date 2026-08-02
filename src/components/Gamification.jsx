/* Gamification - Streak counter + achievement badges
 * Purpose: Display logging streaks and milestone badges
 * Callers: App.jsx
 * Deps: store, i18next
 */

import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';

const BADGE_META = {
  '3-day-streak': { icon: '🔥', label: '3-Day Streak', desc: 'Logged 3 days in a row' },
  'week-warrior': { icon: '⚔️', label: 'Week Warrior', desc: '7-day logging streak' },
  'monthly-master': { icon: '👑', label: 'Monthly Master', desc: '30-day logging streak' },
  'half-century': { icon: '🎯', label: 'Half Century', desc: '50 transactions logged' },
  'centurion': { icon: '💯', label: 'Centurion', desc: '100 transactions logged' },
};

export default function Gamification() {
  const { t } = useTranslation();
  const { streak, badges } = useStore();

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="section-title text-base">{t('streak')}</h2>
        <div className="flex items-center gap-1.5">
          <span className="text-2xl">🔥</span>
          <span className="text-xl font-bold text-primary">{streak}</span>
          <span className="text-sm text-text-secondary dark:text-dark-text-secondary">{t('days')}</span>
        </div>
      </div>

      {badges.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => {
            const meta = BADGE_META[badge];
            if (!meta) return null;
            return (
              <div key={badge} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-surface dark:bg-dark-surface
                                          rounded-full border border-card-border dark:border-dark-border"
                title={meta.desc}>
                <span className="text-sm">{meta.icon}</span>
                <span className="text-xs font-medium text-text-primary dark:text-dark-text">{meta.label}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-text-tertiary dark:text-dark-text-secondary">
          Start a logging streak to earn badges!
        </p>
      )}
    </div>
  );
}
