-- Add opening_balance and monthly_budget to trackers
alter table public.trackers
  add column if not exists opening_balance numeric(14,2) not null default 0,
  add column if not exists monthly_budget numeric(14,2) not null default 0;

-- Backfill monthly_budget from existing budget_limit
update public.trackers
set monthly_budget = coalesce(budget_limit, 0)
where monthly_budget = 0;
