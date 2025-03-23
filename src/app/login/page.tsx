import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { authService } from '@/lib/services/auth'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await authService.signIn(email, password)
      if (error) throw error
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGuestLogin = async () => {
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await authService.signInAsGuest()
      if (error) throw error
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in as guest')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F0C1D]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center items-center space-x-2">
            <Image src="/logo.svg" alt="WavTrack Logo" width={40} height={40} />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
              WavTrack
            </h1>
            <span className="text-xs text-zinc-500 mt-1">BETA</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">Welcome back</h2>
          <p className="text-sm text-zinc-400">
            Track your music production sessions, set goals, and improve your workflow
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="sr-only">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="bg-[#1A1625] border-zinc-800 text-white placeholder:text-zinc-600"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="sr-only">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-purple-400 hover:text-purple-300"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="bg-[#1A1625] border-zinc-800 text-white placeholder:text-zinc-600"
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-500"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <div className="space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-[#0F0C1D] text-zinc-500">Or continue with</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full border-zinc-800 text-white hover:bg-zinc-800"
              onClick={() => {
                /* Google sign in */
              }}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full border-zinc-800 text-white hover:bg-zinc-800"
              onClick={handleGuestLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating guest account...
                </>
              ) : (
                'Continue as Guest'
              )}
            </Button>
          </div>
        </div>

        <p className="text-center text-sm text-zinc-500">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-purple-400 hover:text-purple-300">
            Sign up
          </Link>
        </p>
      </div>

      <div className="mt-16">
        <h3 className="text-xl font-semibold text-white mb-6">Why producers love WavTrack</h3>
        <div className="bg-[#1A1625] rounded-lg p-6 max-w-md">
          <div className="flex items-start space-x-4">
            <div className="bg-purple-600/20 p-2 rounded-lg">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-white font-medium">Streamline Your Workflow</h4>
              <p className="text-zinc-400 text-sm mt-1">
                Organize all your beats and tracks in one central workspace
              </p>
              <p className="text-zinc-500 text-sm mt-4">
                Producers save 5+ hours weekly on project management
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
