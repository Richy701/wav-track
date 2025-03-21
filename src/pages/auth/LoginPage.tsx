import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { LoginForm } from '@/components/auth/LoginForm';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
} from 'lucide-react';
import { FeatureHighlights } from '@/components/features/FeatureHighlights';

export default function LoginPage() {
  return (
    <main className="flex flex-col lg:flex-row min-h-screen bg-black">
      <div className={cn(
        "relative w-full lg:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8",
        "bg-background"
      )}>
        <div className="w-full max-w-sm space-y-6 relative">
          <div className="text-center mb-4">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-transparent bg-clip-text">
              WavTrack
            </h1>
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
              Don&apos;t have an account?{' '}
              <Link 
                to="/register" 
                className="text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center"
              >
                Sign up 
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      <div className={cn(
        "w-full lg:w-1/2 p-4 sm:p-8 flex items-center justify-center",
        "bg-gradient-to-b from-violet-950 via-indigo-950 to-purple-950",
        "min-h-full"
      )}>
        <div className="w-full max-w-lg py-8">
          <FeatureHighlights />
        </div>
      </div>
    </main>
  );
} 