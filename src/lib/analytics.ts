import React from 'react'
import { useCookieConsent } from '@/hooks/useCookieConsent'

// Simple analytics service that respects cookie consent
class AnalyticsService {
  private isEnabled = false

  constructor() {
    // Check initial consent state
    this.checkConsent()
  }

  private checkConsent() {
    try {
      const consent = localStorage.getItem('wavtrack-cookie-consent')
      const preferences = localStorage.getItem('wavtrack-cookie-preferences')
      
      if (consent && preferences) {
        const parsedConsent = JSON.parse(consent)
        const parsedPreferences = JSON.parse(preferences)
        
        this.isEnabled = parsedConsent.status === 'accepted' && parsedPreferences.analytics
      }
    } catch (error) {
      console.warn('Failed to check analytics consent:', error)
      this.isEnabled = false
    }
  }

  public enable() {
    this.isEnabled = true
  }

  public disable() {
    this.isEnabled = false
  }

  public track(event: string, properties?: Record<string, any>) {
    if (!this.isEnabled) {
      console.log('Analytics disabled - event not tracked:', event, properties)
      return
    }

    // Here you would integrate with your analytics provider
    // For now, we'll just log to console
    console.log('Analytics event:', event, properties)
    
    // Example: Google Analytics 4
    // if (typeof gtag !== 'undefined') {
    //   gtag('event', event, properties)
    // }
    
    // Example: Plausible Analytics
    // if (typeof plausible !== 'undefined') {
    //   plausible(event, { props: properties })
    // }
  }

  public trackPageView(page: string) {
    this.track('page_view', { page })
  }

  public trackUserAction(action: string, category?: string) {
    this.track('user_action', { action, category })
  }

  public trackFeatureUsage(feature: string) {
    this.track('feature_usage', { feature })
  }

  public trackError(error: string, context?: Record<string, any>) {
    this.track('error', { error, context })
  }
}

// Create singleton instance
export const analytics = new AnalyticsService()

// Hook to use analytics with consent
export function useAnalytics() {
  const { isAnalyticsEnabled } = useCookieConsent()

  // Update analytics state when consent changes
  React.useEffect(() => {
    if (isAnalyticsEnabled) {
      analytics.enable()
    } else {
      analytics.disable()
    }
  }, [isAnalyticsEnabled])

  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackUserAction: analytics.trackUserAction.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    isEnabled: isAnalyticsEnabled
  }
}

// Export the analytics instance for direct use
export default analytics
