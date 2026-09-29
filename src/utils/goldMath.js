// Gold weight and calculation utilities

// Standard conversions in Pakistani / South Asian Sarafa Bazaar:
// 1 Tola = 12 Masha
// 1 Masha = 8 Ratti
// 1 Tola = 96 Ratti
// 1 Tola = 11.664 Grams (Standard)
export const TOLA_TO_MASHA = 12;
export const MASHA_TO_RATTI = 8;
export const TOLA_TO_RATTI = 96; // 12 * 8
export const TOLA_TO_GRAMS = 11.664;
export const RATTI_TO_GRAMS = TOLA_TO_GRAMS / TOLA_TO_RATTI; // ~0.1215g

export const DEFAULT_GOLD_RATE = 275000;
const STORAGE_KEY = 'sarafa_daily_gold_rate_v1';

/**
 * Gets the stored daily gold rate from localStorage
 */
export function getStoredGoldRate() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.rate) {
        return parsed;
      }
    }
  } catch (e) {
    // fallback
  }
  return {
    rate: DEFAULT_GOLD_RATE,
    lastUpdated: 'آج صبح',
  };
}

/**
 * Saves the daily gold rate to localStorage
 */
export function saveStoredGoldRate(rate) {
  try {
    const num = parseFloat(rate) || DEFAULT_GOLD_RATE;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const data = {
      rate: num,
      lastUpdated: `${now.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeStr}`,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return data;
  } catch (e) {
    return { rate: parseFloat(rate) || DEFAULT_GOLD_RATE, lastUpdated: 'Saved' };
  }
}

/**
 * Calculates Karat rates based on 24K rate
 */
export function getKaratRates(rate24K = DEFAULT_GOLD_RATE) {
  const r24 = parseFloat(rate24K) || 0;
  return {
    k24: Math.round(r24),
    k22: Math.round(r24 * (22 / 24)),
    k21: Math.round(r24 * (21 / 24)),
    k18: Math.round(r24 * (18 / 24)),
    per10Grams: Math.round((r24 / TOLA_TO_GRAMS) * 10),
    perGram: Math.round(r24 / TOLA_TO_GRAMS),
  };
}

/**
 * Converts Tola, Masha, Ratti to total Ratti
 */
export function toTotalRatti(tola = 0, masha = 0, ratti = 0) {
  const t = parseFloat(tola) || 0;
  const m = parseFloat(masha) || 0;
  const r = parseFloat(ratti) || 0;
  return t * TOLA_TO_RATTI + m * MASHA_TO_RATTI + r;
}

/**
 * Converts Grams to total Ratti
 */
export function gramsToTotalRatti(grams = 0) {
  const g = parseFloat(grams) || 0;
  if (g <= 0) return 0;
  return (g / TOLA_TO_GRAMS) * TOLA_TO_RATTI;
}

/**
 * Converts total Ratti back into { tola, masha, ratti, formatted, rattiFixed }
 */
export function fromTotalRatti(totalRatti) {
  if (!totalRatti || totalRatti <= 0) {
    return { tola: 0, masha: 0, ratti: 0, rattiFixed: '0.0', formatted: '0T 0M 0R' };
  }
  
  const tola = Math.floor(totalRatti / TOLA_TO_RATTI);
  const remAfterTola = totalRatti % TOLA_TO_RATTI;
  
  const masha = Math.floor(remAfterTola / MASHA_TO_RATTI);
  const rattiVal = remAfterTola % MASHA_TO_RATTI;
  const ratti = Number(rattiVal.toFixed(1));
  const rattiFixed = rattiVal.toFixed(1);
  
  return {
    tola,
    masha,
    ratti,
    rattiFixed,
    formatted: `${tola}T ${masha}M ${ratti}R`,
  };
}

/**
 * Converts Tola-Masha-Ratti to Grams
 */
export function rattiToGrams(totalRatti) {
  if (!totalRatti || totalRatti <= 0) return 0;
  const tolas = totalRatti / TOLA_TO_RATTI;
  return Number((tolas * TOLA_TO_GRAMS).toFixed(3));
}

/**
 * Formats currency in PKR / Standard
 */
export function formatCurrency(amount) {
  if (!amount || isNaN(amount)) return 'Rs. 0';
  return 'Rs. ' + Math.round(amount).toLocaleString('en-PK');
}

/**
 * Formats number with commas
 */
export function formatNumber(amount) {
  if (!amount || isNaN(amount)) return '0';
  return Math.round(amount).toLocaleString('en-PK');
}
