import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SignInPage } from '@/components/ui/sign-in'
import LoadingScreen from '@/components/LoadingScreen'

const Login = () => {
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

  return <SignInPage />
}

export default Login
