/**
 * Golden Hackathon Starter — SpendX Multi-Currency Utility
 * Real-time and cached currency exchange conversions for USD, INR, EUR, and GBP.
 */

export const EXCHANGE_RATES = {
  USD: 1.0,
  INR: 86.5,
  EUR: 0.95,
  GBP: 0.80,
};

export const CURRENCY_SYMBOLS = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
};

/**
 * Format amount with currency symbol and locale separators.
 */
export function formatCurrency(amount, currency = 'USD') {
  const num = Number(amount) || 0;
  const curr = currency.toUpperCase();
  const symbol = CURRENCY_SYMBOLS[curr] || '$';
  return `${symbol}${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Convert amount between any two supported currencies.
 */
export function convertCurrency(amount, fromCurr = 'USD', toCurr = 'USD') {
  const num = Number(amount) || 0;
  const fromRate = EXCHANGE_RATES[fromCurr.toUpperCase()] || 1.0;
  const toRate = EXCHANGE_RATES[toCurr.toUpperCase()] || 1.0;

  // Convert to USD base first
  const usdAmount = num / fromRate;
  const targetAmount = usdAmount * toRate;
  return Math.round(targetAmount * 100) / 100;
}
