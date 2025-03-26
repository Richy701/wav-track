import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { useProjects } from '@/hooks/useProjects'
import UserAvatar from '@/components/UserAvatar'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import CreateProjectDialog from '@/components/project/CreateProjectDialog'
import { Plus, Wrench } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { getProjects } from '@/lib/data'
import { Spinner } from '@/components/ui/spinner'

interface HeaderActionsProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export default function HeaderActions({
  orientation = 'horizontal',
  className,
}: HeaderActionsProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoading: authLoading, isInitialized } = useAuth()
  const { projects } = useProjects()
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [currentPath, setCurrentPath] = useState(location.pathname)
  const navigationTimeoutRef = useRef<NodeJS.Timeout>()

  // Reset navigation state when path changes
  useEffect(() => {
    if (location.pathname !== currentPath) {
      setCurrentPath(location.pathname)
      setIsNavigating(false)
    }
  }, [location.pathname, currentPath])

  const handleNavigate = useCallback((path: string) => {
    // Clear any existing timeout
    if (navigationTimeoutRef.current) {
      clearTimeout(navigationTimeoutRef.current)
    }

    setIsNavigating(true)
    navigationTimeoutRef.current = setTimeout(() => {
      navigate(path)
    }, 300) // 300ms debounce
  }, [navigate])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (navigationTimeoutRef.current) {
        clearTimeout(navigationTimeoutRef.current)
      }
    }
  }, [])

  const isMainPage = location.pathname === '/'

  const items = [
    { label: 'Sessions', href: '/sessions' },
    { label: 'Profile', href: '/profile' },
    { label: 'Settings', href: '/profile/settings' },
  ]

  // Don't render navigation items while auth is initializing
  if (authLoading || !isInitialized) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Spinner className="h-4 w-4" />
      </div>
    )
  }

  return (
    <nav
      className={cn(
        'flex',
        orientation === 'vertical' ? 'flex-col space-y-2' : 'items-center space-x-4',
        className
      )}
    >
      {items.map(item => (
        <Button
          key={item.href}
          variant="ghost"
          asChild
          className={cn(orientation === 'vertical' && 'w-full justify-start')}
          disabled={isNavigating}
        >
          <Link 
            to={item.href} 
            onClick={(e) => {
              e.preventDefault()
              handleNavigate(item.href)
            }}
          >
            {isNavigating && location.pathname === item.href ? (
              <div className="flex items-center gap-2">
                <Spinner className="h-4 w-4" />
                <span>Loading...</span>
              </div>
            ) : (
              item.label
            )}
          </Link>
        </Button>
      ))}

      <div
        className={cn('flex items-center gap-2', orientation === 'vertical' ? 'self-start' : '')}
      >
        <ThemeSwitcher />
        {user && <UserAvatar />}
      </div>

      {user ? (
        <>
          {isMainPage && (
            <Button
              variant="default"
              className={cn('rounded-xl px-6 py-2', orientation === 'vertical' ? 'w-full' : '')}
              onClick={() => setIsCreateProjectOpen(true)}
            >
              <Plus weight="bold" className="h-4 w-4 mr-2" />
              New Project
            </Button>
          )}
        </>
      ) : (
        <>
          <Button
            variant="ghost"
            className={orientation === 'vertical' ? 'w-full justify-start' : ''}
            onClick={() => handleNavigate('/login')}
          >
            Login
          </Button>
          <Button
            variant="default"
            className={orientation === 'vertical' ? 'w-full' : ''}
            onClick={() => handleNavigate('/register')}
          >
            Register
          </Button>
        </>
      )}

      {isMainPage && (
        <CreateProjectDialog
          isOpen={isCreateProjectOpen}
          onOpenChange={setIsCreateProjectOpen}
          projectsCount={projects.length}
        />
      )}
    </nav>
  )
}
