import React, { useState, useEffect } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { AtSign, Lock, ArrowRight, Mail, User } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import Footer from '@/components/Footer'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { FeatureHighlights } from '@/components/features/FeatureHighlights'
import { cn } from '@/lib/utils'
import { trackEvent, ANALYTICS_EVENTS } from '@/lib/analytics'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { authService } from '@/lib/services/auth'
import { useQueryClient } from '@tanstack/react-query'
import { prefetchDashboardData } from '@/lib/prefetch'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState('')
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [error, setError] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const from = location.state?.from || '/'

  useEffect(() => {
    if (isAuthenticated && !isAuthLoading) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, isAuthLoading, navigate, from])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const success = await login(email, password)
      if (!success) {
        setError('Invalid email or password')
      } else {
        // Prefetch dashboard data after successful login
        try {
          await prefetchDashboardData(queryClient)
        } catch (prefetchError) {
          console.error('Error prefetching dashboard data:', prefetchError)
          // Don't show error to user - prefetch failure shouldn't block login
        }
      }
      // Navigation will be handled by handleLoginSuccess in AuthContext
    } catch (err) {
      console.error('Login error:', err)
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialLogin = async () => {
    try {
      setSocialLoading('google')
      trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, { page: 'dashboard', type: 'google_login' })
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: import.meta.env.VITE_GOOGLE_REDIRECT_URL,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Google login error:', error)
      toast.error('Failed to sign in with Google')
      setSocialLoading('')
    }
  }

  // Show loading state while auth is initializing
  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50/80 dark:bg-background relative overflow-hidden">
      {/* Background gradient elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-500/[0.03] to-transparent dark:from-violet-500/5" />
      <div className="absolute -top-[40rem] left-1/2 -translate-x-1/2 w-[80rem] h-[80rem] bg-gradient-to-b from-violet-100/20 to-transparent dark:bg-violet-500/5 rounded-full blur-3xl" />

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeSwitcher />
      </div>

      <main className="relative flex min-h-screen flex-col">
        <div className="flex-1 flex flex-col items-center justify-start pt-16 sm:pt-24 pb-8 px-4">
          {/* Login Content */}
          <div className="w-full max-w-md relative space-y-6 mb-12">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-1.5">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
                  WavTrack
                </h1>
                <span
                  className={cn(
                    'px-1.5 py-0.5 text-[0.65rem] font-medium rounded-full tracking-wide translate-y-1',
                    'transition-colors duration-200',
                    'bg-violet-50 text-violet-700 border border-violet-200/70',
                    'dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20'
                  )}
                >
                  BETA
                </span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-50">
                  Welcome back
                </h2>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
                  Track your music production sessions, set goals, and improve your workflow
                </p>
              </div>
            </div>

            <Card
              className={cn(
                'shadow-xl bg-white/70 backdrop-blur-sm border-zinc-200/60',
                'dark:bg-card dark:border-zinc-800/50'
              )}
            >
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                    >
                      Email
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 dark:text-zinc-400">
                        <AtSign className="h-4 w-4" />
                      </div>
                      <Input
                        id="email"
                        placeholder="your.email@example.com"
                        type="email"
                        autoCapitalize="none"
                        autoComplete="email"
                        autoCorrect="off"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className={cn(
                          'pl-10 bg-white dark:bg-zinc-900',
                          'border-zinc-200 dark:border-zinc-800',
                          'placeholder:text-zinc-500 dark:placeholder:text-zinc-500',
                          'focus:ring-violet-500/20 focus:border-violet-500/60'
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-sm font-medium text-zinc-700 dark:text-zinc-300"
                      >
                        Password
                      </Label>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500 dark:text-zinc-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        id="password"
                        placeholder="••••••••"
                        type="password"
                        autoCapitalize="none"
                        autoComplete="current-password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className={cn(
                          'pl-10 bg-white dark:bg-zinc-900',
                          'border-zinc-200 dark:border-zinc-800',
                          'placeholder:text-zinc-500 dark:placeholder:text-zinc-500',
                          'focus:ring-violet-500/20 focus:border-violet-500/60'
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Button
                      type="submit"
                      className={cn(
                        'w-full bg-violet-600 hover:bg-violet-700',
                        'dark:bg-violet-600 dark:hover:bg-violet-700',
                        'text-white shadow-md'
                      )}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Signing in...</span>
                        </div>
                      ) : (
                        'Sign in'
                      )}
                    </Button>
                  </div>
                </form>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="relative flex items-center justify-center my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200 dark:border-zinc-800"></div>
                  </div>
                  <div className="relative px-2 text-xs text-zinc-500 bg-white/70 dark:bg-card">
                    Or continue with
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    variant="outline"
                    type="button"
                    className={cn(
                      'w-full flex items-center justify-center gap-2 py-5',
                      'bg-white dark:bg-zinc-900',
                      'border-zinc-300 dark:border-zinc-700',
                      'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
                      'text-zinc-900 dark:text-zinc-100',
                      'transition-colors duration-200'
                    )}
                    onClick={handleSocialLogin}
                    disabled={!!socialLoading}
                  >
                    {socialLoading === 'google' ? (
                      <div className="h-4 w-4 border-2 border-zinc-600 dark:border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <svg viewBox="0 0 48 48" className="w-5 h-5">
                        <path
                          fill="#EA4335"
                          d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                        />
                        <path
                          fill="#4285F4"
                          d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                        />
                        <path
                          fill="#34A853"
                          d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                        />
                      </svg>
                    )}
                    <span className="font-medium">Continue with Google</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                New user?{' '}
                <span className="text-violet-600 dark:text-violet-400">
                  Sign in with Google to create an account
                </span>
              </p>
            </div>
          </div>

          {/* Features section moved up */}
          <div className="w-full max-w-5xl mx-auto px-4">
            <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-50 text-center mb-8">
              Why producers love WavTrack
            </h2>
            <FeatureHighlights />
          </div>
        </div>

        <Footer />
      </main>
    </div>
  )
}

export default Login
