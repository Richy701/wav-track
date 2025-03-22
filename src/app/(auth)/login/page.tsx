import { LoginForm } from '@/components/auth/LoginForm';
import { FeatureList } from '@/components/features/FeatureList';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Welcome back
          </h1>
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
  );
} 