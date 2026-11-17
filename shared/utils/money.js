/**
 * Formats minor units (paise) into INR currency strings.
 * @param {number} paise 
 * @param {string} [locale='en-IN']
 * @returns {string} e.g. "₹14,999.00"
 */
export function formatINR(paise, locale = 'en-IN') {
  if (typeof paise !== 'number' || isNaN(paise)) return '₹0.00';
  const rupees = paise / 100;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Converts rupees float to integer paise.
 * @param {number|string} rupees 
 * @returns {number}
 */
export function toPaise(rupees) {
  const val = typeof rupees === 'string' ? parseFloat(rupees) : rupees;
  return Math.round((val || 0) * 100);
}

