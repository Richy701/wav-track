import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { addToWaitlist } from '@/lib/waitlist';
import { toast } from '@/components/ui/use-toast';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);

// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-zinc-200 bg-white/60 backdrop-blur-sm transition-all duration-300 focus-within:border-violet-500 focus-within:bg-white/80 focus-within:shadow-lg focus-within:shadow-violet-500/20 dark:border-zinc-700 dark:bg-zinc-800/40 dark:focus-within:border-violet-400 dark:focus-within:bg-zinc-800/60">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-2xl bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-white/20 dark:border-zinc-700/50 p-4 w-64 shadow-xl`}>
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-xl ring-2 ring-white/20" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-semibold text-zinc-900 dark:text-white">{testimonial.name}</p>
      <p className="text-zinc-600 dark:text-zinc-400 text-xs">{testimonial.handle}</p>
      <p className="mt-1 text-zinc-700 dark:text-zinc-300">{testimonial.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-light text-foreground tracking-tighter">Welcome to WavTrack</span>,
  description = "Track your music production journey with powerful analytics and insights",
  heroImageSrc = "/images/studio/chuck-fortner-LFVBohYmtgc-unsplash.jpg",
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle } = useAuth();
  
  const [showPassword, setShowPassword] = useState(false);
  const [isWaitlist, setIsWaitlist] = useState(location.pathname === '/register');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState("");
  
  const from = location.state?.from || "/dashboard";

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const success = await login(email, password);
      if (!success) {
        setError("Invalid email or password");
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleWaitlistSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name || !email) {
      setError("Please fill in all fields.");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { error: waitlistError } = await addToWaitlist(email);
      
      if (waitlistError) {
        if (waitlistError.code === 'DUPLICATE_EMAIL') {
          setError("You're already on our waitlist! We'll be in touch soon.");
        } else {
          setError("Failed to join waitlist. Please try again.");
        }
      } else {
        toast({
          title: "Welcome to the waitlist!",
          description: "We'll notify you when your account is ready. Thanks for your interest in WavTrack!",
        });
        // Clear the form
        setName("");
        setEmail("");
        setError("");
      }
    } catch (err) {
      console.error("Waitlist error:", err);
      setError("Failed to join waitlist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setSocialLoading("google");
    try {
      const success = await loginWithGoogle();
      if (success) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast({
        variant: "destructive",
        title: "Failed to sign in with Google",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
      setSocialLoading("");
    }
  };

  const toggleMode = () => {
    setIsWaitlist(!isWaitlist);
    setError("");
    setEmail("");
    setPassword("");
    setName("");
  };

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw] bg-white dark:bg-purple-950/10 bg-none dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-8 relative">
        
        <div className="w-full max-w-md relative z-10">
          <div className="flex flex-col gap-8">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <h1 className="text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">
                WavTrack
              </h1>
            </div>
            
            <div className="text-center">
              <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">{title}</h1>
              <p className="animate-element animate-delay-200 text-zinc-600 dark:text-zinc-400 mt-3 text-lg">{description}</p>
            </div>

            {/* Toggle between Sign In and Join Waitlist */}
            <div className="flex w-full rounded-2xl bg-white/80 dark:bg-zinc-800/80 backdrop-blur-sm p-1 border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <button
                onClick={() => !isWaitlist || toggleMode()}
                className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  !isWaitlist
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                    : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => isWaitlist || toggleMode()}
                className={`flex-1 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 ${
                  isWaitlist
                    ? "bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg"
                    : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-700"
                }`}
              >
                Join Waitlist
              </button>
            </div>

            <form className="space-y-5" onSubmit={isWaitlist ? handleWaitlistSubmit : handleSignIn}>
              {isWaitlist && (
                <div className="animate-element animate-delay-300">
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <GlassInputWrapper>
                    <input 
                      name="name" 
                      type="text" 
                      placeholder="Enter your full name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400" 
                    />
                  </GlassInputWrapper>
                </div>
              )}

              <div className="animate-element animate-delay-400">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <GlassInputWrapper>
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="Enter your email address" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400" 
                  />
                </GlassInputWrapper>
              </div>

              {!isWaitlist && (
                <div className="animate-element animate-delay-500">
                  <label className="text-sm font-medium text-muted-foreground">Password</label>
                  <GlassInputWrapper>
                    <div className="relative">
                      <input 
                        name="password" 
                        type={showPassword ? 'text' : 'password'} 
                        placeholder="Enter your password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none text-zinc-900 dark:text-white placeholder-zinc-500 dark:placeholder-zinc-400" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute inset-y-0 right-3 flex items-center"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" /> : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />}
                      </button>
                    </div>
                  </GlassInputWrapper>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-500 text-left animate-element animate-delay-600">{error}</div>
              )}

              {!isWaitlist && (
                <div className="animate-element animate-delay-600 flex items-center justify-between text-sm">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" name="rememberMe" className="custom-checkbox" />
                    <span className="text-foreground/90">Keep me signed in</span>
                  </label>
                  <a href="#" onClick={(e) => { e.preventDefault(); onResetPassword?.(); }} className="hover:underline text-violet-400 transition-colors">Reset password</a>
                </div>
              )}

              <button 
                type="submit" 
                disabled={isLoading}
                className="animate-element animate-delay-700 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 py-4 font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:shadow-violet-500/25 transform hover:scale-[1.02]"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isWaitlist ? "Joining waitlist..." : "Signing in..."}
                  </div>
                ) : (
                  isWaitlist ? "Join Waitlist" : "Sign In"
                )}
              </button>
            </form>

            {/* Only show Google sign-in for existing users */}
            {!isWaitlist && (
              <>
                <div className="animate-element animate-delay-800 relative flex items-center justify-center">
                  <span className="w-full border-t border-zinc-300 dark:border-zinc-700"></span>
                  <span className="px-4 text-sm text-muted-foreground bg-white dark:bg-zinc-900 absolute">Or continue with</span>
                </div>

                <button 
                  onClick={handleGoogleLogin} 
                  disabled={!!socialLoading}
                  className="animate-element animate-delay-900 w-full flex items-center justify-center gap-3 border border-zinc-200 dark:border-zinc-700 rounded-2xl py-4 hover:bg-white/80 dark:hover:bg-zinc-800/80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm shadow-sm hover:shadow-md"
                >
                  {socialLoading === "google" ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-zinc-600 mr-2"></div>
                      Connecting...
                    </>
                  ) : (
                    <>
                      <GoogleIcon />
                      Continue with Google
                    </>
                  )}
                </button>
              </>
            )}



            {!isWaitlist && (
              <p className="animate-element animate-delay-1000 text-center text-sm text-muted-foreground">
                New to WavTrack? <a href="#" onClick={(e) => { e.preventDefault(); toggleMode(); }} className="text-violet-400 hover:underline transition-colors">Join our waitlist</a>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-6">
          <div className="animate-slide-right animate-delay-300 absolute inset-6 rounded-3xl bg-cover bg-center shadow-2xl" style={{ backgroundImage: `url(${heroImageSrc})` }}></div>

          {testimonials.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
              <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />
              {testimonials[1] && <div className="hidden xl:flex"><TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" /></div>}
              {testimonials[2] && <div className="hidden 2xl:flex"><TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" /></div>}
            </div>
          )}
        </section>
      )}
    </div>
  );
}; 