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
            stiffness: 300, 
            damping: 30,
            duration: 0.3 
          }}
          className={cn(
            "fixed bottom-4 left-4 right-4 z-50",
            "max-w-2xl mx-auto"
          )}
        >
          <div className={cn(
            "relative overflow-hidden rounded-2xl",
            "bg-white/95 dark:bg-zinc-900/95",
            "backdrop-blur-xl border",
            "border-zinc-200/80 dark:border-zinc-800/80",
            "shadow-2xl",
            "p-6"
          )}>
            {/* Background gradient */}
            <div className={cn(
              "absolute inset-0 rounded-2xl",
              "bg-gradient-to-br from-violet-50/50 to-indigo-50/50",
              "dark:from-violet-950/20 dark:to-indigo-950/20",
              "pointer-events-none"
            )} />
            
            {/* Close button */}
            <button
              onClick={handleClose}
              className={cn(
                "absolute top-4 right-4 z-10",
                "p-2 rounded-full transition-all duration-200",
                "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                "text-zinc-500 dark:text-zinc-400",
                "hover:text-zinc-700 dark:hover:text-zinc-200"
              )}
              aria-label="Close cookie consent"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className={cn(
                  "flex-shrink-0 p-2 rounded-full",
                  "bg-violet-100 dark:bg-violet-900/30",
                  "text-violet-600 dark:text-violet-400"
                )}>
                  <ShieldCheckIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className={cn(
                      "text-lg font-semibold",
                      "text-zinc-900 dark:text-zinc-100"
                    )}>
                      We value your privacy
                    </h3>
                    <span className={cn(
                      "text-sm font-bold tracking-tight",
                      "bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"
                    )}>
                      WavTrack
                    </span>
                  </div>
                  <p className={cn(
                    "text-sm leading-relaxed",
                    "text-zinc-600 dark:text-zinc-400"
                  )}>
                    We use cookies to enhance your experience, analyze usage patterns, and provide personalized content. 
                    Your data helps us improve WavTrack and make it more useful for music producers like you.
                  </p>
                </div>
              </div>

              {/* Cookie types */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className={cn(
                  "p-3 rounded-lg border",
                  "bg-zinc-50/50 dark:bg-zinc-800/50",
                  "border-zinc-200 dark:border-zinc-700"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <span className={cn(
                      "text-xs font-medium",
                      "text-zinc-700 dark:text-zinc-300"
                    )}>
                      Essential
                    </span>
                  </div>
                  <p className={cn(
                    "text-xs",
                    "text-zinc-600 dark:text-zinc-400"
                  )}>
                    Required for basic functionality
                  </p>
                </div>
                
                <div className={cn(
                  "p-3 rounded-lg border",
                  "bg-zinc-50/50 dark:bg-zinc-800/50",
                  "border-zinc-200 dark:border-zinc-700"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className={cn(
                      "text-xs font-medium",
                      "text-zinc-700 dark:text-zinc-300"
                    )}>
                      Analytics
                    </span>
                  </div>
                  <p className={cn(
                    "text-xs",
                    "text-zinc-600 dark:text-zinc-400"
                  )}>
                    Help us improve the app
                  </p>
                </div>
                
                <div className={cn(
                  "p-3 rounded-lg border",
                  "bg-zinc-50/50 dark:bg-zinc-800/50",
                  "border-zinc-200 dark:border-zinc-700"
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                    <span className={cn(
                      "text-xs font-medium",
                      "text-zinc-700 dark:text-zinc-300"
                    )}>
                      Personalization
                    </span>
                  </div>
                  <p className={cn(
                    "text-xs",
                    "text-zinc-600 dark:text-zinc-400"
                  )}>
                    Customize your experience
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleAccept}
                  className={cn(
                    "flex-1 sm:flex-none",
                    "bg-gradient-to-r from-violet-600 to-indigo-600",
                    "hover:from-violet-700 hover:to-indigo-700",
                    "text-white font-medium",
                    "rounded-full px-6 py-2.5",
                    "transition-all duration-200",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    "shadow-lg hover:shadow-xl"
                  )}
                >
                  Accept All Cookies
                </Button>
                
                <Button
                  onClick={handleCustomize}
                  variant="outline"
                  className={cn(
                    "flex-1 sm:flex-none",
                    "border-zinc-300 dark:border-zinc-600",
                    "text-zinc-700 dark:text-zinc-300",
                    "hover:bg-zinc-50 dark:hover:bg-zinc-800",
                    "rounded-full px-6 py-2.5",
                    "transition-all duration-200",
                    "hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  <Cog6ToothIcon className="w-4 h-4 mr-2" />
                  Customize
                </Button>
                
                <Button
                  onClick={handleDecline}
                  variant="ghost"
                  className={cn(
                    "flex-1 sm:flex-none",
                    "text-zinc-500 dark:text-zinc-400",
                    "hover:text-zinc-700 dark:hover:text-zinc-200",
                    "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                    "rounded-full px-6 py-2.5",
                    "transition-all duration-200"
                  )}
                >
                  Decline
                </Button>
              </div>

              {/* Footer text */}
              <p className={cn(
                "text-xs mt-4 text-center",
                "text-zinc-500 dark:text-zinc-400"
              )}>
                By continuing to use WavTrack, you agree to our{' '}
                <a 
                  href="/privacy" 
                  className={cn(
                    "underline underline-offset-2",
                    "text-violet-600 dark:text-violet-400",
                    "hover:text-violet-700 dark:hover:text-violet-300"
                  )}
                >
                  Privacy Policy
                </a>
                {' '}and{' '}
                <a 
                  href="/terms" 
                  className={cn(
                    "underline underline-offset-2",
                    "text-violet-600 dark:text-violet-400",
                    "hover:text-violet-700 dark:hover:text-violet-300"
                  )}
                >
                  Terms of Service
                </a>
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