import React from 'react'
import { useCookieConsent } from '@/hooks/useCookieConsent'

// Personalization service that respects cookie consent
class PersonalizationService {
  private isEnabled = false

  constructor() {
    this.checkConsent()
  }

  private checkConsent() {
    try {
      const consent = localStorage.getItem('wavtrack-cookie-consent')
      const preferences = localStorage.getItem('wavtrack-cookie-preferences')
      
      if (consent && preferences) {
        const parsedConsent = JSON.parse(consent)
        const parsedPreferences = JSON.parse(preferences)
        
        this.isEnabled = parsedConsent.status === 'accepted' && parsedPreferences.personalization
      }
    } catch (error) {
      console.warn('Failed to check personalization consent:', error)
      this.isEnabled = false
    }
  }

  public enable() {
    this.isEnabled = true
  }

  public disable() {
    this.isEnabled = false
  }

  public savePreference(key: string, value: any) {
    if (!this.isEnabled) {
      console.log('Personalization disabled - preference not saved:', key, value)
      return
    }

    try {
      const preferences = this.getPreferences()
      preferences[key] = value
      localStorage.setItem('wavtrack-user-preferences', JSON.stringify(preferences))
    } catch (error) {
      console.warn('Failed to save preference:', error)
    }
  }

  public getPreference(key: string, defaultValue?: any) {
    if (!this.isEnabled) {
      return defaultValue
    }

    try {
      const preferences = this.getPreferences()
      return preferences[key] !== undefined ? preferences[key] : defaultValue
    } catch (error) {
      console.warn('Failed to get preference:', error)
      return defaultValue
    }
  }

  public getPreferences() {
    try {
      const stored = localStorage.getItem('wavtrack-user-preferences')
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.warn('Failed to get preferences:', error)
      return {}
    }
  }

  public clearPreferences() {
    try {
      localStorage.removeItem('wavtrack-user-preferences')
    } catch (error) {
      console.warn('Failed to clear preferences:', error)
    }
  }

  // Theme preferences
  public saveThemePreference(theme: string) {
    this.savePreference('theme', theme)
  }

  public getThemePreference(): string | null {
    return this.getPreference('theme', null)
  }

  // UI preferences
  public saveUIPreference(key: string, value: any) {
    this.savePreference(`ui_${key}`, value)
  }

  public getUIPreference(key: string, defaultValue?: any) {
    return this.getPreference(`ui_${key}`, defaultValue)
  }

  // Feature preferences
  public saveFeaturePreference(feature: string, enabled: boolean) {
    this.savePreference(`feature_${feature}`, enabled)
  }

  public getFeaturePreference(feature: string, defaultValue = true): boolean {
    return this.getPreference(`feature_${feature}`, defaultValue)
  }

  // User behavior tracking for personalization
  public trackBehavior(action: string, context?: Record<string, any>) {
    if (!this.isEnabled) {
      return
    }

    try {
      const behaviors = this.getBehaviors()
      const timestamp = Date.now()
      
      behaviors.push({
        action,
        context,
        timestamp
      })

      // Keep only last 100 behaviors to prevent storage bloat
      if (behaviors.length > 100) {
        behaviors.splice(0, behaviors.length - 100)
      }

      localStorage.setItem('wavtrack-user-behaviors', JSON.stringify(behaviors))
    } catch (error) {
      console.warn('Failed to track behavior:', error)
    }
  }

  public getBehaviors() {
    try {
      const stored = localStorage.getItem('wavtrack-user-behaviors')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.warn('Failed to get behaviors:', error)
      return []
    }
  }

  public clearBehaviors() {
    try {
      localStorage.removeItem('wavtrack-user-behaviors')
    } catch (error) {
      console.warn('Failed to clear behaviors:', error)
    }
  }
}

// Create singleton instance
export const personalization = new PersonalizationService()

// Hook to use personalization with consent
export function usePersonalization() {
  const { isPersonalizationEnabled } = useCookieConsent()

  // Update personalization state when consent changes
  React.useEffect(() => {
    if (isPersonalizationEnabled) {
      personalization.enable()
    } else {
      personalization.disable()
    }
  }, [isPersonalizationEnabled])

  return {
    savePreference: personalization.savePreference.bind(personalization),
    getPreference: personalization.getPreference.bind(personalization),
    saveThemePreference: personalization.saveThemePreference.bind(personalization),
    getThemePreference: personalization.getThemePreference.bind(personalization),
    saveUIPreference: personalization.saveUIPreference.bind(personalization),
    getUIPreference: personalization.getUIPreference.bind(personalization),
    saveFeaturePreference: personalization.saveFeaturePreference.bind(personalization),
    getFeaturePreference: personalization.getFeaturePreference.bind(personalization),
    trackBehavior: personalization.trackBehavior.bind(personalization),
    isEnabled: isPersonalizationEnabled
  }
}

// Export the personalization instance for direct use
export default personalization 