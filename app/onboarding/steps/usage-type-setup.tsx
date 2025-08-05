"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { User, Users, Home, TrendingUp } from "lucide-react";

interface UsageTypeSetupStepProps {
  onNext: () => void;
  onPrevious: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

type UsageType = "personal" | "family";

export default function UsageTypeSetupStep({
  onNext,
  onPrevious,
  isFirstStep,
  // isLastStep,
}: UsageTypeSetupStepProps) {
  const [selectedType, setSelectedType] = useState<UsageType | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = async () => {
    if (!selectedType) return;

    try {
      setIsLoading(true);

      // Store the usage type in sessionStorage for use in other steps
      sessionStorage.setItem("onboardingType", selectedType);

      // Mark step 1 as completed
      const stepResponse = await fetch("/api/onboarding", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          step: 1,
          completed: true,
        }),
      });

      if (!stepResponse.ok) {
        const errorData = await stepResponse.json();
        throw new Error(errorData.message || "Failed to update step progress");
      }

      onNext();
    } catch (error) {
      console.error("Error saving usage type:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const usageOptions = [
    {
      id: "personal" as UsageType,
      title: "Personal Finance",
      description: "Manage your individual finances, budgets, and investments",
      icon: User,
      features: [
        "Track personal accounts",
        "Set individual budgets",
        "Monitor investments",
        "Analyze spending patterns",
      ],
    },
    {
      id: "family" as UsageType,
      title: "Family Finance",
      description: "Collaborate with family members on shared financial goals",
      icon: Users,
      features: [
        "Create and manage a family",
        "Invite family members",
        "Share joint accounts",
        "Collaborative budgeting",
      ],
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Home className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">How will you use Noka?</h2>
        <p className="mx-auto max-w-md text-gray-600">
          Choose how you'd like to manage your finances. You can always change this later in settings.
        </p>
      </div>

      {/* Usage Type Selection */}
      <div className="space-y-4">
        <RadioGroup
          value={selectedType || ""}
          onValueChange={(value) => setSelectedType(value as UsageType)}
        >
          <div className="grid gap-4 md:grid-cols-2">
            {usageOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedType === option.id;

              return (
                <div key={option.id} className="relative">
                  <RadioGroupItem
                    value={option.id}
                    id={option.id}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={option.id}
                    className={`
                      flex cursor-pointer rounded-lg border-2 p-6 transition-all
                      hover:border-blue-300 hover:bg-blue-50
                      peer-checked:border-blue-500 peer-checked:bg-blue-50
                      ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"}
                    `}
                  >
                    <Card className="w-full border-0 bg-transparent shadow-none">
                      <CardContent className="p-0">
                        <div className="space-y-4">
                          {/* Header */}
                          <div className="flex items-center gap-3">
                            <div
                              className={`
                                flex h-12 w-12 items-center justify-center rounded-full
                                ${isSelected ? "bg-blue-100" : "bg-gray-100"}
                              `}
                            >
                              <Icon
                                className={`h-6 w-6 ${isSelected ? "text-blue-600" : "text-gray-600"}`}
                              />
                            </div>
                            <div>
                              <h3
                                className={`
                                  text-lg font-semibold
                                  ${isSelected ? "text-blue-900" : "text-gray-900"}
                                `}
                              >
                                {option.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {option.description}
                              </p>
                            </div>
                          </div>

                          {/* Features */}
                          <div className="space-y-2">
                            {option.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2">
                                <TrendingUp
                                  className={`h-4 w-4 ${isSelected ? "text-blue-500" : "text-gray-400"}`}
                                />
                                <span className="text-sm text-gray-600">
                                  {feature}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Label>
                </div>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      {/* Info Box */}
      <Card className="border-dashed bg-gray-50">
        <CardContent className="p-4">
          <h4 className="mb-2 font-medium text-gray-900">
            Can I change this later?
          </h4>
          <p className="text-sm text-gray-600">
            Yes! You can switch between personal and family modes at any time in your settings. 
            If you choose personal now, you can create a family later to start collaborating with family members.
          </p>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-6">
        <Button
          variant="outline"
          onClick={onPrevious}
          disabled={isFirstStep || isLoading}
        >
          Previous
        </Button>
        <Button onClick={handleNext} disabled={!selectedType || isLoading}>
          {isLoading ? "Saving..." : "Continue"}
        </Button>
      </div>
    </div>
  );
}