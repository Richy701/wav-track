import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, ShieldCheckIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { CookiePreferences } from '@/hooks/useCookieConsent'

interface CookieConsentDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (preferences: CookiePreferences) => void
  currentPreferences: CookiePreferences
}

export default function CookieConsentDialog({
  isOpen,
  onClose,
  onSave,
  currentPreferences
}: CookieConsentDialogProps) {
  const [preferences, setPreferences] = useState<CookiePreferences>(currentPreferences)
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const handleSave = () => {
    onSave(preferences)
    onClose()
  }

  const handleToggle = (key: keyof CookiePreferences) => {
    if (key === 'essential') return // Essential cookies cannot be disabled
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const cookieTypes = [
    {
      key: 'essential' as const,
      title: 'Essential Cookies',
      description: 'Required for basic functionality like authentication and session management. These cannot be disabled.',
      icon: ShieldCheckIcon,
      color: 'bg-green-500',
      disabled: true
    },
    {
      key: 'analytics' as const,
      title: 'Analytics Cookies',
      description: 'Help us understand how you use WavTrack so we can improve the app and add new features.',
      icon: ChartBarIcon,
      color: 'bg-blue-500',
      disabled: false
    },
    {
      key: 'personalization' as const,
      title: 'Personalization Cookies',
      description: 'Enable personalized features like custom themes, saved preferences, and tailored recommendations.',
      icon: CogIcon,
      color: 'bg-purple-500',
      disabled: false
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={cn(
              "relative w-full max-w-2xl max-h-[90vh] overflow-hidden",
              "bg-white dark:bg-zinc-900",
              "rounded-2xl border border-zinc-200 dark:border-zinc-800",
              "shadow-2xl"
            )}
          >
            {/* Header */}
            <div className={cn(
              "flex items-center justify-between p-6",
              "border-b border-zinc-200 dark:border-zinc-800"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-full",
                  "bg-violet-100 dark:bg-violet-900/30",
                  "text-violet-600 dark:text-violet-400"
                )}>
                  <ShieldCheckIcon className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className={cn(
                      "text-xl font-semibold",
                      "text-zinc-900 dark:text-zinc-100"
                    )}>
                      Cookie Preferences
                    </h2>
                    <span className={cn(
                      "text-sm font-bold tracking-tight",
                      "bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent"
                    )}>
                      WavTrack
                    </span>
                  </div>
                  <p className={cn(
                    "text-sm",
                    "text-zinc-600 dark:text-zinc-400"
                  )}>
                    Customize your cookie settings
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className={cn(
                  "p-2 rounded-full transition-all duration-200",
                  "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                  "text-zinc-500 dark:text-zinc-400",
                  "hover:text-zinc-700 dark:hover:text-zinc-200"
                )}
                aria-label="Close dialog"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
              {cookieTypes.map((cookieType) => {
                const Icon = cookieType.icon
                const isEnabled = preferences[cookieType.key]
                
                return (
                  <div
                    key={cookieType.key}
                    className={cn(
                      "p-4 rounded-lg border transition-all duration-200",
                      isEnabled
                        ? "border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20"
                        : "border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/50"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "flex-shrink-0 p-2 rounded-full",
                        isEnabled
                          ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                      )}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className={cn(
                            "font-medium",
                            "text-zinc-900 dark:text-zinc-100"
                          )}>
                            {cookieType.title}
                          </h3>
                          
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() => handleToggle(cookieType.key)}
                            disabled={cookieType.disabled}
                            className={cn(
                              cookieType.disabled && "opacity-50 cursor-not-allowed"
                            )}
                          />
                        </div>
                        
                        <p className={cn(
                          "text-sm leading-relaxed",
                          "text-zinc-600 dark:text-zinc-400"
                        )}>
                          {cookieType.description}
                        </p>
                        
                        {cookieType.disabled && (
                          <p className={cn(
                            "text-xs mt-2",
                            "text-zinc-500 dark:text-zinc-500",
                            "italic"
                          )}>
                            This setting cannot be disabled
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className={cn(
              "flex flex-col sm:flex-row gap-3 p-6",
              "border-t border-zinc-200 dark:border-zinc-800"
            )}>
              <Button
                onClick={handleSave}
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
                Save Preferences
              </Button>
              
              <Button
                onClick={onClose}
                variant="outline"
                className={cn(
                  "flex-1 sm:flex-none",
                  "border-zinc-300 dark:border-zinc-600",
                  "text-zinc-700 dark:text-zinc-300",
                  "hover:bg-zinc-50 dark:hover:bg-zinc-800",
                  "rounded-full px-6 py-2.5",
                  "transition-all duration-200"
                )}
              >
                Cancel
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 