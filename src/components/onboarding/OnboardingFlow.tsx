import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dialog } from '@headlessui/react'
import { useOnboarding } from '@/hooks/useOnboarding'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Music, 
  Mic, 
  Waveform, 
  Settings, 
  X,
  ChevronRight,
  ChevronLeft
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
}

const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to WavTrack',
    description: 'Your AI-powered music production assistant',
    icon: <Music className="w-8 h-8" />,
    content: (
      <div className="space-y-4">
        <p className="text-lg">
          WavTrack helps you create, analyze, and improve your music with AI.
        </p>
        <p className="text-muted-foreground">
          Let's get you started with a quick tour of the key features.
        </p>
      </div>
    )
  },
  {
    id: 'recording',
    title: 'Record Your Music',
    description: 'Capture your audio with precision',
    icon: <Mic className="w-8 h-8" />,
    content: (
      <div className="space-y-4">
        <p className="text-lg">
          Record your tracks directly in the browser with our high-quality audio engine.
        </p>
        <ul className="list-disc list-inside text-muted-foreground">
          <li>Multi-track recording support</li>
          <li>Real-time waveform visualization</li>
          <li>Automatic gain control</li>
        </ul>
      </div>
    )
  },
  {
    id: 'analysis',
    title: 'AI Analysis',
    description: 'Get instant feedback on your music',
    icon: <Waveform className="w-8 h-8" />,
    content: (
      <div className="space-y-4">
        <p className="text-lg">
          Our AI analyzes your tracks to provide valuable insights.
        </p>
        <ul className="list-disc list-inside text-muted-foreground">
          <li>Key and scale detection</li>
          <li>Chord progression analysis</li>
          <li>Mixing suggestions</li>
        </ul>
      </div>
    )
  },
  {
    id: 'preferences',
    title: 'Customize Your Experience',
    description: 'Set up your preferences',
    icon: <Settings className="w-8 h-8" />,
    content: (
      <div className="space-y-4">
        <p className="text-lg">
          Personalize WavTrack to match your workflow.
        </p>
        <ul className="list-disc list-inside text-muted-foreground">
          <li>Choose your preferred audio interface</li>
          <li>Set default recording quality</li>
          <li>Configure keyboard shortcuts</li>
        </ul>
      </div>
    )
  }
]

export const OnboardingFlow = () => {
  const { user } = useAuth()
  const { isOnboardingOpen, closeOnboarding } = useOnboarding()
  const [currentStep, setCurrentStep] = useState(0)
  const [isCompleting, setIsCompleting] = useState(false)

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleComplete = async () => {
    if (!user) return

    setIsCompleting(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: { has_completed_onboarding: true }
      })

      if (error) throw error
      closeOnboarding()
    } catch (error) {
      console.error('Error completing onboarding:', error)
    } finally {
      setIsCompleting(false)
    }
  }

  const handleSkip = () => {
    closeOnboarding()
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <Dialog
      open={isOnboardingOpen}
      onClose={handleSkip}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-background rounded-lg shadow-xl">
          <div className="relative">
            <button
              onClick={handleSkip}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
              aria-label="Close onboarding"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6">
              <Progress value={progress} className="mb-6" />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4">
                    {steps[currentStep].icon}
                    <div>
                      <Dialog.Title className="text-2xl font-semibold">
                        {steps[currentStep].title}
                      </Dialog.Title>
                      <Dialog.Description className="text-muted-foreground">
                        {steps[currentStep].description}
                      </Dialog.Description>
                    </div>
                  </div>

                  {steps[currentStep].content}
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 flex justify-between">
                <Button
                  variant="ghost"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={isCompleting}
                >
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
} 