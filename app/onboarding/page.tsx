'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { UserSettings } from '@/types/common'
import OnboardingLayout from './components/onboarding-layout'
import SettingsSetupStep from './steps/settings-setup'
import AccountSetupStep from './steps/account-setup'
import CategorySetupStep from './steps/category-setup'

const TOTAL_STEPS = 3

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingStepDetection, setIsLoadingStepDetection] = useState(true)
  const { user, isInitialized } = useAuth()
  const router = useRouter()

  // Check if user should be in onboarding and determine starting step
  useEffect(() => {
    async function checkOnboardingStatusAndStep() {
      if (!isInitialized) return
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      try {
        // Check if onboarding is completed first
        const settingsResponse = await fetch('/api/settings')
        if (settingsResponse.ok) {
          const settingsResult = await settingsResponse.json()
          
          // If onboarding is completed, redirect to dashboard
          if (settingsResult.data?.onboarding_completed) {
            router.push('/dashboard')
            return
          }

          // Determine starting step based on completion status
          const startingStep = await determineStartingStep(settingsResult.data)
          setCurrentStep(startingStep)
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error checking onboarding status:', error)
        setIsLoading(false)
      } finally {
        setIsLoadingStepDetection(false)
      }
    }

    checkOnboardingStatusAndStep()
  }, [user, isInitialized, router])

  // Determine which step user should start from
  const determineStartingStep = async (settings: UserSettings | null) => {
    try {
      // Step 1: Settings (currency + financial periods)
      if (!settings) {
        return 1
      }

      // Step 2: Accounts
      const accountsResponse = await fetch('/api/accounts')
      if (accountsResponse.ok) {
        const accountsResult = await accountsResponse.json()
        if (!accountsResult.data?.accounts?.length) {
          return 2
        }
      } else {
        return 2
      }

      // Step 3: Categories
      const categoriesResponse = await fetch('/api/categories')
      if (categoriesResponse.ok) {
        const categoriesResult = await categoriesResponse.json()
        if (!categoriesResult.data?.categories?.length) {
          return 3
        }
      } else {
        return 3
      }

      // All steps completed, should not reach here
      return 1
    } catch (error) {
      console.error('Error determining starting step:', error)
      return 1
    }
  }

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    try {
      setIsLoading(true)
      
      // Mark onboarding as completed
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          onboarding_completed: true,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to complete onboarding')
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setIsLoading(false)
    }
  }

  if (isLoading || !isInitialized || isLoadingStepDetection) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <SettingsSetupStep
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirstStep={true}
            isLastStep={false}
          />
        )
      case 2:
        return (
          <AccountSetupStep
            onNext={handleNext}
            onPrevious={handlePrevious}
            isFirstStep={false}
            isLastStep={false}
          />
        )
      case 3:
        return (
          <CategorySetupStep
            onNext={handleComplete}
            onPrevious={handlePrevious}
            isFirstStep={false}
            isLastStep={true}
          />
        )
      default:
        return null
    }
  }

  return (
    <OnboardingLayout
      currentStep={currentStep}
      totalSteps={TOTAL_STEPS}
    >
      {renderStep()}
    </OnboardingLayout>
  )
}