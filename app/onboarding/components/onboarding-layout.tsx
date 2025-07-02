'use client'

import React from 'react'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'

interface OnboardingLayoutProps {
  children: React.ReactNode
  currentStep: number
  totalSteps: number
}

export default function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
}: OnboardingLayoutProps) {
  const progressPercentage = (currentStep / totalSteps) * 100

  const stepTitles = [
    'Settings Setup',
    'Account Setup',
    'Categories & Goals'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with Logo and Progress */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Noka
          </h1>
          <p className="text-gray-600 mb-6">
            Let's set up your personal finance tracker
          </p>
          
          {/* Progress Indicator */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Step {currentStep} of {totalSteps}</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            
            {/* Step Labels */}
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              {stepTitles.map((title, index) => (
                <span
                  key={index}
                  className={`
                    ${index + 1 === currentStep ? 'text-blue-600 font-medium' : ''}
                    ${index + 1 < currentStep ? 'text-green-600' : ''}
                  `}
                >
                  {title}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            {children}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            This setup will only take a few minutes and can be changed later in settings.
          </p>
        </div>
      </div>
    </div>
  )
}