import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { emailService } from '@/lib/services/email'
import { subscriptionPlans } from '@/lib/config/subscription-plans'

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  yearlyPrice: number
  period: string
  features: string[]
  description: string
  buttonText: string
  isPopular: boolean
  variantId: number // Lemon Squeezy variant ID
  yearlyVariantId: number // Lemon Squeezy yearly variant ID
  href?: string // Optional for backward compatibility
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  current_period_start: string
  current_period_end: string
  trial_end?: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export const paymentService = {
  // Initialize Lemon Squeezy checkout
  async createCheckout(plan: SubscriptionPlan, isYearly: boolean = false, userEmail?: string) {
    try {
      console.log('Creating checkout for plan:', plan.name, 'isYearly:', isYearly, 'userEmail:', userEmail)
      
      const variantId = isYearly ? plan.yearlyVariantId : plan.variantId
      console.log('Using variant ID:', variantId)
      
      // For client-side checkout, we need to redirect to the checkout URL directly
      const storeId = import.meta.env.VITE_LEMON_SQUEEZY_STORE_ID
      const checkoutUrl = `https://wavtrack.lemonsqueezy.com/checkout/buy/${variantId}`
      
      console.log('Generated checkout URL:', checkoutUrl)
      
      // Create a mock checkout object for consistency
      const checkout = {
        url: checkoutUrl,
        id: `checkout_${Date.now()}`,
        variantId: variantId
      }

      console.log('Checkout created successfully:', checkout)
      return { checkout, error: null }
    } catch (error) {
      console.error('Error creating checkout:', error)
      return { checkout: null, error: error as Error }
    }
  },

  // Handle successful payment
  async handleSuccessfulPayment(checkoutData: { custom: { plan_id: string; is_yearly: string } }) {
    try {
      if (!supabase) {
        console.warn('Supabase not configured. Skipping subscription creation.')
        return { subscription: null, error: new Error('Supabase not configured') }
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Create subscription record using raw SQL
      const { data: subscription, error } = await supabase
        .rpc('create_user_subscription', {
          p_user_id: user.id,
          p_plan_id: checkoutData.custom.plan_id,
          p_status: 'trialing',
          p_current_period_start: new Date().toISOString(),
          p_current_period_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          p_trial_end: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          p_cancel_at_period_end: false
        })

      if (error) throw error

      toast.success('Free trial started!', {
        description: 'You now have 14 days to explore all features.',
        duration: 5000
      })

      return { subscription, error: null }
    } catch (error) {
      console.error('Error handling successful payment:', error)
      return { subscription: null, error: error as Error }
    }
  },

  // Handle webhook from Lemon Squeezy
  async handleWebhook(webhookData: { event_name: string; data: Record<string, unknown> }) {
    try {
      if (!supabase) {
        console.warn('Supabase not configured. Skipping webhook handling.')
        return { success: false, error: new Error('Supabase not configured') }
      }

      const { event_name, data } = webhookData
      
      if (event_name === 'order_created') {
        // Handle new order
        console.log('New order created:', data)
      } else if (event_name === 'subscription_created') {
        // Handle new subscription
        console.log('New subscription created:', data)
      } else if (event_name === 'subscription_updated') {
        // Handle subscription update
        console.log('Subscription updated:', data)
      } else if (event_name === 'subscription_cancelled') {
        // Handle subscription cancellation
        console.log('Subscription cancelled:', data)
      }
      
      return { success: true, error: null }
    } catch (error) {
      console.error('Error handling webhook:', error)
      return { success: false, error: error as Error }
    }
  },

  // Create new user account from payment
  async createUserFromPayment(email: string, planId: string, isYearly: boolean) {
    try {
      if (!supabase) {
        console.warn('Supabase not configured. Skipping user creation.')
        return { user: null, error: new Error('Supabase not configured') }
      }

      console.log('Creating new user account from payment:', email)
      
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-12)
      
      // Find the plan details for the welcome email
      const plan = subscriptionPlans.find(p => p.id === planId)
      const planName = plan?.name || planId
      
      // Create user account
      const { data: { user }, error: signUpError } = await supabase.auth.signUp({
        email,
        password: tempPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            plan_id: planId,
            is_yearly: isYearly,
            payment_source: 'lemonsqueezy',
            temp_password: tempPassword
          }
        }
      })
      
      if (signUpError) throw signUpError
      
      if (user) {
        // Create subscription record
        await this.handleSuccessfulPayment({
          custom: { plan_id: planId, is_yearly: isYearly.toString() }
        })
        
        // Send welcome email with account setup instructions
        try {
          await emailService.sendWelcomeEmail({
            email: email,
            tempPassword: tempPassword,
            planName: planName,
            loginUrl: `${window.location.origin}/login`
          })
          console.log('Welcome email sent successfully')
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError)
          // Don't throw error - account creation is more important than email
        }
        
        console.log('New user account created successfully:', user.id)
      }
      
      return { user, error: null }
    } catch (error) {
      console.error('Error creating user from payment:', error)
      return { user: null, error: error as Error }
    }
  },

  // Get user's current subscription
  async getUserSubscription(): Promise<UserSubscription | null> {
    try {
      if (!supabase) {
        console.warn('Supabase not configured. Cannot fetch subscription.')
        return null
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return null

      // Use raw SQL to avoid type issues
      const { data: subscription, error } = await supabase
        .rpc('get_user_subscription', { p_user_id: user.id })

      if (error) throw error
      
      return subscription as UserSubscription | null
    } catch (error) {
      console.error('Error fetching user subscription:', error)
      return null
    }
  },

  // Cancel subscription
  async cancelSubscription() {
    try {
      if (!supabase) {
        console.warn('Supabase not configured. Cannot cancel subscription.')
        return { error: new Error('Supabase not configured') }
      }

      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) throw new Error('User not authenticated')

      // Use raw SQL to avoid type issues
      const { error } = await supabase
        .rpc('cancel_user_subscription', { p_user_id: user.id })

      if (error) throw error

      toast.success('Subscription cancelled', {
        description: 'Your subscription will end at the current billing period.',
        duration: 5000
      })

      return { error: null }
    } catch (error) {
      console.error('Error cancelling subscription:', error)
      return { error: error as Error }
    }
  },

  // Check if user is on free trial
  async isOnFreeTrial(): Promise<boolean> {
    try {
      const subscription = await this.getUserSubscription()
      return subscription?.status === 'trialing' || false
    } catch (error) {
      console.error('Error checking free trial status:', error)
      return false
    }
  },

  // Get remaining trial days
  async getTrialDaysRemaining(): Promise<number> {
    try {
      const subscription = await this.getUserSubscription()
      
      if (!subscription || subscription.status !== 'trialing' || !subscription.trial_end) {
        return 0
      }
      
      const trialEnd = new Date(subscription.trial_end)
      const now = new Date()
      const diffTime = trialEnd.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      return Math.max(0, diffDays)
    } catch (error) {
      console.error('Error calculating trial days remaining:', error)
      return 0
    }
  }
} 