"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import OnboardingLayout from "./components/onboarding-layout";
import UsageTypeSetupStep from "./steps/usage-type-setup";
import FamilySetupStep from "./steps/family-setup";
import SettingsSetupStep from "./steps/settings-setup";
import AccountSetupStep from "./steps/account-setup";
import CategorySetupStep from "./steps/category-setup";

// Helper function to get total steps based on onboarding type
const getTotalSteps = (onboardingType: string | null): number => {
  return onboardingType === "family" ? 5 : 4;
};

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStepDetection, setIsLoadingStepDetection] = useState(true);
  const [onboardingType, setOnboardingType] = useState<string | null>(null);
  const { user, isInitialized } = useAuth();
  const router = useRouter();

  // Check if user should be in onboarding and determine starting step
  useEffect(() => {
    async function checkOnboardingStatusAndStep() {
      if (!isInitialized) return;

      if (!user) {
        router.push("/auth/login");
        return;
      }

      try {
        // Get onboarding type from sessionStorage
        const storedOnboardingType = sessionStorage.getItem("onboardingType");
        setOnboardingType(storedOnboardingType);

        // Get onboarding progress from new API
        const onboardingResponse = await fetch("/api/onboarding");
        if (onboardingResponse.ok) {
          const onboardingResult = await onboardingResponse.json();

          // If onboarding is completed, redirect to dashboard
          if (onboardingResult.data?.onboarding_completed) {
            router.push("/dashboard");
            return;
          }

          // Use the next_step from the API response
          setCurrentStep(onboardingResult.data?.next_step || 1);
        } else {
          // If API fails, default to step 1
          setCurrentStep(1);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // On error, default to step 1
        setCurrentStep(1);
        setIsLoading(false);
      } finally {
        setIsLoadingStepDetection(false);
      }
    }

    checkOnboardingStatusAndStep();
  }, [user, isInitialized, router]);

  const handleNext = () => {
    // Update onboarding type from sessionStorage when moving from step 1
    if (currentStep === 1) {
      const storedType = sessionStorage.getItem("onboardingType");
      setOnboardingType(storedType);
      
      // Use the fresh stored type for total steps calculation
      const totalSteps = getTotalSteps(storedType);
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      const totalSteps = getTotalSteps(onboardingType);
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);

      // Mark onboarding as completed
      const response = await fetch("/api/onboarding", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to complete onboarding");
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setIsLoading(false);
    }
  };

  if (isLoading || !isInitialized || isLoadingStepDetection) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const renderStep = () => {

    // Personal flow: Usage (1) → Settings (2) → Account (3) → Category (4)
    // Family flow:   Usage (1) → Family (2) → Settings (3) → Account (4) → Category (5)

    if (currentStep === 1) {
      // Step 1: Usage Type Selection (always first)
      return (
        <UsageTypeSetupStep
          onNext={handleNext}
          onPrevious={handlePrevious}
          isFirstStep={true}
          isLastStep={false}
        />
      );
    }

    if (onboardingType === "family") {
      // Family flow
      switch (currentStep) {
        case 2:
          return (
            <FamilySetupStep
              onNext={handleNext}
              onPrevious={handlePrevious}
              isFirstStep={false}
              isLastStep={false}
            />
          );
        case 3:
          return (
            <SettingsSetupStep
              onNext={handleNext}
              onPrevious={handlePrevious}
              isFirstStep={false}
              isLastStep={false}
            />
          );
        case 4:
          return (
            <AccountSetupStep
              onNext={handleNext}
              onPrevious={handlePrevious}
              isFirstStep={false}
              isLastStep={false}
            />
          );
        case 5:
          return (
            <CategorySetupStep
              onNext={handleComplete}
              onPrevious={handlePrevious}
              isFirstStep={false}
              isLastStep={true}
            />
          );
        default:
          return null;
      }
    } else {
      // Personal flow (or fallback)
      switch (currentStep) {
        case 2:
          return (
            <SettingsSetupStep
              onNext={handleNext}
              onPrevious={handlePrevious}
              isFirstStep={false}
              isLastStep={false}
            />
          );
        case 3:
          return (
            <AccountSetupStep
              onNext={handleNext}
              onPrevious={handlePrevious}
              isFirstStep={false}
              isLastStep={false}
            />
          );
        case 4:
          return (
            <CategorySetupStep
              onNext={handleComplete}
              onPrevious={handlePrevious}
              isFirstStep={false}
              isLastStep={true}
            />
          );
        default:
          return null;
      }
    }
  };

  return (
    <OnboardingLayout 
      currentStep={currentStep} 
      totalSteps={getTotalSteps(onboardingType)}
      onboardingType={onboardingType}
    >
      {renderStep()}
    </OnboardingLayout>
  );
}
