import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, Tag, Clock, Target, Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import type { GoalSuggestion } from '@/hooks/use-ai-assistant'

interface AISuggestionsProps {
  suggestions: GoalSuggestion[]
  isLoading: boolean
  onSuggestionSelect: (suggestion: GoalSuggestion) => void
  onGenerateClick: () => void
  className?: string
}

export function AISuggestions({
  suggestions,
  isLoading,
  onSuggestionSelect,
  onGenerateClick,
  className,
}: AISuggestionsProps) {
  return (
    <div className={cn('relative', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute right-3 top-1/2 -translate-y-1/2',
              'text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300',
              'hover:bg-orange-100/80 dark:hover:bg-orange-500/10',
              'duration-200'
            )}
          >
            <Sparkles className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            'w-96 p-4',
            'bg-white/95 dark:bg-zinc-900/95',
            'border border-orange-200/80 dark:border-orange-500/20',
            'backdrop-blur-xl',
            'rounded-xl',
            'shadow-lg dark:shadow-orange-500/10'
          )}
          align="end"
          sideOffset={5}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-orange-900 dark:text-orange-100">
                Need help phrasing your goal?
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={onGenerateClick}
                disabled={isLoading}
                className={cn(
                  'text-xs text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300',
                  'hover:bg-orange-100/80 dark:hover:bg-orange-500/10'
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-3 w-3 mr-1" />
                    Generate
                  </>
                )}
              </Button>
            </div>

            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-4"
                >
                  <Loader2 className="h-5 w-5 animate-spin text-orange-500 dark:text-orange-400" />
                </motion.div>
              ) : suggestions.length > 0 ? (
                <motion.div
                  key="suggestions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="space-y-2"
                >
                  {suggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => onSuggestionSelect(suggestion)}
                      className={cn(
                        'w-full text-left p-3 rounded-xl',
                        'bg-orange-50/80 dark:bg-orange-500/10',
                        'border border-orange-200/50 dark:border-orange-500/20',
                        'hover:bg-orange-100/80 dark:hover:bg-orange-500/20',
                        'hover:border-orange-300/50 dark:hover:border-orange-500/30',
                        'duration-200'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-orange-900 dark:text-orange-100">
                            {suggestion.title}
                          </div>
                          <div className="text-xs text-orange-600/70 dark:text-orange-400/70">
                            {suggestion.description}
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            'ml-2',
                            suggestion.priority === 'high' && 'border-orange-500/20 text-orange-600 dark:border-orange-500/30 dark:text-orange-400',
                            suggestion.priority === 'medium' && 'border-orange-400/20 text-orange-500 dark:border-orange-400/30 dark:text-orange-300',
                            suggestion.priority === 'low' && 'border-orange-300/20 text-orange-400 dark:border-orange-300/30 dark:text-orange-200'
                          )}
                        >
                          {suggestion.priority}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 text-xs text-orange-500/70 dark:text-orange-400/70">
                          <Clock className="h-3 w-3" />
                          {suggestion.duration} min
                        </div>
                        <div className="flex items-center gap-1 text-xs text-orange-500/70 dark:text-orange-400/70">
                          <Target className="h-3 w-3" />
                          {suggestion.difficulty}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-orange-500/70 dark:text-orange-400/70">
                          <Music className="h-3 w-3" />
                          {suggestion.category}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        {suggestion.tags.map((tag, tagIndex) => (
                          <Badge
                            key={tagIndex}
                            variant="secondary"
                            className="text-xs bg-orange-100/50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-200/50 dark:border-orange-500/20"
                          >
                            <Tag className="h-2.5 w-2.5 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </motion.button>
                  ))}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 