"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// interface UserSettings {
//   id: string;
//   currency_code: string;
//   financial_month_start_day: number;
//   financial_week_start_day: number;
//   onboarding_completed: boolean;
// }

const CURRENCIES = [
  { code: "USD", name: "US Dollar" },
  { code: "IDR", name: "Indonesian Rupiah" },
  { code: "EUR", name: "Euro" },
  { code: "GBP", name: "British Pound" },
  { code: "JPY", name: "Japanese Yen" },
  { code: "AUD", name: "Australian Dollar" },
  { code: "CAD", name: "Canadian Dollar" },
  { code: "SGD", name: "Singapore Dollar" },
];

const WEEKDAYS = [
  { value: 0, name: "Sunday" },
  { value: 1, name: "Monday" },
  { value: 2, name: "Tuesday" },
  { value: 3, name: "Wednesday" },
  { value: 4, name: "Thursday" },
  { value: 5, name: "Friday" },
  { value: 6, name: "Saturday" },
];

const WEEKEND_HANDLING_OPTIONS = [
  {
    value: "no_adjustment",
    name: "No changes",
  },
  {
    value: "move_to_friday",
    name: "Previous Friday",
  },
  {
    value: "move_to_monday",
    name: "Following Monday",
  },
];

export default function GeneralSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    currency_code: "IDR",
    financial_month_start_day: 1,
    financial_week_start_day: 1,
    weekend_end_handling: "no_adjustment" as const,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");

      const data = await response.json();
      setFormData({
        currency_code: data.data.currency_code,
        financial_month_start_day: data.data.financial_month_start_day,
        financial_week_start_day: data.data.financial_week_start_day,
        weekend_end_handling: data.data.weekend_end_handling || "no_adjustment",
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Currency Settings */}
      <div className="space-y-2">
        <Label htmlFor="currency">Primary Currency</Label>
        <Select
          value={formData.currency_code}
          onValueChange={(value) => handleInputChange("currency_code", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          This will be the default currency for all your financial data.
        </p>
      </div>

      {/* Financial Month Start Day */}
      <div className="space-y-2">
        <Label htmlFor="month-start">Financial Month Start Day</Label>
        <Select
          value={formData.financial_month_start_day.toString()}
          onValueChange={(value) =>
            handleInputChange("financial_month_start_day", parseInt(value))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
              <SelectItem key={day} value={day.toString()}>
                {day}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          Your financial month will start on this day each month.
        </p>
      </div>

      {/* Weekend End Period Handling */}
      <div className="space-y-2">
        <Label htmlFor="weekend-handling">Weekend End Period Handling</Label>
        <Select
          value={formData.weekend_end_handling}
          onValueChange={(value) =>
            handleInputChange("weekend_end_handling", value)
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select weekend handling" />
          </SelectTrigger>
          <SelectContent>
            {WEEKEND_HANDLING_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className="font-medium">{option.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          Choose how to handle financial period end dates that fall on weekends
          (Saturday or Sunday).
        </p>
      </div>

      {/* Financial Week Start Day */}
      <div className="space-y-2">
        <Label htmlFor="week-start">Financial Week Start Day</Label>
        <Select
          value={formData.financial_week_start_day.toString()}
          onValueChange={(value) =>
            handleInputChange("financial_week_start_day", parseInt(value))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select day" />
          </SelectTrigger>
          <SelectContent>
            {WEEKDAYS.map((day) => (
              <SelectItem key={day.value} value={day.value.toString()}>
                {day.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-gray-500">
          Your financial week will start on this day.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="min-w-[120px]"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
