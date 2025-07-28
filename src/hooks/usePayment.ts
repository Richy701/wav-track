import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { paymentService, UserSubscription } from '@/lib/services/payment'
import { subscriptionPlans, SubscriptionPlan } from '@/lib/config/subscription-plans'

export function usePayment() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [trialDaysRemaining, setTrialDaysRemaining] = useState(0)

  // Load user's subscription on mount
  useEffect(() => {
    if (user) {
      loadUserSubscription()
    } else {
      setSubscription(null)
      setTrialDaysRemaining(0)
    }
  }, [user])

  const loadUserSubscription = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const userSubscription = await paymentService.getUserSubscription()
      setSubscription(userSubscription)
      
      if (userSubscription) {
        const daysRemaining = await paymentService.getTrialDaysRemaining()
        setTrialDaysRemaining(daysRemaining)
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const startFreeTrial = async (planId: string, isYearly: boolean = false) => {
    console.log('startFreeTrial called with planId:', planId, 'isYearly:', isYearly)
    
    setIsLoading(true)
    try {
      const plan = subscriptionPlans.find(p => p.id === planId)
      if (!plan) throw new Error('Plan not found')
      
      console.log('Found plan:', plan)

      // If user is logged in, use their email. If not, let Lemon Squeezy collect it
      const userEmail = user?.email
      console.log('User email for checkout:', userEmail || 'will be collected during checkout')

      const { checkout, error } = await paymentService.createCheckout(plan, isYearly, userEmail)
      
      if (error) throw error

      console.log('Checkout result:', checkout)
      // Open checkout in new window
      if (checkout?.url) {
        console.log('Opening checkout URL:', checkout.url)
        window.open(checkout.url, '_blank')
      } else {
        console.log('No checkout URL found')
      }
    } catch (error) {
      console.error('Error starting free trial:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const cancelSubscription = async () => {
    setIsLoading(true)
    try {
      const { error } = await paymentService.cancelSubscription()
      if (error) throw error
      
      // Reload subscription data
      await loadUserSubscription()
    } catch (error) {
      console.error('Error cancelling subscription:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const isOnFreeTrial = subscription?.status === 'trialing' && trialDaysRemaining > 0
  const hasActiveSubscription = subscription?.status === 'active' || isOnFreeTrial

  return {
    subscription,
    isLoading,
    trialDaysRemaining,
    isOnFreeTrial,
    hasActiveSubscription,
    startFreeTrial,
    cancelSubscription,
    loadUserSubscription,
    plans: subscriptionPlans
  }
} 