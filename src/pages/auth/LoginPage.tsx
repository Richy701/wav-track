import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import LoginForm from '@/components/auth/LoginForm'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'

export default function LoginPage() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <div className="w-full max-w-sm space-y-6 relative">
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
              WavTrack
            </h1>
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full tracking-wide',
                'transition-colors duration-200',
                isDark
                  ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                  : 'bg-violet-100 text-violet-600 border border-violet-200'
              )}
            >
              BETA
            </span>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Sign in to continue to your account
          </p>
        </div>

        <Card className="border-zinc-200/80 dark:border-zinc-800/80 shadow-md">
          <CardContent className="pt-6">
            <LoginForm />
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
    </main>
  )
}
