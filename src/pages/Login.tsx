import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AtSign, Lock, ArrowRight, Github, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import Footer from '@/components/Footer';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the target location from state, or default to main page
  const from = location.state?.from || '/';
  
  // Redirect if already authenticated
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeSwitcher />
      </div>

      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-br from-primary/10 via-primary/[0.02] to-transparent blur-3xl dark:from-primary/10 dark:via-primary/[0.02]" />
          <div className="absolute -bottom-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tl from-primary/10 via-primary/[0.02] to-transparent blur-3xl dark:from-primary/10 dark:via-primary/[0.02]" />
        </div>

        <div className="w-full max-w-[380px] sm:max-w-md relative">
          {/* Logo Section */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-2 sm:mb-3 bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">
              WavTrack
            </h1>
            <div className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2">
              <p className="text-xl sm:text-2xl text-zinc-800 dark:text-zinc-200 font-medium animate-fade-in">
                Welcome
              </p>
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 animate-fade-in delay-100">
                Sign in to continue your music journey
              </p>
            </div>
          </div>

          <Card className="border-black/5 dark:border-white/5 shadow-xl dark:shadow-primary/10 bg-white/70 dark:bg-black/20 backdrop-blur-sm relative overflow-hidden">
            <form onSubmit={handleSubmit} className="relative">
              <CardContent className="space-y-4 p-4 sm:p-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium inline-flex items-center text-zinc-800 dark:text-zinc-200">
                    Email address
                  </Label>
                  <div className="relative group">
                    <AtSign className="absolute left-3 top-3 h-4 w-4 text-zinc-500 dark:text-zinc-400 transition-colors group-focus-within:text-primary" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white dark:bg-black/40 border-zinc-200/50 dark:border-white/10 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 transition-all focus:bg-white dark:focus:bg-black/60 focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(var(--primary),0.15)]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium inline-flex items-center text-zinc-800 dark:text-zinc-200">
                      Password
                    </Label>
                    <Link 
                      to="/forgot-password" 
                      className="text-xs text-primary hover:text-primary/90 transition-colors hover:underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1.5 py-0.5"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-500 dark:text-zinc-400 transition-colors group-focus-within:text-primary" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 bg-white dark:bg-black/40 border-zinc-200/50 dark:border-white/10 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 transition-all focus:bg-white dark:focus:bg-black/60 focus:border-primary/50 focus:shadow-[0_0_0_3px_rgba(var(--primary),0.15)]"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200/50 dark:border-white/10" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white/70 dark:bg-black/20 px-4 text-zinc-500 dark:text-zinc-400">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => handleSocialLogin('github')}
                    disabled={!!socialLoading}
                    className="bg-background hover:bg-accent text-foreground hover:text-accent-foreground border border-input hover:border-accent transition-all focus:shadow-[0_0_0_3px_rgba(var(--primary),0.15)] active:scale-[0.98]"
                  >
                    {socialLoading === 'github' ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <>
                        <Github className="h-4 w-4 mr-2" />
                        <span>Github</span>
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => handleSocialLogin('google')}
                    disabled={!!socialLoading}
                    className="bg-background hover:bg-accent text-foreground hover:text-accent-foreground border border-input hover:border-accent transition-all focus:shadow-[0_0_0_3px_rgba(var(--primary),0.15)] active:scale-[0.98]"
                  >
                    {socialLoading === 'google' ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        <span>Google</span>
                      </>
                    )}
                  </Button>
                </div>

                <Button 
                  type="submit" 
                  className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-300 shadow-lg shadow-primary/10 hover:shadow-xl hover:shadow-primary/20"
                  disabled={isLoading || !!socialLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      <span>Signing in...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center group">
                      <span>Sign in</span>
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  )}
                </Button>
              </CardContent>
            </form>
          </Card>

          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                className="text-primary hover:text-primary/90 transition-colors hover:underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded px-1.5 py-0.5"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Subscription Banner */}
      <div className="relative">
        <div className="max-w-[380px] sm:max-w-md mx-auto px-4 pb-6 sm:pb-8">
          <div className="relative bg-white/80 dark:bg-black/20 backdrop-blur-md border border-zinc-200/50 dark:border-white/5 rounded-xl p-6 sm:p-8 overflow-hidden text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-tr from-zinc-50/50 via-white/50 to-zinc-50/50 dark:from-primary/10 dark:via-transparent dark:to-primary/5" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/80 to-transparent dark:via-background/50 opacity-50" />
            <div className="absolute -left-32 -top-32 w-64 h-64 bg-primary/[0.03] dark:bg-primary/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -right-32 -bottom-32 w-64 h-64 bg-primary/[0.03] dark:bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
            
            <div className="relative">
              <div className="mb-4 sm:mb-6">
                <div className="text-xs sm:text-sm uppercase tracking-wider text-primary/90 font-semibold mb-2">
                  Coming Soon
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-zinc-800 dark:bg-gradient-to-r dark:from-primary/90 dark:via-primary dark:to-primary/90 dark:bg-clip-text dark:text-transparent">
                  Level Up Your Workflow
                </h3>
              </div>
              
              <div className="h-px w-12 sm:w-16 mx-auto bg-gradient-to-r from-transparent via-zinc-300 to-transparent dark:via-primary/30 mb-4 sm:mb-6" />
              
              <p className="text-sm text-zinc-600 dark:text-muted-foreground/80 max-w-sm mx-auto font-medium">
                Advanced analytics, collaboration tools, and deeper insights into your production journey.
                <span className="block mt-1 text-primary/90 dark:text-primary/80">Premium features in development.</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
