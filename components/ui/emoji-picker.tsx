'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Theme } from 'emoji-picker-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

// Dynamically import EmojiPicker for Next.js SSR compatibility
const EmojiPickerComponent = dynamic(
  () => import('emoji-picker-react'),
  { ssr: false }
)

interface EmojiPickerProps {
  value?: string
  onEmojiSelect: (emoji: string) => void
  placeholder?: string
  width?: number | string
  height?: number | string
  searchDisabled?: boolean
}

interface EmojiClickData {
  emoji: string
  unified: string
  names: string[]
  isCustom: boolean
}

export default function EmojiPicker({
  value,
  onEmojiSelect,
  placeholder = '😀',
  width = 320,
  height = 400,
  searchDisabled = false
}: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    // Extract just the emoji character from the rich emoji data
    onEmojiSelect(emojiData.emoji)
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
      <PopoverContent className="w-fit p-0" align="start">
        <div className="border rounded-lg overflow-hidden">
          <EmojiPickerComponent
            onEmojiClick={handleEmojiClick}
            width={width}
            height={height}
            searchDisabled={searchDisabled}
            previewConfig={{
              showPreview: false
            }}
            skinTonesDisabled={true}
            theme={Theme.LIGHT}
            lazyLoadEmojis={true}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}