import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

export const useOnboarding = () => {
  const { user } = useAuth()
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false)
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false)

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) return

      try {
        const { data: { user: userData } } = await supabase.auth.getUser()
        const hasCompleted = userData?.user_metadata?.has_completed_onboarding
        setHasCompletedOnboarding(!!hasCompleted)

        // Show onboarding if user hasn't completed it
        if (!hasCompleted) {
          setIsOnboardingOpen(true)
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
      }
    }

    checkOnboardingStatus()
  }, [user])

  const closeOnboarding = () => {
    setIsOnboardingOpen(false)
  }

  return {
    isOnboardingOpen,
    hasCompletedOnboarding,
    closeOnboarding
  }
} 