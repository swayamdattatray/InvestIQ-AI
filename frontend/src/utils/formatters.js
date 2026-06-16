/**
 * Formats a number as Indian Rupee (INR) currency.
 * Uses Indian numbering system: ₹1,23,45,678.90
 */
export const formatCurrencyINR = (amount, decimals = 2) => {
  if (amount === undefined || amount === null) return '₹0.00';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatter.format(amount);
};

/**
 * Formats a number with Indian numbering system without the currency symbol.
 */
export const formatNumberIN = (num, decimals = 2) => {
  if (num === undefined || num === null) return '0.00';
  
  const formatter = new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatter.format(num);
};
