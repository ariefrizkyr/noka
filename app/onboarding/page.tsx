"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import OnboardingLayout from "./components/onboarding-layout";
import UsageTypeSetupStep from "./steps/usage-type-setup";
import FamilySetupStep from "./steps/family-setup";
import SettingsSetupStep from "./steps/settings-setup";
import AccountSetupStep from "./steps/account-setup";
import CategorySetupStep from "./steps/category-setup";

// Helper function to get total steps based on onboarding type and invitation context
const getTotalSteps = (onboardingType: string | null, hasInvitationContext: boolean = false): number => {
  if (hasInvitationContext) {
    return 4; // Skip preference step: Family confirmation + Settings + Account + Category
  }
  return onboardingType === "family" ? 5 : 4;
};

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingStepDetection, setIsLoadingStepDetection] = useState(true);
  const [onboardingType, setOnboardingType] = useState<string | null>(null);
  const [hasInvitationContext, setHasInvitationContext] = useState(false);
  const { user, isInitialized } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  // Check if user should be in onboarding and determine starting step
  useEffect(() => {
    async function checkOnboardingStatusAndStep() {
      if (!isInitialized) return;

      if (!user) {
        router.push("/auth/login");
        return;
      }

      // Check for invitation context
      const acceptedFamilyId = sessionStorage.getItem("acceptedFamilyId");
      const hasInvitation = !!acceptedFamilyId;
      setHasInvitationContext(hasInvitation);

      try {

        // Get onboarding type from sessionStorage or set to family if invitation context
        const storedOnboardingType = sessionStorage.getItem("onboardingType");
        if (hasInvitation && !storedOnboardingType) {
          sessionStorage.setItem("onboardingType", "family");
          setOnboardingType("family");
        } else {
          setOnboardingType(storedOnboardingType);
        }

        // Get onboarding progress from new API
        const onboardingResponse = await fetch("/api/onboarding");
        if (onboardingResponse.ok) {
          const onboardingResult = await onboardingResponse.json();

          // If onboarding is completed, redirect to target URL or dashboard
          if (onboardingResult.data?.onboarding_completed) {
            const targetUrl = redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//') 
              ? redirectUrl 
              : "/dashboard";
            router.push(targetUrl);
            return;
          }

          // Use the next_step from the API response, but skip step 1 for invited users
          const nextStep = onboardingResult.data?.next_step || 1;
          setCurrentStep(hasInvitation && nextStep === 1 ? 2 : nextStep);
        } else {
          // If API fails, default to step 1 or step 2 for invited users
          setCurrentStep(hasInvitation ? 2 : 1);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // On error, default to step 1 or step 2 for invited users
        setCurrentStep(hasInvitation ? 2 : 1);
        setIsLoading(false);
      } finally {
        setIsLoadingStepDetection(false);
      }
    }

    checkOnboardingStatusAndStep();
  }, [user, isInitialized, router, redirectUrl]);

  const handleNext = () => {
    // Update onboarding type from sessionStorage when moving from step 1
    if (currentStep === 1) {
      const storedType = sessionStorage.getItem("onboardingType");
      setOnboardingType(storedType);
      
      // Use the fresh stored type for total steps calculation
      const totalSteps = getTotalSteps(storedType, hasInvitationContext);
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      const totalSteps = getTotalSteps(onboardingType, hasInvitationContext);
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    // For invited users, don't allow going back to step 1 (preference selection)
    const minStep = hasInvitationContext ? 2 : 1;
    if (currentStep > minStep) {
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

      // Clear invitation context after successful onboarding completion
      sessionStorage.removeItem("acceptedFamilyId");
      sessionStorage.removeItem("acceptedFamilyName");

      // Redirect to target URL or dashboard
      const targetUrl = redirectUrl && redirectUrl.startsWith('/') && !redirectUrl.startsWith('//') 
        ? redirectUrl 
        : "/dashboard";
      router.push(targetUrl);
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
    // Invited flow:  Family (2) → Settings (3) → Account (4) → Category (5) - Skip Usage step

    if (currentStep === 1 && !hasInvitationContext) {
      // Step 1: Usage Type Selection (only for non-invited users)
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
              isFirstStep={hasInvitationContext}
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
      totalSteps={getTotalSteps(onboardingType, hasInvitationContext)}
      onboardingType={onboardingType}
    >
      {renderStep()}
    </OnboardingLayout>
  );
}
