import { useState, useEffect, useCallback } from 'react'

export interface CookiePreferences {
  essential: boolean
  analytics: boolean
  personalization: boolean
}

export interface CookieConsentState {
  hasConsented: boolean | null
  preferences: CookiePreferences
  timestamp: number | null
}

const COOKIE_CONSENT_KEY = 'wavtrack-cookie-consent'
const COOKIE_PREFERENCES_KEY = 'wavtrack-cookie-preferences'

const defaultPreferences: CookiePreferences = {
  essential: true, // Always true as these are required
  analytics: false,
  personalization: false
}

export function useCookieConsent() {
  const [consentState, setConsentState] = useState<CookieConsentState>({
    hasConsented: null,
    preferences: defaultPreferences,
    timestamp: null
  })

  // Load consent state from localStorage on mount
  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
      const preferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
      
      if (consent) {
        const parsedConsent = JSON.parse(consent)
        const parsedPreferences = preferences ? JSON.parse(preferences) : defaultPreferences
        
        setConsentState({
          hasConsented: parsedConsent.status === 'accepted',
          preferences: parsedPreferences,
          timestamp: parsedConsent.timestamp
        })
      }
    } catch (error) {
      console.warn('Failed to load cookie consent state:', error)
    }
  }, [])

  const acceptAll = useCallback(() => {
    const newState = {
      hasConsented: true,
      preferences: {
        essential: true,
        analytics: true,
        personalization: true
      },
      timestamp: Date.now()
    }
    
    setConsentState(newState)
    
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
        status: 'accepted',
        timestamp: newState.timestamp
      }))
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(newState.preferences))
    } catch (error) {
      console.warn('Failed to save cookie consent:', error)
    }
  }, [])

  const declineAll = useCallback(() => {
    const newState = {
      hasConsented: false,
      preferences: {
        essential: true, // Essential cookies are always required
        analytics: false,
        personalization: false
      },
      timestamp: Date.now()
    }
    
    setConsentState(newState)
    
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
        status: 'declined',
        timestamp: newState.timestamp
      }))
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(newState.preferences))
    } catch (error) {
      console.warn('Failed to save cookie consent:', error)
    }
  }, [])

  const updatePreferences = useCallback((preferences: Partial<CookiePreferences>) => {
    const newPreferences = {
      ...consentState.preferences,
      ...preferences,
      essential: true // Essential cookies cannot be disabled
    }
    
    const newState = {
      hasConsented: true,
      preferences: newPreferences,
      timestamp: Date.now()
    }
    
    setConsentState(newState)
    
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify({
        status: 'customized',
        timestamp: newState.timestamp
      }))
      localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(newPreferences))
    } catch (error) {
      console.warn('Failed to save cookie preferences:', error)
    }
  }, [consentState.preferences])

  const resetConsent = useCallback(() => {
    setConsentState({
      hasConsented: null,
      preferences: defaultPreferences,
      timestamp: null
    })
    
    try {
      localStorage.removeItem(COOKIE_CONSENT_KEY)
      localStorage.removeItem(COOKIE_PREFERENCES_KEY)
    } catch (error) {
      console.warn('Failed to reset cookie consent:', error)
    }
  }, [])

  const hasConsented = consentState.hasConsented !== null
  const isAnalyticsEnabled = consentState.preferences.analytics
  const isPersonalizationEnabled = consentState.preferences.personalization

  return {
    consentState,
    hasConsented,
    isAnalyticsEnabled,
    isPersonalizationEnabled,
    acceptAll,
    declineAll,
    updatePreferences,
    resetConsent
  }
} 