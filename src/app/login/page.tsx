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
              className="w-full bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 transition-colors flex items-center justify-center gap-2 py-5"
              onClick={() => {
                /* Google sign in */
              }}
            >
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
              <span className="font-medium">Continue with Google</span>
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
