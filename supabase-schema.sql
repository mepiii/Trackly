-- Supabase SQL Schema v3 - Universal Finance OS
-- Run in Supabase SQL Editor (fresh install)
-- Tables: profiles, trackers, categories, transactions, debts

-- Clean slate
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user() cascade;
drop function if exists public.handle_updated_at() cascade;
drop function if exists public.handle_category_delete() cascade;

drop table if exists public.debts cascade;
drop table if exists public.transactions cascade;
drop table if exists public.categories cascade;
drop table if exists public.trackers cascade;
drop table if exists public.profiles cascade;

create extension if not exists "uuid-ossp";

-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  language text default 'en',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Trackers (workspaces with currency + budget)
create table public.trackers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  currency_code text not null default 'USD',
  currency_symbol text not null default '$',
  is_default boolean default false,
  opening_balance numeric(14,2) default 0,
  monthly_budget numeric(14,2) default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Categories (scoped to tracker)
create table public.categories (
  id uuid default uuid_generate_v4() primary key,
  tracker_id uuid references public.trackers on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  color text not null default '#3B82F6',
  is_default boolean default false,
  created_at timestamptz default now(),
  constraint unique_category_per_tracker unique (tracker_id, name)
);

-- Transactions (qty/unit_price + recurring flag)
create table public.transactions (
  id uuid default uuid_generate_v4() primary key,
  tracker_id uuid references public.trackers on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  item_name text not null,
  quantity numeric(12,4) not null default 1,
  unit_price numeric(12,2) not null default 0,
  amount numeric(12,2) not null check (amount > 0),
  category_id uuid references public.categories on delete set null,
  category_name text not null default 'Uncategorized',
  is_recurring boolean default false,
  date timestamptz default now(),
  created_at timestamptz default now()
);

-- Debts (lent/borrowed tracker)
create table public.debts (
  id uuid default uuid_generate_v4() primary key,
  tracker_id uuid references public.trackers on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  person_name text not null,
  amount numeric(12,2) not null check (amount > 0),
  type text not null check (type in ('lent', 'borrowed')),
  description text,
  is_settled boolean default false,
  due_date timestamptz,
  phone text,
  created_at timestamptz default now(),
  settled_at timestamptz
);

-- Indexes
create index idx_trackers_user_id on public.trackers(user_id);
create index idx_categories_tracker_id on public.categories(tracker_id);
create index idx_categories_user_id on public.categories(user_id);
create index idx_transactions_tracker_id on public.transactions(tracker_id);
create index idx_transactions_user_id on public.transactions(user_id);
create index idx_transactions_date on public.transactions(date);
create index idx_transactions_tracker_date on public.transactions(tracker_id, date desc);
create index idx_debts_tracker_id on public.debts(tracker_id);
create index idx_debts_user_id on public.debts(user_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.trackers enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.debts enable row level security;

-- Profiles RLS
create policy "profiles_select" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Trackers RLS
create policy "trackers_select" on public.trackers for select using (auth.uid() = user_id);
create policy "trackers_insert" on public.trackers for insert with check (auth.uid() = user_id);
create policy "trackers_update" on public.trackers for update using (auth.uid() = user_id);
create policy "trackers_delete" on public.trackers for delete using (auth.uid() = user_id);

-- Categories RLS
create policy "categories_select" on public.categories for select using (auth.uid() = user_id);
create policy "categories_insert" on public.categories for insert with check (auth.uid() = user_id);
create policy "categories_update" on public.categories for update using (auth.uid() = user_id);
create policy "categories_delete" on public.categories for delete using (auth.uid() = user_id);

-- Transactions RLS
create policy "transactions_select" on public.transactions for select using (auth.uid() = user_id);
create policy "transactions_insert" on public.transactions for insert with check (auth.uid() = user_id);
create policy "transactions_update" on public.transactions for update using (auth.uid() = user_id);
create policy "transactions_delete" on public.transactions for delete using (auth.uid() = user_id);

-- Debts RLS
create policy "debts_select" on public.debts for select using (auth.uid() = user_id);
create policy "debts_insert" on public.debts for insert with check (auth.uid() = user_id);
create policy "debts_update" on public.debts for update using (auth.uid() = user_id);
create policy "debts_delete" on public.debts for delete using (auth.uid() = user_id);

-- Auto-create profile + default tracker + categories on signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  tracker_id uuid;
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));

  insert into public.trackers (user_id, name, currency_code, currency_symbol, is_default)
  values (new.id, 'Personal', 'USD', '$', true)
  returning id into tracker_id;

  insert into public.categories (tracker_id, user_id, name, color, is_default) values
    (tracker_id, new.id, 'Food', '#F59E0B', true),
    (tracker_id, new.id, 'Transport', '#3B82F6', true),
    (tracker_id, new.id, 'Fun', '#8B5CF6', true);

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_profile_updated
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger on_tracker_updated
  before update on public.trackers
  for each row execute function public.handle_updated_at();

-- Category delete → set transactions to 'Uncategorized'
create or replace function public.handle_category_delete()
returns trigger as $$
begin
  update public.transactions
  set category_id = null, category_name = 'Uncategorized'
  where category_id = old.id;
  return old;
end;
$$ language plpgsql security definer;

create trigger on_category_deleted
  before delete on public.categories
  for each row execute function public.handle_category_delete();
