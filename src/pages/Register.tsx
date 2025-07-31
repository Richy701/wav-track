import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SignInPage } from '@/components/ui/sign-in'
import LoadingScreen from '@/components/LoadingScreen'

const Register = () => {
  const { isAuthenticated, isLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from || '/dashboard'

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, isLoading, navigate, from])

  if (isLoading) {
    return <LoadingScreen message="Checking authentication..." />
  }

  // This page now shows the waitlist form (SignInPage with isWaitlist=true based on /register path)
  return <SignInPage />
}

export default Register