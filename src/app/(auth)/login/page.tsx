import { LoginForm } from '@/components/auth/LoginForm'
import { FeatureList } from '@/components/features/FeatureList'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-2xl font-semibold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
              WavTrack
            </h1>
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full tracking-wide',
                'transition-colors duration-200',
                'bg-violet-100 text-violet-600 border border-violet-200',
                'dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20'
              )}
            >
              BETA
            </span>
          </div>
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Welcome back</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to your account to continue
          </p>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Don't have an account?{' '}
          <Link
            href="/create-account"
            className="font-medium text-primary hover:text-primary/90 transition-colors"
          >
            Create one
          </Link>
        </p>

        {/* Features section */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <h2 className="text-center text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-6">
            Why choose WavTrack?
          </h2>
          <FeatureList />
        </div>
      </div>
    </div>
  )
}
