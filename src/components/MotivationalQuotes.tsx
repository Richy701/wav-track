import { useState, useEffect } from 'react'
import { Quote, Sparkles, Music, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getRandomMusicQuote } from '@/lib/services/geniusApi'

// Fallback quotes for when Genius API fails
const fallbackQuotes = [
  {
    text: 'The music is not in the notes, but in the silence between.',
    author: 'Wolfgang Amadeus Mozart',
  },
  {
    text: 'Your music is a reflection of your soul. Make it beautiful.',
    author: 'Unknown',
  },
  {
    text: 'Music gives a soul to the universe, wings to the mind, flight to the imagination.',
    author: 'Plato',
  },
  {
    text: 'One good thing about music, when it hits you, you feel no pain.',
    author: 'Bob Marley',
  },
  {
    text: 'Without music, life would be a mistake.',
    author: 'Friedrich Nietzsche',
  },
  {
    text: 'Music is the strongest form of magic.',
    author: 'Marilyn Manson',
  },
  {
    text: 'The only truth is music.',
    author: 'Jack Kerouac',
  },
  {
    text: "If you're not doing what you love, you're wasting your time.",
    author: 'Billy Joel',
  },
  {
    text: 'Music is a higher revelation than all wisdom and philosophy.',
    author: 'Ludwig van Beethoven',
  },
  {
    text: 'The more you create, the more creative you become.',
    author: 'Unknown',
  },
  {
    text: 'If it sounds good, it is good.',
    author: 'Duke Ellington',
  },
  {
    text: 'Trust your ear. If something sounds good to you, it is good.',
    author: 'Rick Rubin',
  },
]

interface Quote {
  text: string
  author: string
  source?: string
}

export function MotivationalQuotes() {
  const [quote, setQuote] = useState<Quote>(() => {
    // Set initial quote from fallback list
    const randomIndex = Math.floor(Math.random() * fallbackQuotes.length)
    return fallbackQuotes[randomIndex]
  })
  const [fadeIn, setFadeIn] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usedFallback, setUsedFallback] = useState(true) // Start with fallback true

  // Get a random fallback quote that's different from the current one
  const getRandomFallbackQuote = () => {
    const filteredQuotes = fallbackQuotes.filter(q => q.text !== quote.text)
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length)
    return filteredQuotes[randomIndex]
  }

  // Initialize with a random quote
  useEffect(() => {
    console.log('MotivationalQuotes mounted')
    fetchNewQuote()
  }, [])

  // Fetch a new quote from Genius API or fallback to local quotes
  const fetchNewQuote = async () => {
    console.log('fetchNewQuote started')
    setIsLoading(true)
    setError(null)

    try {
      console.log('Attempting to fetch quote from Genius API...')
      const newQuote = await getRandomMusicQuote()
      console.log('Successfully fetched quote from Genius:', newQuote)
      setQuote(newQuote)
      setUsedFallback(false)
    } catch (error) {
      console.error('Failed to fetch quote from Genius:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      setError(`Genius API Error: ${errorMessage}`)
      
      // Use fallback quote
      console.log('Using fallback quote')
      const fallbackQuote = getRandomFallbackQuote()
      console.log('Selected fallback quote:', fallbackQuote)
      setQuote(fallbackQuote)
      setUsedFallback(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Change quote with animation
  const changeQuote = () => {
    console.log('changeQuote clicked')
    setFadeIn(false)
    setTimeout(() => {
      fetchNewQuote()
      setFadeIn(true)
    }, 300)
  }

  // Debug render
  console.log('Rendering MotivationalQuotes with state:', {
    quote,
    isLoading,
    error,
    usedFallback,
    fadeIn
  })

  return (
    <div className="bg-card rounded-lg p-3 relative overflow-hidden group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm">Daily Inspiration</h3>
          {usedFallback && (
            <span className="text-xs text-yellow-500 flex items-center gap-1">
              <AlertCircle size={12} />
              Using backup quotes
            </span>
          )}
        </div>
        <button
          onClick={changeQuote}
          className={cn(
            "text-primary hover:text-primary/80 transition-colors",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
          title={isLoading ? "Loading..." : "Get new quote"}
          disabled={isLoading}
        >
          <Sparkles size={14} className={cn('transition-transform', isLoading && 'animate-spin')} />
        </button>
      </div>

      <div className={cn('transition-opacity duration-300', fadeIn ? 'opacity-100' : 'opacity-0')}>
        {quote.text ? (
          <>
            <div className="flex items-center gap-2 mb-1">
              {quote.source ? (
                <Music className="h-4 w-4 text-primary/70" />
              ) : (
                <Quote className="h-4 w-4 text-primary/70" />
              )}
              <p className="text-base leading-relaxed italic font-medium">{quote.text}</p>
            </div>
            <div className="text-xs text-muted-foreground ml-6">
              — {quote.author}
              {quote.source && (
                <span className="ml-1 text-primary/70">
                  • {quote.source}
                </span>
              )}
            </div>
          </>
        ) : (
          <div className="text-muted-foreground text-sm">Loading quote...</div>
        )}
        {error && (
          <div className="mt-2 text-xs text-red-500 flex items-center gap-1">
            <AlertCircle size={12} />
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
