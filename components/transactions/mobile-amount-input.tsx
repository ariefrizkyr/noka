"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getCurrencySymbol,
  formatInputWithThousandSeparators,
  parseInputToNumber,
} from "@/lib/currency-utils";

interface MobileAmountInputProps {
  currency?: string;
  onContinue: (amount: number) => void;
  initialAmount?: number;
}

export function MobileAmountInput({
  currency = "IDR",
  onContinue,
  initialAmount = 0,
}: MobileAmountInputProps) {
  const [displayValue, setDisplayValue] = useState("");
  const [numericValue, setNumericValue] = useState(0);

  const currencySymbol = getCurrencySymbol(currency);

  // Initialize with any existing amount
  useEffect(() => {
    if (initialAmount > 0) {
      const formatted = formatInputWithThousandSeparators(
        initialAmount.toString(),
        currency,
      );
      setDisplayValue(formatted);
      setNumericValue(initialAmount);
    }
  }, [initialAmount, currency]);

  // Calculate responsive font size based on display length
  const calculateFontSize = (value: string) => {
    const baseSize = 48; // 3rem
    const minSize = 24; // 1.5rem
    const maxLength = 15; // Approximate max chars before shrinking

    if (value.length <= maxLength) {
      return baseSize;
    }

    const reduction = Math.floor((value.length - maxLength) / 2) * 4;
    return Math.max(minSize, baseSize - reduction);
  };

  const fontSize = calculateFontSize(displayValue);

  const handleNumberInput = (digit: string) => {
    let newValue: string;

    if (digit === "." && displayValue.includes(".")) {
      return; // Prevent multiple decimal points
    }

    if (displayValue === "0" && digit !== ".") {
      newValue = digit;
    } else {
      newValue = displayValue + digit;
    }

    // Format with thousand separators
    const formatted = formatInputWithThousandSeparators(newValue, currency);
    const numeric = parseInputToNumber(formatted, currency);

    setDisplayValue(formatted);
    setNumericValue(numeric);
  };

  const handleBackspace = () => {
    if (displayValue.length <= 1) {
      setDisplayValue("");
      setNumericValue(0);
      return;
    }

    const newValue = displayValue.slice(0, -1);
    const formatted = formatInputWithThousandSeparators(newValue, currency);
    const numeric = parseInputToNumber(formatted, currency);

    setDisplayValue(formatted);
    setNumericValue(numeric);
  };

  const handleContinue = () => {
    if (numericValue > 0) {
      onContinue(numericValue);
    }
  };

  const isValidAmount = numericValue > 0;

  // Number pad buttons
  const numberButtons = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "⌫"],
  ];

  return (
    <div className="flex h-full flex-col bg-white rounded-t-lg">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="text-lg font-medium">Amount</h2>
      </div>

      {/* Amount Display */}
      <div className="flex flex-1 items-center justify-center px-6 py-8">
        <div className="text-center">
          <div
            className={cn(
              "font-bold text-gray-900 transition-all duration-200 ease-out",
              "leading-tight break-all",
            )}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: fontSize <= 32 ? "1.2" : "1.1",
            }}
          >
            {currencySymbol} {displayValue || "0"}
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="px-6 pb-2">
        <Button
          onClick={handleContinue}
          disabled={!isValidAmount}
          className="h-12 w-full text-base font-medium"
          size="lg"
        >
          Continue
        </Button>
      </div>

      {/* Number Pad */}
      <div className="bg-gray-50 px-4 pt-4 pb-6">
        <div className="grid grid-cols-3 gap-3">
          {numberButtons.flat().map((button, index) => {
            const isBackspace = button === "⌫";
            const isDecimal = button === ".";

            return (
              <Button
                key={index}
                variant="ghost"
                size="lg"
                className={cn(
                  "h-14 text-2xl font-medium transition-colors",
                  "hover:bg-gray-200 active:bg-gray-300",
                  "border border-gray-200 bg-white",
                  isBackspace && "hover:bg-red-50 active:bg-red-100",
                )}
                onClick={() => {
                  if (isBackspace) {
                    handleBackspace();
                  } else {
                    handleNumberInput(button);
                  }
                }}
                disabled={isDecimal && currency === "IDR"} // IDR doesn't use decimals
              >
                {button}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
