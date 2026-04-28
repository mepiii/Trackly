/* Skeleton - Shimmer loading placeholders
 * Purpose: Skeleton loaders for data-fetching + AI states
 * Callers: TransactionList, DonutChart, AIInsights, MonthlySummary
 */

export function Skeleton({ className = '', circle = false }) {
  return (
    <div
      className={`animate-pulse bg-surface dark:bg-dark-surface rounded-lg ${
        circle ? 'rounded-full' : ''
      } ${className}`}
    />
  );
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card space-y-4 ${className}`}>
      <Skeleton className="h-5 w-1/3" />
      <SkeletonText lines={3} />
    </div>
  );
}

export function SkeletonTransaction() {
  return (
    <div className="flex items-center justify-between p-3 bg-surface dark:bg-dark-surface rounded-lg border border-card-border dark:border-dark-border">
      <div className="flex flex-col gap-2 flex-1">
        <Skeleton className="h-4 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-5 w-20" />
    </div>
  );
}
