import React, { useState, useEffect } from 'react'
import { ChatBubbleLeftRightIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Fallback quotes for when we need them
const fallbackQuotes = [
  { text: "Started from the bottom now we here", artist: "Drake - Started From The Bottom" },
  { text: "I'm just trying to be better than I was yesterday", artist: "Drake - 0 To 100" },
  { text: "Life is good", artist: "Future & Drake - Life Is Good" },
  { text: "I got loyalty, got royalty inside my DNA", artist: "Kendrick Lamar - DNA." },
  { text: "Work hard, stay focused, my vision tunneled", artist: "Tyler, The Creator - CORSO" },
  { text: "Time is the most valuable currency", artist: "Dave - Twenty To One" }
]

interface Quote {
  text: string
  artist: string
}

export function MotivationalQuotes() {
  const [quote, setQuote] = useState<Quote>(() => {
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length)
    return fallbackQuotes[randomIndex]
  })

  // Get a random quote that's different from the current one
  const getRandomQuote = () => {
    const filteredQuotes = fallbackQuotes.filter(q => q.text !== quote.text)
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length)
    return filteredQuotes[randomIndex]
  }

  // Change quote with animation
  const changeQuote = () => {
    const newQuote = getRandomQuote()
    setQuote(newQuote)
  }

  return (
    <motion.div
      className={cn(
        "rounded-2xl bg-gradient-to-br",
        "from-blue-100/80 via-white to-blue-50/50",
        "dark:from-blue-500/10 dark:via-background dark:to-blue-900/5",
        "border border-blue-200/50 dark:border-blue-800/50",
        "transition-all duration-300",
        "shadow-sm hover:shadow-md dark:shadow-none",
        "hover:border-blue-300/50 dark:hover:border-blue-700/50",
        "p-6"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ChatBubbleLeftRightIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Daily Inspiration
            </h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={changeQuote}
            className="hover:bg-blue-100/50 dark:hover:bg-blue-900/50"
          >
            <ArrowPathIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </Button>
        </div>

        <motion.div
          key={quote.text}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-2"
        >
          <p className="text-sm italic text-zinc-600 dark:text-zinc-400">
            "{quote.text}"
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            {quote.artist}
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}
