import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCookieConsent } from '@/hooks/useCookieConsent'
import { useAnalytics } from '@/lib/analytics'
import { usePersonalization } from '@/lib/personalization'
import { ShieldCheckIcon, ChartBarIcon, CogIcon } from '@heroicons/react/24/outline'

export default function CookieConsentDemo() {
  const { 
    consentState, 
    hasConsented, 
    isAnalyticsEnabled, 
    isPersonalizationEnabled,
    resetConsent 
  } = useCookieConsent()
  
  const { track, isEnabled: analyticsEnabled } = useAnalytics()
  const { savePreference, getPreference, isEnabled: personalizationEnabled } = usePersonalization()

  const handleTestAnalytics = () => {
    track('demo_button_click', { component: 'CookieConsentDemo' })
    alert('Analytics event tracked! Check console for details.')
  }

  const handleTestPersonalization = () => {
    const testValue = `Test preference ${Date.now()}`
    savePreference('demo_preference', testValue)
    const savedValue = getPreference('demo_preference')
    alert(`Preference saved and retrieved: ${savedValue}`)
  }

  const handleResetConsent = () => {
    resetConsent()
    alert('Cookie consent has been reset. Refresh the page to see the consent banner again.')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Cookie Consent Demo
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Test the personalized cookie consent functionality
        </p>
      </div>

      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheckIcon className="w-5 h-5" />
            Current Consent Status
          </CardTitle>
          <CardDescription>
            View your current cookie consent preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-zinc-50 dark:bg-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${hasConsented ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">Consent Given</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {hasConsented ? 'Yes' : 'No'}
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-zinc-50 dark:bg-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <ChartBarIcon className="w-4 h-4" />
                <span className="font-medium">Analytics</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {isAnalyticsEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            
            <div className="p-4 rounded-lg border bg-zinc-50 dark:bg-zinc-800">
              <div className="flex items-center gap-2 mb-2">
                <CogIcon className="w-4 h-4" />
                <span className="font-medium">Personalization</span>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {isPersonalizationEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
          </div>

          {consentState.timestamp && (
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              Last updated: {new Date(consentState.timestamp).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5" />
            Test Analytics
          </CardTitle>
          <CardDescription>
            Test analytics tracking (only works if analytics cookies are enabled)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Analytics status: <span className={analyticsEnabled ? 'text-green-600' : 'text-red-600'}>
                {analyticsEnabled ? 'Active' : 'Inactive'}
              </span>
            </p>
            <Button 
              onClick={handleTestAnalytics}
              disabled={!analyticsEnabled}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Track Demo Event
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Personalization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CogIcon className="w-5 h-5" />
            Test Personalization
          </CardTitle>
          <CardDescription>
            Test personalization features (only works if personalization cookies are enabled)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Personalization status: <span className={personalizationEnabled ? 'text-green-600' : 'text-red-600'}>
                {personalizationEnabled ? 'Active' : 'Inactive'}
              </span>
            </p>
            <Button 
              onClick={handleTestPersonalization}
              disabled={!personalizationEnabled}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Save Test Preference
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Consent */}
      <Card>
        <CardHeader>
          <CardTitle>Reset Cookie Consent</CardTitle>
          <CardDescription>
            Clear your cookie consent preferences to test the banner again
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleResetConsent}
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950/20"
          >
            Reset Consent
          </Button>
        </CardContent>
      </Card>

      {/* Raw Data */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Consent Data</CardTitle>
          <CardDescription>
            View the raw consent data stored in localStorage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-zinc-100 dark:bg-zinc-800 p-4 rounded-lg overflow-auto">
            {JSON.stringify(consentState, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
} 