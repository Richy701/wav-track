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

const SignIn1 = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [socialLoading, setSocialLoading] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
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
        <Logo className="mb-6 scale-150" />
        {/* Form */}
        <div className="flex flex-col w-full gap-4">
          <div className="w-full flex flex-col gap-3">
            <Input
              placeholder="Email"
              type="email"
              value={email}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/60"
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              className="w-full px-5 py-3 rounded-xl bg-white/10 text-white placeholder-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/60"
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <div className="text-sm text-red-400 text-left">{error}</div>
            )}
          </div>
          <Button
            onClick={handleSignIn}
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
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>

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
        </div>
      </div>
    </div>
  )
}

export { SignIn1 } 