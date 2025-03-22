import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { AtSign, Lock, ArrowRight, Github, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import Footer from '@/components/Footer';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { FeatureHighlights } from '@/components/features/FeatureHighlights';
import { cn } from '@/lib/utils';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || '/';
  
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from);
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate(from);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    try {
      setSocialLoading(provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`Failed to sign in with ${provider}`);
      setSocialLoading('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeSwitcher />
      </div>

      <main className="flex min-h-screen flex-col">
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
          {/* Login Content */}
          <div className="w-full max-w-md relative space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Enter your credentials to access your account
              </p>
            </div>

            <Card className="shadow-lg bg-card border-zinc-200/50 dark:border-zinc-800/50">
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
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
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                        <Lock className="h-4 w-4" />
                      </div>
                      <Input
                        id="password"
                        placeholder="••••••••"
                        type="password"
                        autoCapitalize="none"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
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
                  <div className="relative bg-card px-2 text-xs text-zinc-500">
                    Or continue with
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="flex items-center justify-center gap-2"
                    onClick={() => handleSocialLogin('github')}
                    disabled={!!socialLoading}
                  >
                    {socialLoading === 'github' ? (
                      <div className="h-4 w-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Github className="h-4 w-4" />
                    )}
                    GitHub
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    type="button" 
                    className="flex items-center justify-center gap-2"
                    onClick={() => handleSocialLogin('google')}
                    disabled={!!socialLoading}
                  >
                    {socialLoading === 'google' ? (
                      <div className="h-4 w-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                    Google
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <div className="text-center">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        <div className="pt-8 pb-4 md:pt-12 md:pb-8 text-center">
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-10">
            Why producers love WavTrack
          </h2>
          <div className="w-full max-w-5xl mx-auto px-4">
            <FeatureHighlights />
          </div>
        </div>
        
        <Footer />
      </main>
    </div>
  );
};

export default Login;
