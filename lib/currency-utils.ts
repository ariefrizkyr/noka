/**
 * Currency utility functions for consistent formatting across the app
 * Now context-aware and fetches from user settings
 */

interface CurrencyOptions {
  currency?: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Format amount as currency with user settings awareness
 * @param amount - The amount to format
 * @param options - Currency formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number, 
  options: CurrencyOptions = {}
): string {
  const {
    currency = 'USD',
    locale,
    minimumFractionDigits,
    maximumFractionDigits,
  } = options;

  // Auto-detect locale if not provided
  const autoLocale = locale || getLocaleForCurrency(currency);
  
  // Special handling for IDR (Indonesian Rupiah) - no decimal places
  const isIDR = currency === 'IDR';
  
  const formatter = new Intl.NumberFormat(autoLocale, {
    style: 'currency',
    currency,
    minimumFractionDigits: minimumFractionDigits ?? (isIDR ? 0 : 2),
    maximumFractionDigits: maximumFractionDigits ?? (isIDR ? 0 : 2),
  });

  return formatter.format(amount);
}

/**
 * Format currency for different account types
 * Handles special cases like credit cards showing debt as negative
 * @param balance - Account balance
 * @param accountType - Type of account (bank_account, credit_card, etc.)
 * @param currency - Currency code (defaults to USD)
 * @returns Formatted balance string
 */
export function formatAccountBalance(
  balance: number,
  accountType: string,
  currency: string = 'USD'
): string {
  // For credit cards, show debt as negative if balance is positive (debt)
  if (accountType === 'credit_card' && balance > 0) {
    return `-${formatCurrency(Math.abs(balance), { currency })}`;
  }

  return formatCurrency(balance, { currency });
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    IDR: 'Rp',
    JPY: '¥',
    CNY: '¥',
    KRW: '₩',
    AUD: 'A$',
    CAD: 'C$',
  };

  return symbols[currency] || currency;
}

/**
 * Get currency info including symbol and name
 */
export function getCurrencyInfo(currency: string) {
  const currencies: Record<string, { symbol: string; name: string }> = {
    USD: { symbol: '$', name: 'US Dollar' },
    EUR: { symbol: '€', name: 'Euro' },
    GBP: { symbol: '£', name: 'British Pound' },
    IDR: { symbol: 'Rp', name: 'Indonesian Rupiah' },
    JPY: { symbol: '¥', name: 'Japanese Yen' },
    CNY: { symbol: '¥', name: 'Chinese Yuan' },
    KRW: { symbol: '₩', name: 'South Korean Won' },
    AUD: { symbol: 'A$', name: 'Australian Dollar' },
    CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  };

  return currencies[currency] || { symbol: currency, name: currency };
}

/**
 * Parse currency string to number
 */
export function parseCurrency(currencyString: string): number {
  // Remove currency symbols and spaces, then parse
  const numericString = currencyString.replace(/[^\d.-]/g, '');
  return parseFloat(numericString) || 0;
}

/**
 * Format currency with color coding based on amount and account type
 */
export function formatCurrencyWithColor(
  amount: number,
  accountType?: string,
  currency: string = 'USD'
): { formatted: string; colorClass: string } {
  const formatted = formatAccountBalance(amount, accountType || '', currency);
  
  let colorClass = '';
  
  if (accountType === 'credit_card') {
    // For credit cards: negative balance (less debt) is good, positive balance (more debt) is bad
    colorClass = amount < 0 ? 'text-green-600' : 'text-red-600';
  } else {
    // For other accounts: positive balance is good, negative is bad
    colorClass = amount >= 0 ? 'text-green-600' : 'text-red-600';
  }

  return { formatted, colorClass };
}

/**
 * Calculate total balance considering account types
 */
export function calculateTotalBalance(
  accounts: Array<{ current_balance: number; type: string }>
): number {
  return accounts.reduce((sum, account) => {
    // For credit cards, subtract the balance (debt) from total
    if (account.type === 'credit_card') {
      return sum - account.current_balance;
    }
    return sum + account.current_balance;
  }, 0);
}

/**
 * Get appropriate locale for currency
 */
export function getLocaleForCurrency(currency: string): string {
  const locales: Record<string, string> = {
    USD: 'en-US',
    EUR: 'de-DE',
    GBP: 'en-GB',
    IDR: 'id-ID',
    JPY: 'ja-JP',
    CNY: 'zh-CN',
    KRW: 'ko-KR',
    AUD: 'en-AU',
    CAD: 'en-CA',
  };

  return locales[currency] || 'en-US';
}