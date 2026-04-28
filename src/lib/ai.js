/* AI Service v5 - Financial Insights
 * Purpose: Gemini 1.5 Flash for insights and runway prediction
 * Callers: AIInsights
 * Deps: fetch (Gemini API)
 */

const API_KEY = import.meta.env.VITE_AI_API_KEY;
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEBUG = import.meta.env.DEV;

const log = (...args) => DEBUG && console.log('[AI]', ...args);
const logErr = (...args) => console.error('[AI]', ...args);

/**
 * @param {string} prompt
 * @param {object} genConfig
 * @returns {Promise<string>}
 */
async function callGemini(prompt, genConfig = {}) {
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      maxOutputTokens: 1024,
      ...genConfig,
    },
  };

  log('Sending request:', prompt.substring(0, 120));

  const res = await fetch(
    `${BASE_URL}/gemini-1.5-flash:generateContent?key=${API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Gemini API HTTP ${res.status}: ${errBody}`);
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  if (!candidate) {
    throw new Error('Gemini returned no candidates (possible safety block)');
  }

  const text = candidate.content?.parts?.[0]?.text?.trim() || '';
  log('Response received, length:', text.length);
  return text;
}

/**
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function askAI(prompt) {
  if (!API_KEY) {
    log('No API key configured (VITE_AI_API_KEY)');
    return '';
  }
  try {
    return await callGemini(prompt);
  } catch (err) {
    logErr('API error:', err.message);
    return '';
  }
}

/**
 * Generate financial insight dari transaksi bulanan.
 * @param {{ item_name: string, amount: number, category_name: string }[]} transactions
 * @param {string} currencySymbol
 * @param {number} remainingBalance
 * @param {number|null} runwayDays
 * @returns {Promise<string>}
 */
export async function getFinancialInsight(
  transactions,
  currencySymbol = '$',
  remainingBalance = 0,
  runwayDays = null
) {
  if (!transactions.length || !API_KEY) return '';

  const summary = transactions.reduce((acc, t) => {
    acc[t.category_name] = (acc[t.category_name] || 0) + Number(t.amount);
    return acc;
  }, {});

  const breakdown = Object.entries(summary)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amt]) => `${cat}: ${currencySymbol}${amt.toFixed(2)}`)
    .join(', ');

  const total = transactions.reduce((s, t) => s + Number(t.amount), 0);

  const hasRunway = typeof runwayDays === 'number';
  const runwayText = hasRunway ? `${runwayDays} days` : 'unknown';

  let runwayWarning;
  if (!hasRunway) {
    runwayWarning = 'Runway is unknown; advise tracking balance closely.';
  } else if (runwayDays <= 0) {
    runwayWarning = 'CRITICAL: Balance has run out. Strongly urge immediate action.';
  } else if (runwayDays < 7) {
    runwayWarning = 'Strongly warn that runway is under 7 days and prioritize immediate spending cuts.';
  } else if (runwayDays < 14) {
    runwayWarning = 'Caution: runway is under 2 weeks, suggest moderate reduction in discretionary spending.';
  } else {
    runwayWarning = 'Runway is healthy; mention one area to optimize for long-term savings.';
  }

  log('Generating insight:', { total, remainingBalance, runwayDays });

  const prompt =
    `As a financial advisor, analyze this monthly spending:` +
    ` Total: ${currencySymbol}${total.toFixed(2)}.` +
    ` Breakdown by category (sorted highest to lowest): ${breakdown}.` +
    ` Remaining balance: ${currencySymbol}${Number(remainingBalance).toFixed(2)}.` +
    ` Runway: ${runwayText}.` +
    ` ${runwayWarning}` +
    ` Give ONE concise sentence of actionable financial advice or warning. Be specific to the numbers.`;

  return await askAI(prompt);
}