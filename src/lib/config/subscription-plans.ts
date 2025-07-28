import { SubscriptionPlan } from '@/lib/services/payment'

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'starter',
    name: 'STARTER',
    price: 9.99,
    yearlyPrice: 8,
    period: 'per month',
    features: [
      '10 projects per month',
      'Basic audio analysis',
      'Pomodoro timer',
      'Session tracking',
      'AI goal suggestions',
      'Community support',
    ],
    description: 'Perfect for beginners starting their music journey',
    buttonText: 'Get Started',
    isPopular: false,
    variantId: 922357, // Starter Monthly
    yearlyVariantId: 922354, // Starter Yearly
    href: '/auth/login' // Fallback URL
  },
  {
    id: 'producer',
    name: 'PRODUCER',
    price: 19.99,
    yearlyPrice: 16,
    period: 'per month',
    features: [
      'Unlimited projects',
      'Advanced audio analysis',
      'Custom timer sessions',
      'AI coaching',
      'Productivity analytics',
      'Session goals tracking',
      'Priority support',
    ],
    description: 'Ideal for serious producers and growing artists',
    buttonText: 'Get Started',
    isPopular: true,
    variantId: 922349, // Producer Monthly
    yearlyVariantId: 922367, // Producer Yearly
    href: '/auth/login' // Fallback URL
  },
  {
    id: 'studio',
    name: 'STUDIO',
    price: 49.99,
    yearlyPrice: 40,
    period: 'per month',
    features: [
      'Everything in Producer',
      'Multi-user access',
      'Advanced analytics',
      'Custom branding',
      'API access',
      'Dedicated support',
      'Workflow automation',
    ],
    description: 'For professional studios and large organizations',
    buttonText: 'Get Started',
    isPopular: false,
    variantId: 922355, // Studio Monthly
    yearlyVariantId: 922362, // Studio Yearly
    href: '/contact' // Fallback URL for Studio plan
  },
] 