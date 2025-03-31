import React from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { supabase } from '@/lib/supabase'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
  const handleDismiss = async () => {
    try {
      // Update user metadata to mark welcome as seen
      const { error } = await supabase.auth.updateUser({
        data: { has_seen_welcome: true },
      })

      if (error) throw error
      onClose()
    } catch (error) {
      console.error('Error updating user metadata:', error)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleDismiss}>
      <DialogContent
        className={cn(
          // Base styles with improved backdrop blur
          'p-6 sm:p-8',
          'bg-white/90 dark:bg-zinc-900/90',
          'backdrop-blur-md',
          'border border-zinc-200/50 dark:border-zinc-800/50',
          'rounded-xl',
          'shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)]',
          // Responsive width and positioning
          'w-[calc(100%-2rem)] sm:w-[425px] md:w-[500px]',
          'mx-auto my-4 sm:my-8',
          // Content overflow handling
          'max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-4rem)]',
          'overflow-y-auto'
        )}
      >
        <DialogHeader>
          <DialogTitle className="sr-only">Welcome to WavTrack</DialogTitle>
        </DialogHeader>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {/* Header Section */}
          <div className="text-center space-y-4">
            <h2
              className={cn(
                'text-2xl sm:text-3xl font-bold',
                'bg-gradient-to-r from-purple-500 to-purple-600',
                'text-transparent bg-clip-text',
                'tracking-tight'
              )}
            >
              🎧 Welcome to WavTrack
            </h2>
            <p
              className={cn(
                'text-base sm:text-lg',
                'text-zinc-600 dark:text-zinc-400',
                'max-w-[90%] mx-auto'
              )}
            >
              Your personal productivity hub for music makers
            </p>
          </div>

          {/* Features Section */}
          <div className="space-y-6">
            <div
              className={cn(
                'flex items-start gap-4',
                'p-4 rounded-lg',
                'bg-zinc-50/50 dark:bg-zinc-800/50',
                'transition-colors duration-200'
              )}
            >
              <span className="text-2xl mt-0.5">🎛️</span>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                  Track Your Workflow
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Monitor beats, sessions, and creative progress in one place
                </p>
              </div>
            </div>

            <div
              className={cn(
                'flex items-start gap-4',
                'p-4 rounded-lg',
                'bg-zinc-50/50 dark:bg-zinc-800/50',
                'transition-colors duration-200'
              )}
            >
              <span className="text-2xl mt-0.5">✅</span>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                  Set & Achieve Goals
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Define targets, track progress, and maintain consistency
                </p>
              </div>
            </div>

            <div
              className={cn(
                'flex items-start gap-4',
                'p-4 rounded-lg',
                'bg-zinc-50/50 dark:bg-zinc-800/50',
                'transition-colors duration-200'
              )}
            >
              <span className="text-2xl mt-0.5">🚀</span>
              <div>
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                  Finish More Music
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Built for producers who want to stay focused and productive
                </p>
              </div>
            </div>
          </div>

          {/* Encouragement Section */}
          <div className="text-center space-y-3">
            <p
              className={cn(
                'text-base sm:text-lg',
                'text-zinc-700 dark:text-zinc-300',
                'font-medium'
              )}
            >
              Ready to level up your music production?
            </p>
            <p
              className={cn(
                'text-sm',
                'text-zinc-600 dark:text-zinc-400',
                'max-w-[90%] mx-auto'
              )}
            >
              Create your first project and start tracking your progress today
            </p>
          </div>

          {/* Button */}
          <Button
            onClick={handleDismiss}
            className={cn(
              'w-full',
              'py-6',
              'text-base font-medium',
              'bg-purple-600 hover:bg-purple-500',
              'dark:bg-purple-600 dark:hover:bg-purple-500',
              'text-white',
              'shadow-lg hover:shadow-purple-500/25',
              'transition-all duration-300',
              'rounded-xl',
              'focus:ring-2 focus:ring-purple-500/20',
              'focus:outline-none focus:ring-offset-2',
              'dark:focus:ring-offset-zinc-900',
              'relative overflow-hidden',
              'group'
            )}
          >
            <span className="relative z-10">Let's Get Started</span>
            <div
              className={cn(
                'absolute inset-0',
                'bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0',
                'translate-x-[-200%] group-hover:translate-x-[200%]',
                'transition-transform duration-1000'
              )}
            />
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
