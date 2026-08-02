/* Transaction Store (Zustand) v3 — Universal Finance OS
 * Purpose: Auth, multi-tracker, dark mode, multi-account, budget, debts, privacy, i18n state
 * Callers: All UI components
 * Deps: zustand, lib/supabase
 * Side effects: Supabase DB reads/writes, auth state listener, localStorage (theme + sessions + privacy + language)
 */

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { getRunwayDays as calculateRunwayDays } from '../lib/runway';

const CUSTOM_COLORS = ['#EC4899', '#10B981', '#F97316', '#06B6D4', '#84CC16'];
const SESSIONS_KEY = 'expense_tracker_sessions';
const THEME_KEY = 'expense_tracker_theme';
const PRIVACY_KEY = 'expense_tracker_privacy';
const LANG_KEY = 'expense_tracker_lang';

// --- Helpers ---
function loadSessions() {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); }
  catch { return []; }
}
function saveSessions(sessions) { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)); }
function loadTheme() { return localStorage.getItem(THEME_KEY) || 'light'; }
function applyThemeClass(theme) {
  theme === 'dark'
    ? document.documentElement.classList.add('dark')
    : document.documentElement.classList.remove('dark');
}

export const useStore = create((set, get) => ({
  // --- Auth ---
  user: null,
  authLoading: true,
  savedSessions: loadSessions(),

  // --- Theme ---
  theme: loadTheme(),

  // --- Privacy ---
  privacyMode: localStorage.getItem(PRIVACY_KEY) === 'true',

  // --- Language ---
  language: localStorage.getItem(LANG_KEY) || 'en',

  // --- Trackers ---
  trackers: [],
  activeTracker: null,

  // --- Data ---
  transactions: [],
  categories: [],
  debts: [],
  loading: false,

  // --- Month nav ---
  currentMonth: new Date(),

  // --- Streaks / Gamification ---
  streak: 0,
  badges: [],

  // ===================== AUTH =====================

  initAuth: async () => {
    const theme = loadTheme();
    applyThemeClass(theme);
    set({ theme });

    const { data: { session } } = await supabase.auth.getSession();
    set({ user: session?.user ?? null, authLoading: false });

    supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      set({ user });
      if (user) {
        get().saveCurrentSession(session);
        get().fetchTrackers();
      } else {
        set({ transactions: [], categories: [], trackers: [], activeTracker: null, debts: [] });
      }
    });

    if (session?.user) {
      get().saveCurrentSession(session);
      await get().fetchTrackers();
    }
  },

  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, transactions: [], categories: [], trackers: [], activeTracker: null, debts: [] });
  },

  resetPassword: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  changeEmail: async (newEmail) => {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) throw error;
  },

  changePassword: async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  },

  deleteAccount: async () => {
    const user = get().user;
    if (!user) throw new Error('Not authenticated');
    const { error } = await supabase.functions.invoke('delete-user-account', {
      body: { confirm: true },
    });
    if (error) throw error;
    const nextSessions = loadSessions().filter((s) => s.userId !== user.id);
    saveSessions(nextSessions);
    await supabase.auth.signOut();
    set({ user: null, transactions: [], categories: [], trackers: [], activeTracker: null, debts: [], savedSessions: nextSessions });
  },

  // --- Multi-account ---
  saveCurrentSession: (session) => {
    if (!session?.access_token || !session?.refresh_token) return;
    const sessions = loadSessions();
    const email = session.user?.email || 'unknown';
    const idx = sessions.findIndex((s) => s.email === email);
    const entry = {
      email, userId: session.user?.id,
      accessToken: session.access_token, refreshToken: session.refresh_token,
      expiresAt: session.expires_at,
    };
    idx >= 0 ? (sessions[idx] = entry) : sessions.push(entry);
    saveSessions(sessions);
    set({ savedSessions: sessions });
  },

  switchAccount: async (email) => {
    const target = loadSessions().find((s) => s.email === email);
    if (!target) throw new Error('Session not found');
    const { error } = await supabase.auth.setSession({
      access_token: target.accessToken, refresh_token: target.refreshToken,
    });
    if (error) throw error;
  },

  removeSession: (email) => {
    const sessions = loadSessions().filter((s) => s.email !== email);
    saveSessions(sessions);
    set({ savedSessions: sessions });
  },

  // ===================== THEME =====================

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, next);
    applyThemeClass(next);
    set({ theme: next });
  },

  // ===================== PRIVACY =====================

  togglePrivacy: () => {
    const next = !get().privacyMode;
    localStorage.setItem(PRIVACY_KEY, String(next));
    set({ privacyMode: next });
  },

  // ===================== LANGUAGE =====================

  setLanguage: (lang) => {
    localStorage.setItem(LANG_KEY, lang);
    set({ language: lang });
  },

  // ===================== TRACKERS =====================

  fetchTrackers: async () => {
    const { data, error } = await supabase
      .from('trackers').select('*')
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });

    if (!error && data) {
      const active = data.find((t) => t.is_default) || data[0] || null;
      set({ trackers: data, activeTracker: active });
      if (active) {
        await get().fetchCategories(active.id);
        await get().fetchTransactions(active.id);
        await get().fetchDebts(active.id);
      }
    }
  },

  setActiveTracker: async (trackerId) => {
    const tracker = get().trackers.find((t) => t.id === trackerId);
    if (!tracker) return;
    set({ activeTracker: tracker });
    await get().fetchCategories(trackerId);
    await get().fetchTransactions(trackerId);
    await get().fetchDebts(trackerId);
  },

  addTracker: async (name, currencyCode, currencySymbol) => {
    const user = get().user;
    if (!user) return;
    const { data, error } = await supabase
      .from('trackers')
      .insert({ user_id: user.id, name, currency_code: currencyCode, currency_symbol: currencySymbol })
      .select().single();
    if (error) throw error;
    await supabase.from('categories').insert([
      { tracker_id: data.id, user_id: user.id, name: 'Food', color: '#F59E0B', is_default: true },
      { tracker_id: data.id, user_id: user.id, name: 'Transport', color: '#3B82F6', is_default: true },
      { tracker_id: data.id, user_id: user.id, name: 'Fun', color: '#8B5CF6', is_default: true },
    ]);
    set((s) => ({ trackers: [...s.trackers, data] }));
    return data;
  },

  deleteTracker: async (trackerId) => {
    const { error } = await supabase.from('trackers').delete().eq('id', trackerId);
    if (error) throw error;
    const remaining = get().trackers.filter((t) => t.id !== trackerId);
    const newActive = remaining.find((t) => t.is_default) || remaining[0] || null;
    set({ trackers: remaining, activeTracker: newActive });
    if (newActive) {
      await get().fetchCategories(newActive.id);
      await get().fetchTransactions(newActive.id);
      await get().fetchDebts(newActive.id);
    } else {
      set({ categories: [], transactions: [], debts: [] });
    }
  },

  updateTrackerBudget: async (trackerId, monthlyBudget) => {
    const { error } = await supabase.from('trackers').update({ monthly_budget: monthlyBudget }).eq('id', trackerId);
    if (error) throw error;
    set((s) => ({
      trackers: s.trackers.map((t) => t.id === trackerId ? { ...t, monthly_budget: monthlyBudget } : t),
      activeTracker: s.activeTracker?.id === trackerId ? { ...s.activeTracker, monthly_budget: monthlyBudget } : s.activeTracker,
    }));
  },

  updateTrackerOpeningBalance: async (trackerId, openingBalance) => {
    const { error } = await supabase.from('trackers').update({ opening_balance: openingBalance }).eq('id', trackerId);
    if (error) throw error;
    set((s) => ({
      trackers: s.trackers.map((t) => t.id === trackerId ? { ...t, opening_balance: openingBalance } : t),
      activeTracker: s.activeTracker?.id === trackerId ? { ...s.activeTracker, opening_balance: openingBalance } : s.activeTracker,
    }));
  },

  // ===================== CATEGORIES =====================

  fetchCategories: async (trackerId) => {
    const tid = trackerId || get().activeTracker?.id;
    if (!tid) return;
    const { data, error } = await supabase
      .from('categories').select('*').eq('tracker_id', tid)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: true });
    if (!error && data) set({ categories: data });
  },

  addCategory: async (name) => {
    const user = get().user;
    const tracker = get().activeTracker;
    if (!user || !tracker) return;
    const colorIdx = get().categories.filter((c) => !c.is_default).length;
    const color = CUSTOM_COLORS[colorIdx % CUSTOM_COLORS.length];
    const { data, error } = await supabase
      .from('categories')
      .insert({ tracker_id: tracker.id, user_id: user.id, name, color })
      .select().single();
    if (error) throw error;
    set((s) => ({ categories: [...s.categories, data] }));
  },

  updateCategory: async (id, updates) => {
    const { error } = await supabase.from('categories').update(updates).eq('id', id);
    if (error) throw error;
    set((s) => ({ categories: s.categories.map((c) => c.id === id ? { ...c, ...updates } : c) }));
  },

  deleteCategory: async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    set((s) => ({
      categories: s.categories.filter((c) => c.id !== id),
      transactions: s.transactions.map((t) =>
        t.category_id === id ? { ...t, category_id: null, category_name: 'Uncategorized' } : t
      ),
    }));
  },

  getCategoryColor: (categoryName) => {
    const cat = get().categories.find((c) => c.name === categoryName);
    if (cat) return cat.color;
    if (categoryName === 'Uncategorized') return '#94a3b8';
    const idx = get().categories.findIndex((c) => c.name === categoryName);
    return CUSTOM_COLORS[Math.max(0, idx) % CUSTOM_COLORS.length];
  },

  // ===================== TRANSACTIONS =====================

  fetchTransactions: async (trackerId) => {
    const tid = trackerId || get().activeTracker?.id;
    if (!tid) return;
    set({ loading: true });
    const { data, error } = await supabase
      .from('transactions').select('*').eq('tracker_id', tid)
      .order('date', { ascending: false });
    if (!error && data) {
      set({ transactions: data });
      get().computeStreak(data);
    }
    set({ loading: false });
  },

  addTransaction: async (itemName, quantity, unitPrice, amount, categoryName, isRecurring = false) => {
    const user = get().user;
    const tracker = get().activeTracker;
    if (!user || !tracker) return;
    const cat = get().categories.find((c) => c.name === categoryName);
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        tracker_id: tracker.id, user_id: user.id, item_name: itemName,
        quantity: parseFloat(quantity), unit_price: parseFloat(unitPrice),
        amount: parseFloat(amount), category_id: cat?.id ?? null,
        category_name: categoryName, is_recurring: isRecurring,
      })
      .select().single();
    if (error) throw error;
    set((s) => ({ transactions: [data, ...s.transactions] }));
    get().computeStreak([data, ...get().transactions]);
    return data;
  },

  deleteTransaction: async (id) => {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
    set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id) }));
  },

  // ===================== DEBTS =====================

  fetchDebts: async (trackerId) => {
    const tid = trackerId || get().activeTracker?.id;
    if (!tid) return;
    const { data, error } = await supabase
      .from('debts').select('*').eq('tracker_id', tid)
      .order('created_at', { ascending: false });
    if (!error && data) set({ debts: data });
  },

  addDebt: async (personName, amount, type, description = '', phone = '', dueDate = null) => {
    const user = get().user;
    const tracker = get().activeTracker;
    if (!user || !tracker) return;
    const { data, error } = await supabase
      .from('debts')
      .insert({
        tracker_id: tracker.id, user_id: user.id, person_name: personName,
        amount: parseFloat(amount), type, description, phone,
        due_date: dueDate || null,
      })
      .select().single();
    if (error) throw error;
    set((s) => ({ debts: [data, ...s.debts] }));
    return data;
  },

  settleDebt: async (id) => {
    const { error } = await supabase.from('debts').update({ is_settled: true, settled_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
    set((s) => ({
      debts: s.debts.map((d) => d.id === id ? { ...d, is_settled: true, settled_at: new Date().toISOString() } : d),
    }));
  },

  deleteDebt: async (id) => {
    const { error } = await supabase.from('debts').delete().eq('id', id);
    if (error) throw error;
    set((s) => ({ debts: s.debts.filter((d) => d.id !== id) }));
  },

  // ===================== COMPUTED =====================

  getBalance: () => {
    const openingBalance = Number(get().activeTracker?.opening_balance || 0);
    const spent = get().transactions.reduce((sum, t) => sum + Number(t.amount), 0);
    return openingBalance - spent;
  },

  getCurrencySymbol: () => get().activeTracker?.currency_symbol || '$',

  getMonthlyTransactions: () => {
    const { currentMonth, transactions } = get();
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    return transactions.filter((t) => {
      const d = new Date(t.date);
      return d.getFullYear() === year && d.getMonth() === month;
    });
  },

  getCategoryBreakdown: () => {
    const breakdown = {};
    get().transactions.forEach((t) => {
      breakdown[t.category_name] = (breakdown[t.category_name] || 0) + Number(t.amount);
    });
    return breakdown;
  },

  getMonthlySpent: () => {
    const now = new Date();
    return get().transactions
      .filter((t) => { const d = new Date(t.date); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); })
      .reduce((s, t) => s + Number(t.amount), 0);
  },

  getBudgetUsage: () => {
    const budget = Number(get().activeTracker?.monthly_budget || 0);
    const spent = get().getMonthlySpent();
    const remaining = budget - spent;
    const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
    return { budget, spent, pct, remaining };
  },

  getRunwayDays: () => calculateRunwayDays(get().transactions, get().getBalance()),

  // --- Streak computation ---
  computeStreak: (txns) => {
    if (!txns?.length) { set({ streak: 0 }); return; }
    const dateSet = new Set(txns.map((t) => new Date(t.date).toDateString()));
    let streak = 0;
    const d = new Date();
    while (dateSet.has(d.toDateString())) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    const badges = [];
    if (streak >= 3) badges.push('3-day-streak');
    if (streak >= 7) badges.push('week-warrior');
    if (streak >= 30) badges.push('monthly-master');
    if (txns.length >= 100) badges.push('centurion');
    if (txns.length >= 50) badges.push('half-century');
    set({ streak, badges });
  },

  getDebtSummary: () => {
    const debts = get().debts.filter((d) => !d.is_settled);
    const lent = debts.filter((d) => d.type === 'lent').reduce((s, d) => s + Number(d.amount), 0);
    const borrowed = debts.filter((d) => d.type === 'borrowed').reduce((s, d) => s + Number(d.amount), 0);
    return { lent, borrowed, net: lent - borrowed, count: debts.length };
  },

  // --- Heatmap data (last 365 days) ---
  getHeatmapData: () => {
    const map = {};
    get().transactions.forEach((t) => {
      const key = new Date(t.date).toISOString().split('T')[0];
      map[key] = (map[key] || 0) + Number(t.amount);
    });
    return map;
  },

  // --- Month nav ---
  navigateMonth: (dir) =>
    set((s) => {
      const d = new Date(s.currentMonth);
      d.setMonth(d.getMonth() + dir);
      return { currentMonth: d };
    }),
}));
