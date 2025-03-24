import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

const Callback = () => {
  console.log('Callback component mounted')
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the current URL parameters
        const params = new URLSearchParams(window.location.search)
        const code = params.get('code')
        const next = '/wav-track/dashboard' // Always redirect to dashboard after OAuth

        console.log('Callback URL params:', {
          code: code ? 'present' : 'missing',
          fullUrl: window.location.href
        })

        // Handle OAuth callback
        if (code) {
          console.log('Processing OAuth callback...')
          const { error: signInError } = await supabase.auth.exchangeCodeForSession(code)

          if (signInError) {
            console.error('OAuth callback error:', signInError)
            toast.error('Authentication failed')
            navigate('/wav-track/login')
            return
          }

          // Get the session after successful code exchange
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()

          if (sessionError || !session) {
            console.error('Session error after OAuth:', sessionError)
            toast.error('Failed to establish session')
            navigate('/wav-track/login')
            return
          }

          // Successfully authenticated
          console.log('OAuth authentication successful', {
            userId: session.user.id,
            provider: session.user.app_metadata.provider
          })
          toast.success('Successfully signed in')
          navigate(next)
          return
        }

        // If no code, check for existing session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError || !session) {
          console.error('No session found:', sessionError)
          toast.error('Authentication failed')
          navigate('/wav-track/login')
          return
        }

        // Existing session found
        console.log('Existing session found')
        toast.success('Authentication successful')
        navigate('/wav-track/dashboard')
      } catch (error) {
        console.error('Error in callback:', error)
        toast.error('Authentication error')
        navigate('/wav-track/login')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="text-lg">Verifying your account...</p>
        <p className="text-sm text-muted-foreground">Please wait while we complete the process.</p>
      </div>
    </div>
  )
}

export default Callback
