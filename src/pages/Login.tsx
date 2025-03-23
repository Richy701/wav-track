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

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState('')
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from || '/'

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from)
    }
  }, [isAuthenticated, navigate, from])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(email, password)
      if (success) {
        trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, { page: 'dashboard', type: 'regular_login' })
        navigate(from)
      }
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
          redirectTo: `${window.location.origin}/wav-track/auth/callback`,
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

  const handleGuestLogin = async () => {
    try {
      setSocialLoading('guest')
      trackEvent(ANALYTICS_EVENTS.GUEST_LOGIN)
      // Generate a random guest email
      const guestId = Math.random().toString(36).substring(2, 15)
      const guestEmail = `guest_${guestId}@temporary.wavtrack.com`
      const guestPassword = Math.random().toString(36).substring(2, 15)

      // Create a new user with guest metadata
      const {
        data: { user },
        error: signUpError,
      } = await supabase.auth.signUp({
        email: guestEmail,
        password: guestPassword,
        options: {
          data: {
            isGuest: true,
            guestExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
          },
        },
      })

      if (signUpError) throw signUpError

      // Sign in with the guest credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: guestEmail,
        password: guestPassword,
      })

      if (signInError) throw signInError

      trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, { page: 'dashboard', type: 'guest_login' })
      navigate(from)
    } catch (error) {
      console.error('Guest login error:', error)
      toast.error('Failed to create guest account')
    } finally {
      setSocialLoading('')
    }
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
                      <span className="flex items-center justify-center gap-1">
                        Sign in <ArrowRight className="h-4 w-4 ml-1" />
                      </span>
                    )}
                  </Button>
                </form>

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
                      'w-full flex items-center justify-center gap-2',
                      'border-zinc-200 hover:bg-zinc-50',
                      'dark:border-zinc-800 dark:hover:bg-zinc-800/50'
                    )}
                    onClick={handleSocialLogin}
                    disabled={!!socialLoading}
                  >
                    {socialLoading === 'google' ? (
                      <div className="h-4 w-4 border-2 border-zinc-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    Continue with Google
                  </Button>

                  <Button
                    variant="ghost"
                    type="button"
                    className={cn(
                      'w-full flex items-center justify-center gap-2',
                      'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/50',
                      'dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-800/30',
                      'border border-dashed border-zinc-200 dark:border-zinc-800',
                      'transition-colors duration-200'
                    )}
                    onClick={handleGuestLogin}
                    disabled={!!socialLoading}
                  >
                    {socialLoading === 'guest' ? (
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin opacity-70"></div>
                    ) : (
                      <User className="h-4 w-4 opacity-70" />
                    )}
                    Continue as Guest
                  </Button>
                  <p className="text-xs text-center text-zinc-500 dark:text-zinc-400">
                    Guest accounts expire after 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 hover:underline"
                >
                  Sign up
                </Link>
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
