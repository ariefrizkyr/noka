'use client';

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getCurrencySymbol, formatInputWithThousandSeparators, parseInputToNumber, getCurrencyDecimalPrecision } from "@/lib/currency-utils";

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, "type" | "value" | "onChange"> {
  currency?: string;
  value?: string | number;
  onChange?: (value: string, numericValue: number) => void;
  className?: string;
}

/**
 * Enhanced currency input component with:
 * - Currency symbol prepend
 * - Real-time thousand separator formatting
 * - Proper cursor positioning
 * - Support for all currencies
 */
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ currency = 'IDR', value = '', onChange, className, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');
    const [cursorPosition, setCursorPosition] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement>(null);
    
    // Combine refs properly
    React.useImperativeHandle(ref, () => inputRef.current!, []);

    // Use utility functions for consistency with currency support
    const formatWithThousandSeparators = React.useCallback((value: string) => formatInputWithThousandSeparators(value, currency), [currency]);
    const parseNumericValue = React.useCallback((input: string) => parseInputToNumber(input, currency), [currency]);
    const decimalPrecision = getCurrencyDecimalPrecision(currency);

    // Initialize display value from prop
    React.useEffect(() => {
      if (value !== undefined) {
        const numericValue = typeof value === 'number' ? value : parseNumericValue(value.toString());
        setDisplayValue(numericValue > 0 ? formatWithThousandSeparators(numericValue.toString()) : '');
      }
    }, [value, currency, formatWithThousandSeparators, parseNumericValue]);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const cursorPos = e.target.selectionStart || 0;
      
      // Sanitize input based on currency decimal precision
      let sanitized: string;
      if (decimalPrecision === 0) {
        // For currencies without decimals, only allow digits and commas
        sanitized = inputValue.replace(/[^\d,]/g, '');
      } else {
        // For currencies with decimals, allow digits, commas, and one decimal point
        sanitized = inputValue.replace(/[^\d,.]/g, '');
        
        // Ensure only one decimal point
        const parts = sanitized.split('.');
        if (parts.length > 2) {
          sanitized = parts[0] + '.' + parts.slice(1).join('');
        }
      }
      
      // Count commas and decimal points before cursor for position adjustment
      const commasBefore = (inputValue.slice(0, cursorPos).match(/,/g) || []).length;
      const decimalsBefore = (inputValue.slice(0, cursorPos).match(/\./g) || []).length;
      
      // Format the sanitized input
      const formatted = formatWithThousandSeparators(sanitized);
      
      // Calculate new cursor position
      const newCommasBefore = (formatted.slice(0, cursorPos).match(/,/g) || []).length;
      const newDecimalsBefore = (formatted.slice(0, cursorPos).match(/\./g) || []).length;
      const positionDiff = (newCommasBefore - commasBefore) + (newDecimalsBefore - decimalsBefore);
      
      setDisplayValue(formatted);
      setCursorPosition(cursorPos + positionDiff);
      
      // Call onChange with both formatted and numeric values
      const numericValue = parseNumericValue(formatted);
      onChange?.(formatted, numericValue);
    };

    // Handle cursor position after formatting
    React.useEffect(() => {
      if (inputRef.current && document.activeElement === inputRef.current) {
        inputRef.current.setSelectionRange(cursorPosition, cursorPosition);
      }
    }, [displayValue, cursorPosition]);

    // Handle focus to position cursor at end
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Position cursor at end when focusing
      setTimeout(() => {
        const length = e.target.value.length;
        e.target.setSelectionRange(length, length);
      }, 0);
    };

    const currencySymbol = getCurrencySymbol(currency);

    return (
      <div className={cn("relative", className)}>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-muted-foreground text-sm font-medium">
            {currencySymbol}
          </span>
        </div>
        <Input
          ref={inputRef}
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          className="pl-12"
          inputMode="numeric"
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";