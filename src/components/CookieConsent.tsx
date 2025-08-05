import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, ShieldCheckIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { useCookieConsent } from '@/hooks/useCookieConsent'
import CookieConsentDialog from './CookieConsentDialog'

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { theme } = useTheme()
  const { 
    hasConsented, 
    acceptAll, 
    declineAll, 
    updatePreferences,
    consentState 
  } = useCookieConsent()

  useEffect(() => {
    // Show consent banner if user hasn't made a choice yet
    if (!hasConsented) {
      // Show after a short delay to not be intrusive
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [hasConsented])

  const handleAccept = () => {
    acceptAll()
    setIsVisible(false)
  }

  const handleDecline = () => {
    declineAll()
    setIsVisible(false)
  }

  const handleCustomize = () => {
    setIsDialogOpen(true)
  }

  const handleSavePreferences = (preferences: any) => {
    updatePreferences(preferences)
    setIsVisible(false)
  }

  const handleClose = () => {
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <>
      <AnimatePresence>
        {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 25,
            duration: 0.2 
          }}
          className={cn(
            "fixed bottom-0 left-0 right-0 z-50",
            "sm:bottom-4 sm:left-4 sm:right-4 sm:max-w-md sm:mx-auto"
          )}
        >
          <div className={cn(
            "relative overflow-hidden",
            "rounded-t-2xl sm:rounded-2xl",
            "bg-white/98 dark:bg-zinc-900/98",
            "backdrop-blur-xl border-t sm:border",
            "border-zinc-200/80 dark:border-zinc-800/80",
            "shadow-2xl",
            "p-4 sm:p-5"
          )}>
            {/* Close button - hidden on mobile, visible on desktop */}
            <button
              onClick={handleClose}
              className={cn(
                "hidden sm:block absolute top-3 right-3 z-10",
                "p-1.5 rounded-full transition-all duration-200",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                "text-zinc-400 dark:text-zinc-500",
                "hover:text-zinc-600 dark:hover:text-zinc-300"
              )}
              aria-label="Close cookie consent"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>

            {/* Content */}
            <div className="relative">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className={cn(
                  "flex-shrink-0 p-2 rounded-xl",
                  "bg-violet-100 dark:bg-violet-900/40",
                  "text-violet-600 dark:text-violet-400"
                )}>
                  <ShieldCheckIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0 pr-6 sm:pr-0">
                  <h3 className={cn(
                    "text-base font-semibold mb-1",
                    "text-zinc-900 dark:text-zinc-100"
                  )}>
                    Cookie Preferences
                  </h3>
                  <p className={cn(
                    "text-sm leading-relaxed",
                    "text-zinc-600 dark:text-zinc-400"
                  )}>
                    We use cookies to improve your experience and analyze usage. 
                    <button 
                      onClick={handleCustomize}
                      className="text-violet-600 dark:text-violet-400 hover:underline ml-1"
                    >
                      Learn more
                    </button>
                  </p>
                </div>
              </div>

              {/* Cookie types - simplified for mobile */}
              <div className="hidden sm:flex gap-2 mb-4">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  <span className="text-xs font-medium">Essential</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-xs font-medium">Analytics</span>
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span className="text-xs font-medium">Marketing</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-2">
                <Button
                  onClick={handleDecline}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "flex-1 sm:flex-none h-9",
                    "text-zinc-600 dark:text-zinc-400",
                    "hover:text-zinc-800 dark:hover:text-zinc-200",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    "transition-all duration-200"
                  )}
                >
                  Decline
                </Button>
                
                <Button
                  onClick={handleCustomize}
                  variant="outline"
                  size="sm"
                  className={cn(
                    "flex-1 sm:flex-none h-9",
                    "border-zinc-300 dark:border-zinc-600",
                    "text-zinc-700 dark:text-zinc-300",
                    "hover:bg-zinc-50 dark:hover:bg-zinc-800",
                    "transition-all duration-200"
                  )}
                >
                  <Cog6ToothIcon className="w-4 h-4 mr-1.5" />
                  Settings
                </Button>
                
                <Button
                  onClick={handleAccept}
                  size="sm"
                  className={cn(
                    "flex-1 sm:flex-none h-9",
                    "bg-violet-600 hover:bg-violet-700",
                    "text-white font-medium",
                    "transition-all duration-200",
                    "shadow-sm hover:shadow-md"
                  )}
                >
                  Accept All
                </Button>
              </div>

              {/* Footer text - simplified for mobile */}
              <p className={cn(
                "text-xs mt-3 text-center sm:text-left",
                "text-zinc-500 dark:text-zinc-400"
              )}>
                See{' '}
                <a 
                  href="/privacy" 
                  className="text-violet-600 dark:text-violet-400 hover:underline"
                >
                  Privacy Policy
                </a>
                {' '}for details
              </p>
            </div>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Cookie Preferences Dialog */}
      <CookieConsentDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSavePreferences}
        currentPreferences={consentState.preferences}
      />
    </>
  )
} 