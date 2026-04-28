# Trackly

Professional expense tracking dashboard built with React, Vite, Tailwind CSS, Zustand, Supabase, Gemini AI, and PWA support.

Author: **Rizky Ahmad Arief**

## Features

- **Supabase Auth**: sign up, sign in, forgot password, change email, multi-account session switching
- **Multi-tracker workspace**: per-tracker currency, opening balance, and monthly budget
- **Subtractive balance**: total balance = opening balance − sum of all transactions; negative shown in red
- **Smart budgeting**: month-scoped spending with color-coded progress bar (green < 70%, yellow 70–90%, red > 90%), explicit remaining budget label
- **Advanced transactions**: quantity × unit price, manual override, recurring monthly flag
- **Category manager**: rename/delete with tracker-scoped categories
- **AI smart panel**: Gemini 1.5 Flash financial insights and runway prediction (based on remaining balance and 30-day rolling spend rate)
- **Debt & credit tracker**: lent/borrowed flows with WhatsApp reminder link
- **Dark mode**: `bg-zinc-950` with blue accents and polka-dot background
- **Privacy mode**: blur balances and amounts for public demos
- **Spending heatmap**: GitHub-style activity visualization per tracker
- **Gamification**: streak counter and achievement badges
- **Vim-style keyboard shortcuts**: navigate, search, toggle privacy without mouse
- **Export**: CSV and Excel (XLSX) with professional formatting and total summary row
- **Multi-language UI**: English and Bahasa Indonesia
- **Workbox PWA**: installable offline shell with cached static assets
- **Vitest + Playwright**: unit tests for runway/currency logic, E2E scaffold for happy-path coverage
- **Secure delete-account**: via Supabase Edge Function (JWT-verified, service-role backend)

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Zustand
- Supabase Auth + PostgreSQL + RLS
- Framer Motion
- React Hook Form + Zod
- Chart.js / react-chartjs-2
- i18next / react-i18next
- SheetJS (xlsx) for Excel export
- Gemini 1.5 Flash API

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env`

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_AI_API_KEY=your_gemini_api_key
```

### 3. Create database schema

Run `supabase-schema.sql` in Supabase SQL Editor, or apply migrations from `supabase/migrations/`.

### 4. Start app

```bash
npm run dev
```

### 5. Production build

```bash
npm run build
```

### 6. Run tests

```bash
npm test          # unit tests
npm run test:e2e  # Playwright E2E
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `n` | Jump to new transaction section |
| `/` | Toggle transaction search |
| `t` | Open tracker switcher |
| `p` | Toggle privacy mode |
| `?` | Show shortcut help |

## Supabase Setup Notes

- Delete account uses Edge Function `delete-user-account`; deploy the function and set service-role env vars before production use.
- Auth leaked-password protection is a dashboard-level setting — enable it under Supabase Auth settings.

## Architecture Notes

- Balance model is **subtractive**: `opening_balance − total_transactions`, not additive sum.
- Budget usage is **current calendar month only**.
- Runway = remaining balance ÷ average daily spend over last 30 days.
- All RLS policies use `(auth.uid() = user_id)` or `(select auth.uid())` for consistency.
