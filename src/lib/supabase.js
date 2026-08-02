/* Supabase client singleton
 * Purpose: Initialize and export Supabase client for auth + DB ops
 * Callers: store/useTransactionStore, components/Auth
 * Deps: @supabase/supabase-js
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);
