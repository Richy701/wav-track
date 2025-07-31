"use client"

import * as React from "react"
import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Logo } from "@/components/logo"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase"
import { toast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics"
import { Label } from "@/components/ui/label"
import { addToWaitlist } from "@/lib/waitlist"

const SignIn1 = () => {
  const location = useLocation()
  const [isWaitlist, setIsWaitlist] = useState(location.pathname === '/register')
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState("")
  const navigate = useNavigate()
  const { login, loginWithGoogle } = useAuth()

  const from = location.state?.from || "/dashboard"

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }
 
  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please enter both email and password.")
      return
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const success = await login(email, password)
      if (!success) {
        setError("Invalid email or password")
      } else {
        navigate(from, { replace: true })
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Failed to sign in")
    } finally {
      setIsLoading(false)
    }
  }

  const handleWaitlistSubmit = async () => {
    if (!name || !email) {
      setError("Please fill in all fields.")
      return
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address.")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const { error: waitlistError } = await addToWaitlist(email)
      
      if (waitlistError) {
        if (waitlistError.code === 'DUPLICATE_EMAIL') {
          setError("You're already on our waitlist! We'll be in touch soon.")
        } else {
          setError("Failed to join waitlist. Please try again.")
        }
      } else {
        toast({
          title: "Welcome to the waitlist!",
          description: "We'll notify you when your account is ready. Thanks for your interest in WavTrack!",
        })
        // Clear the form
        setName("")
        setEmail("")
        setError("")
      }
    } catch (err) {
      console.error("Waitlist error:", err)
      setError("Failed to join waitlist. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    if (isWaitlist) {
      handleWaitlistSubmit()
    } else {
      handleSignIn()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSubmit()
    }
  }

  const toggleMode = () => {
    setIsWaitlist(!isWaitlist)
    setError("")
    setEmail("")
    setPassword("")
    setName("")
  }

  const handleGoogleLogin = async () => {
    setSocialLoading("google")
    try {
      trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, { page: "dashboard", type: "google_login" })
      const success = await loginWithGoogle()
      if (success) {
        navigate(from, { replace: true })
      }
    } catch (error) {
      console.error("Google login error:", error)
      toast({
        variant: "destructive",
        title: "Failed to sign in with Google",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      })
      setSocialLoading("")
    }
  }
 
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] relative overflow-hidden w-full rounded-xl">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-violet-500/[0.15] to-transparent" />
      <div className="absolute -top-[40rem] left-1/2 -translate-x-1/2 w-[80rem] h-[80rem] bg-gradient-to-b from-violet-500/20 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20" />

      {/* Centered glass card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-gradient-to-r from-zinc-800/50 to-zinc-900/50 backdrop-blur-sm shadow-2xl p-8 flex flex-col items-center">
        {/* Logo */}
        <Logo className="mb-4 scale-150" />
        
        {/* Toggle between Sign In and Join Waitlist */}
        <div className="flex mb-6 w-full rounded-xl bg-white/5 p-1">
          <button
            onClick={() => !isWaitlist || toggleMode()}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              !isWaitlist
                ? "bg-violet-600 text-white shadow-sm"
                : "text-gray-300 hover:text-white"
            )}
          >
            Sign In
          </button>
          <button
            onClick={() => isWaitlist || toggleMode()}
            className={cn(
              "flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              isWaitlist
                ? "bg-violet-600 text-white shadow-sm"
                : "text-gray-300 hover:text-white"
            )}
          >
            Join Waitlist
          </button>
        </div>
        
        {/* Helper text */}
        <p className="text-xs text-gray-400 text-center mb-4">
          {isWaitlist ? "Join our waitlist to get early access when we launch" : "Welcome back! Sign in to your account"}
        </p>

        {/* Form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            {isWaitlist && (
              <Input
                placeholder="Full Name"
                type="text"
                value={name}
                className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/60"
                onChange={(e) => setName(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            )}
            <Input
              placeholder="Email"
              type="email"
              value={email}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/60"
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            {!isWaitlist && (
              <Input
                placeholder="Password"
                type="password"
                value={password}
                className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/60"
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            )}
            {error && (
              <div className="text-sm text-red-400 text-left">{error}</div>
            )}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            variant="default"
            size="lg"
            className={cn(
              "w-full bg-violet-600 hover:bg-violet-700 text-white",
              "transition-colors duration-200",
              "rounded-xl font-medium"
            )}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                {isWaitlist ? "Joining waitlist..." : "Signing in..."}
              </>
            ) : (
              isWaitlist ? "Join Waitlist" : "Sign In"
            )}
          </Button>

          {/* Only show Google sign-in for existing users */}
          {!isWaitlist && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-zinc-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#121212] px-2 text-zinc-500">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={handleGoogleLogin}
                disabled={!!socialLoading}
                className={cn(
                  "w-full bg-white/10 hover:bg-white/20 text-white",
                  "border-zinc-700 hover:border-violet-500/50",
                  "transition-colors duration-200",
                  "rounded-xl font-medium"
                )}
              >
                {socialLoading === "google" ? (
                  <>
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <img src="/assets/google.svg" alt="Google" className="w-5 h-5 mr-2" />
                    Continue with Google
                  </>
                )}
              </Button>
            </>
          )}

          {/* Waitlist additional info */}
          {isWaitlist && (
            <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
              <p className="text-xs text-gray-300 text-center">
                <span className="text-violet-400">✨</span> We're currently in private beta. 
                Join the waitlist and we'll send you an invite when we're ready!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export { SignIn1 }