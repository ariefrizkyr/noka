'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Smile } from 'lucide-react'

interface EmojiPickerProps {
  value?: string
  onEmojiSelect: (emoji: string) => void
  placeholder?: string
}

const emojiCategories = {
  expense: [
    '🍔', '🛒', '⛽', '🏠', '🚗', '👕', '💊', '📱', '🎬', '🎮',
    '☕', '🍕', '🛍️', '🚇', '✈️', '🏥', '💳', '🎯', '📚', '🍻'
  ],
  income: [
    '💰', '💵', '🏦', '💼', '🎯', '📈', '💎', '🏆', '⭐', '🎁',
    '💸', '🤝', '📊', '🏅', '💪', '🚀', '⚡', '🔥', '✨', '🎪'
  ],
  investment: [
    '📈', '💎', '🏆', '🚀', '⭐', '💪', '🎯', '🔥', '💰', '📊',
    '🏅', '⚡', '✨', '🎪', '🌟', '💫', '🎊', '🎉', '🏦', '💼'
  ]
}

const allEmojis = [
  ...emojiCategories.expense,
  ...emojiCategories.income,
  ...emojiCategories.investment
].filter((emoji, index, arr) => arr.indexOf(emoji) === index) // Remove duplicates

export default function EmojiPicker({
  value,
  onEmojiSelect,
  placeholder = '😀'
}: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-10 h-10 p-0 text-lg"
        >
          {value || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Smile className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Choose an emoji</span>
          </div>
          
          <div className="grid grid-cols-8 gap-1">
            {allEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiClick(emoji)}
                className="w-8 h-8 text-lg hover:bg-gray-100 rounded-md flex items-center justify-center transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}