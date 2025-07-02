'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Coins, DollarSign, Euro, PoundSterling, Calendar, Clock } from 'lucide-react'

interface SettingsSetupStepProps {
  onNext: () => void
  onPrevious: () => void
  isFirstStep: boolean
  isLastStep: boolean
}

const currencies = [
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', icon: Coins },
  { code: 'USD', name: 'US Dollar', symbol: '$', icon: DollarSign },
  { code: 'EUR', name: 'Euro', symbol: '€', icon: Euro },
  { code: 'GBP', name: 'British Pound', symbol: '£', icon: PoundSterling },
]

const monthStartDays = Array.from({ length: 31 }, (_, i) => i + 1)

const weekStartDays = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
]

export default function SettingsSetupStep({
  onNext,
  onPrevious,
  isFirstStep,
  isLastStep,
}: SettingsSetupStepProps) {
  const [selectedCurrency, setSelectedCurrency] = useState('IDR')
  const [monthStartDay, setMonthStartDay] = useState<number>(1)
  const [weekStartDay, setWeekStartDay] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const { user } = useAuth()

  // Load existing settings if available
  useEffect(() => {
    async function loadSettings() {
      if (!user) return
      
      try {
        const response = await fetch('/api/settings')
        if (response.ok) {
          const result = await response.json()
          if (result.data) {
            setSelectedCurrency(result.data.currency_code || 'IDR')
            setMonthStartDay(result.data.financial_month_start_day || 1)
            setWeekStartDay(result.data.financial_week_start_day || 1)
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setIsLoadingData(false)
      }
    }

    loadSettings()
  }, [user])

  const handleNext = async () => {
    if (!selectedCurrency) return

    try {
      setIsLoading(true)

      // Save all settings via API
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currency_code: selectedCurrency,
          financial_month_start_day: monthStartDay,
          financial_week_start_day: weekStartDay,
          onboarding_completed: false,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to save settings')
      }

      onNext()
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getExampleMonthRange = () => {
    const now = new Date()
    const currentDay = now.getDate()
    
    let startDate: Date
    if (currentDay >= monthStartDay) {
      // Current month period
      startDate = new Date(now.getFullYear(), now.getMonth(), monthStartDay)
    } else {
      // Previous month period
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, monthStartDay)
    }
    
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, monthStartDay - 1)
    
    return {
      start: startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      end: endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const getExampleWeekRange = () => {
    const now = new Date()
    const currentDayOfWeek = now.getDay()
    const daysToSubtract = (currentDayOfWeek - weekStartDay + 7) % 7
    
    const startDate = new Date(now)
    startDate.setDate(now.getDate() - daysToSubtract)
    
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    
    return {
      start: startDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      end: endDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    }
  }

  const selectedCurrencyInfo = currencies.find(c => c.code === selectedCurrency)
  const monthRange = getExampleMonthRange()
  const weekRange = getExampleWeekRange()

  if (isLoadingData) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
          <Coins className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome to Noka!
        </h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Let's set up your preferences to personalize your financial tracking experience.
        </p>
      </div>

      {/* Currency Selection */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Currency Settings</h3>
        
        <div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">
              Primary Currency
            </span>
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose your currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => {
                  const Icon = currency.icon
                  return (
                    <SelectItem key={currency.code} value={currency.code}>
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4" />
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{currency.symbol}</span>
                          <span>{currency.name}</span>
                          <span className="text-gray-500">({currency.code})</span>
                        </div>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </label>
        </div>

        {/* Currency Preview */}
        {selectedCurrencyInfo && (
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <selectedCurrencyInfo.icon className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {selectedCurrencyInfo.name} ({selectedCurrencyInfo.code})
                  </p>
                  <p className="text-sm text-gray-600">
                    Amounts will be displayed as: {selectedCurrencyInfo.symbol}1,000.00
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Financial Periods */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Financial Periods</h3>
        <p className="text-sm text-gray-600">
          Customize when your financial month and week start to match your salary cycle or preferences.
        </p>

        {/* Financial Month Setup */}
        <div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">
              Financial Month Start Day
            </span>
            <Select value={monthStartDay.toString()} onValueChange={(value) => setMonthStartDay(parseInt(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select day of month" />
              </SelectTrigger>
              <SelectContent className="max-h-40">
                {monthStartDays.map((day) => (
                  <SelectItem key={day} value={day.toString()}>
                    {day}{day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th'} of the month
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <Card className="bg-blue-50 border-blue-200 mt-2">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <p className="text-sm text-blue-700">
                  Your current financial month: <strong>{monthRange.start} - {monthRange.end}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Week Setup */}
        <div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">
              Financial Week Start Day
            </span>
            <Select value={weekStartDay.toString()} onValueChange={(value) => setWeekStartDay(parseInt(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select day of week" />
              </SelectTrigger>
              <SelectContent>
                {weekStartDays.map((day) => (
                  <SelectItem key={day.value} value={day.value.toString()}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <Card className="bg-green-50 border-green-200 mt-2">
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <p className="text-sm text-green-700">
                  Your current financial week: <strong>{weekRange.start} - {weekRange.end}</strong>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Box */}
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="p-4">
          <h4 className="font-medium text-gray-900 mb-2">Why customize these settings?</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Display amounts in your preferred currency throughout the app</li>
            <li>• Track monthly budgets aligned with your salary date</li>
            <li>• Monitor weekly spending from your preferred start day</li>
            <li>• Get more accurate financial insights and reports</li>
          </ul>
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
        <Button
          onClick={handleNext}
          disabled={!selectedCurrency || isLoading}
        >
          {isLoading ? 'Saving...' : 'Continue'}
        </Button>
      </div>
    </div>
  )
}