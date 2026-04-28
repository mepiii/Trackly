# Technical Docs

## Database Schema

### `profiles`
- `id uuid primary key references auth.users`
- `email text`
- `display_name text`
- `avatar_url text`
- `language text default 'en'`
- timestamps

### `trackers`
- `id uuid primary key`
- `user_id uuid references auth.users`
- `name text`
- `currency_code text`
- `currency_symbol text`
- `is_default boolean`
- `budget_limit numeric(14,2)`
- timestamps

### `categories`
- `id uuid primary key`
- `tracker_id uuid references trackers`
- `user_id uuid references auth.users`
- `name text`
- `color text`
- `is_default boolean`
- unique `(tracker_id, name)`

### `transactions`
- `id uuid primary key`
- `tracker_id uuid references trackers`
- `user_id uuid references auth.users`
- `item_name text`
- `quantity numeric(12,4)`
- `unit_price numeric(12,2)`
- `amount numeric(12,2)`
- `category_id uuid references categories`
- `category_name text`
- `is_recurring boolean default false`
- `date timestamptz`
- `created_at timestamptz`

### `debts`
- `id uuid primary key`
- `tracker_id uuid references trackers`
- `user_id uuid references auth.users`
- `person_name text`
- `amount numeric(12,2)`
- `type text check in ('lent','borrowed')`
- `description text`
- `is_settled boolean`
- `due_date timestamptz`
- `phone text`
- `created_at timestamptz`
- `settled_at timestamptz`

## Row Level Security (RLS)

All tables have RLS enabled.

### Profiles
- select: `auth.uid() = id`
- insert: `auth.uid() = id`
- update: `auth.uid() = id`

### Trackers / Categories / Transactions / Debts
- select: `auth.uid() = user_id`
- insert: `auth.uid() = user_id`
- update: `auth.uid() = user_id`
- delete: `auth.uid() = user_id`

## Triggers / Functions

### `handle_new_user()`
On `auth.users` insert:
- create profile
- create default `Personal` tracker
- create default categories (`Food`, `Transport`, `Fun`)

### `handle_updated_at()`
Before update:
- refresh `updated_at` on `profiles` and `trackers`

### `handle_category_delete()`
Before deleting category:
- set related transactions to `category_id = null`
- set `category_name = 'Uncategorized'`

## AI Features

### Financial Insight
Model: `gemini-1.5-flash`

Input:
- monthly transaction list
- category totals
- currency symbol

Output:
- one concise financial recommendation

### OCR Receipt
Input:
- uploaded image converted to base64

Output JSON:
```json
{
  "merchant": "...",
  "date": "YYYY-MM-DD",
  "total": "12345"
}
```

## Prediction Formula

### Runway Prediction
Goal: estimate when balance hits zero.

Current implementation in store:
1. sort transactions by date
2. compute `daysDiff = max(1, lastDate - firstDate)` in days
3. compute `dailyAvg = totalSpent / daysDiff`
4. compute `runwayDays = ceil(currentBalance / dailyAvg)`
5. compute projected zero date = `today + runwayDays`

Formula:

```text
runwayDays = ceil(balance / averageDailySpend)
averageDailySpend = totalSpent / observedDays
zeroDate = today + runwayDays
```

## Security Notes

- API keys loaded from `.env` via Vite env vars
- Supabase anon key only on client
- Delete-account flow now calls Supabase Edge Function `delete-user-account`, which verifies JWT and deletes current auth user with service-role privileges
- WhatsApp reminders use browser `wa.me` links only

## Missing Prompt3 Blueprint Items

Not fully implemented yet:
- Telegram bot webhook via Supabase Edge Functions
- Discord bot webhook via Supabase Edge Functions
- Bot command parser layer
- Bot command parser layer
