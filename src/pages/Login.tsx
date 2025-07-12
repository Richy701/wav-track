import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { SignIn1 } from '@/components/ui/modern-stunning-sign-in'
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

  return <SignIn1 />
}

export default Login
