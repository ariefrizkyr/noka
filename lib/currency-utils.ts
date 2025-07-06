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
    currency = 'IDR',
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
 * @param currency - Currency code (defaults to IDR)
 * @returns Formatted balance string
 */
export function formatAccountBalance(
  balance: number,
  accountType: string,
  currency: string = 'IDR'
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
  currency: string = 'IDR'
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
 * Format transaction amount with appropriate +/- signs
 * @param amount - Transaction amount
 * @param transactionType - Type of transaction (income, expense, transfer)
 * @param currency - Currency code
 * @returns Formatted amount with sign prefix
 */
export function formatTransactionAmount(
  amount: number,
  transactionType: 'income' | 'expense' | 'transfer',
  currency: string = 'IDR'
): string {
  const formatted = formatCurrency(amount, { currency });
  
  switch (transactionType) {
    case 'income':
      return `+${formatted}`;
    case 'expense':
      return `-${formatted}`;
    case 'transfer':
      return formatted; // No prefix for transfers
    default:
      return formatted;
  }
}

/**
 * Format currency for selector components with consistent display
 * @param amount - Amount to format
 * @param currency - Currency code
 * @param compact - Whether to use compact format for large numbers
 * @returns Formatted currency string
 */
export function formatCurrencyForSelector(
  amount: number,
  currency: string = 'IDR',
  compact: boolean = false
): string {
  if (compact && Math.abs(amount) >= 1000000) {
    // Format large numbers with K/M suffixes
    const formatter = new Intl.NumberFormat(getLocaleForCurrency(currency), {
      style: 'currency',
      currency,
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    });
    return formatter.format(amount);
  }
  
  return formatCurrency(amount, { currency });
}

/**
 * Format budget amount with frequency display
 * @param amount - Budget amount
 * @param frequency - Budget frequency
 * @param currency - Currency code
 * @returns Formatted budget string with frequency
 */
export function formatBudgetAmount(
  amount: number,
  frequency: 'weekly' | 'monthly' | 'one_time',
  currency: string = 'IDR'
): string {
  const formatted = formatCurrency(amount, { currency });
  const frequencyLabel = frequency === 'one_time' ? 'total' : frequency.replace('ly', '');
  return `${formatted}/${frequencyLabel}`;
}

/**
 * Format currency with transaction type styling
 * @param amount - Amount to format
 * @param transactionType - Type of transaction
 * @param currency - Currency code
 * @returns Object with formatted amount and CSS color class
 */
export function formatTransactionAmountWithStyle(
  amount: number,
  transactionType: 'income' | 'expense' | 'transfer',
  currency: string = 'IDR'
): { formatted: string; colorClass: string } {
  const formatted = formatTransactionAmount(amount, transactionType, currency);
  
  let colorClass = '';
  switch (transactionType) {
    case 'income':
      colorClass = 'text-green-600';
      break;
    case 'expense':
      colorClass = 'text-red-600';
      break;
    case 'transfer':
      colorClass = 'text-blue-600';
      break;
    default:
      colorClass = 'text-gray-600';
  }
  
  return { formatted, colorClass };
}

/**
 * Parse currency input string to number (for form inputs)
 * @param input - User input string
 * @returns Parsed number or 0 if invalid
 */
export function parseCurrencyInput(input: string): number {
  // Remove currency symbols, spaces, and commas
  const cleaned = input.replace(/[^\d.-]/g, '');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : Math.abs(parsed); // Always return positive for input
}

/**
 * Validate currency amount input
 * @param input - Input string to validate
 * @param min - Minimum allowed value
 * @param max - Maximum allowed value
 * @returns Validation result with error message if invalid
 */
export function validateCurrencyInput(
  input: string,
  min: number = 0.01,
  max: number = 999999999
): { isValid: boolean; error?: string; value?: number } {
  const value = parseCurrencyInput(input);
  
  if (value === 0 && input.trim() !== '' && input.trim() !== '0') {
    return { isValid: false, error: 'Please enter a valid amount' };
  }
  
  if (value < min) {
    return { isValid: false, error: `Amount must be at least ${formatCurrency(min)}` };
  }
  
  if (value > max) {
    return { isValid: false, error: `Amount cannot exceed ${formatCurrency(max)}` };
  }
  
  return { isValid: true, value };
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

  return locales[currency] || 'id-ID';
}