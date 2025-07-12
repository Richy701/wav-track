"use client"

import React, { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { Home, User, Trophy, Settings, BarChart3, LogIn, UserPlus, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from '@/contexts/AuthContext'
import UserAvatar from '@/components/UserAvatar'
import ThemeSwitcher from '@/components/ThemeSwitcher'
import { Button } from '@/components/ui/button'
import CreateProjectDialog from '@/components/project/CreateProjectDialog'
import { Spinner } from '@/components/ui/spinner'

export function TubelightNavbar({ 
  className, 
  isMobileMenu = false, 
  onNavigate 
}: { 
  className?: string, 
  isMobileMenu?: boolean,
  onNavigate?: () => void 
}) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isLoading: authLoading, isInitialized } = useAuth()
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(location.pathname)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [isNavigating, setIsNavigating] = useState(false)
  const navigationTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    setActiveTab(location.pathname)
  }, [location.pathname])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleNavigate = useCallback((path: string) => {
    if (path === location.pathname) return
    if (navigationTimeoutRef.current) clearTimeout(navigationTimeoutRef.current)
    setIsNavigating(true)
    navigationTimeoutRef.current = setTimeout(() => {
      navigate(path)
      setIsNavigating(false)
    }, 300)
  }, [navigate, location.pathname])

  // Close mobile menu when navigating (if in mobile menu context)
  const handleMobileNavigate = useCallback((path: string) => {
    handleNavigate(path)
    // Close mobile menu after navigation
    if (isMobileMenu && onNavigate) {
      setTimeout(() => {
        onNavigate()
      }, 100)
    }
  }, [handleNavigate, isMobileMenu, onNavigate])

  // Main nav items
  const navItems = [
    { name: 'Dashboard', url: '/dashboard', icon: BarChart3 },
    { name: 'Sessions', url: '/sessions', icon: Home },
    { name: 'Achievements', url: '/achievements', icon: Trophy },
    { name: 'Profile', url: '/profile', icon: User },
    { name: 'Settings', url: '/profile/settings', icon: Settings },
  ]

  // Loading state
  if (authLoading || !isInitialized) {
    return (
      <div className={cn("w-full top-0 left-0 z-50 flex items-center gap-2", className)}>
        <Spinner className="h-4 w-4" />
      </div>
    )
  }

  // Mobile menu layout
  if (isMobileMenu) {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex flex-col space-y-2">
          {/* Home button */}
          <Button
            variant="ghost"
            className={cn(
              "relative cursor-pointer text-sm font-semibold px-4 py-3 rounded-lg transition-colors w-full justify-start",
              "text-foreground/80 hover:text-[#8257E5] dark:hover:text-[#E4D5FF]",
              location.pathname === '/' && "bg-[#8257E5]/10 dark:bg-[#8257E5]/20 text-[#8257E5] dark:text-[#E4D5FF]"
            )}
            onClick={() => isMobileMenu ? handleMobileNavigate('/') : handleNavigate('/')}
            disabled={location.pathname === '/'}
          >
            <Home className="h-5 w-5 mr-3" />
            <span>Home</span>
          </Button>
          
          {/* Main nav items */}
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.url
            return (
              <Button
                key={item.url}
                variant="ghost"
                className={cn(
                  "relative cursor-pointer text-sm font-semibold px-4 py-3 rounded-lg transition-colors w-full justify-start",
                  "text-foreground/80 hover:text-[#8257E5] dark:hover:text-[#E4D5FF]",
                  isActive && "bg-[#8257E5]/10 dark:bg-[#8257E5]/20 text-[#8257E5] dark:text-[#E4D5FF]"
                )}
                onClick={() => isMobileMenu ? handleMobileNavigate(item.url) : handleNavigate(item.url)}
                disabled={isActive || isNavigating}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span>{item.name}</span>
              </Button>
            )
          })}
        </div>
      </div>
    )
  }

  // Desktop layout
  return (
    <div className={cn("top-0 left-0 z-50 relative", className)}>
      <div className="inline-flex max-w-fit mx-auto items-center gap-3 bg-gradient-to-r from-[#8257E5]/5 via-[#9B6FFF]/5 to-[#B490FF]/5 dark:from-[#8257E5]/10 dark:via-[#9B6FFF]/10 dark:to-[#B490FF]/10 border border-[#8257E5]/20 dark:border-[#8257E5]/30 backdrop-blur-lg py-1 px-1 rounded-full shadow-lg">
        {/* Home button */}
        <Button
          variant="ghost"
          className={cn(
            "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
            "text-foreground/80 hover:text-[#8257E5] dark:hover:text-[#E4D5FF]",
            location.pathname === '/' && "bg-[#8257E5]/10 dark:bg-[#8257E5]/20 text-[#8257E5] dark:text-[#E4D5FF]"
          )}
          onClick={() => isMobileMenu ? handleMobileNavigate('/') : handleNavigate('/')}
          disabled={location.pathname === '/'}
        >
          <Home className="md:hidden" size={18} strokeWidth={2.5} />
          <span className="hidden md:inline">Home</span>
          {location.pathname === '/' && (
            <motion.div
              layoutId="lamp"
              className="absolute inset-0 w-full bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 dark:from-[#8257E5]/20 dark:to-[#B490FF]/20 rounded-full -z-10"
              initial={false}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-[#8257E5] to-[#B490FF] rounded-t-full">
                <div className="absolute w-12 h-6 bg-gradient-to-r from-[#8257E5]/20 to-[#B490FF]/20 rounded-full blur-md -top-2 -left-2" />
                <div className="absolute w-8 h-6 bg-gradient-to-r from-[#8257E5]/20 to-[#B490FF]/20 rounded-full blur-md -top-1" />
                <div className="absolute w-4 h-4 bg-gradient-to-r from-[#8257E5]/20 to-[#B490FF]/20 rounded-full blur-sm top-0 left-2" />
              </div>
            </motion.div>
          )}
        </Button>
        {/* Main nav items */}
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.url
          return (
            <Button
              key={item.url}
              variant="ghost"
              className={cn(
                "relative cursor-pointer text-sm font-semibold px-6 py-2 rounded-full transition-colors",
                "text-foreground/80 hover:text-[#8257E5] dark:hover:text-[#E4D5FF]",
                isActive && "bg-[#8257E5]/10 dark:bg-[#8257E5]/20 text-[#8257E5] dark:text-[#E4D5FF]"
              )}
              onClick={() => isMobileMenu ? handleMobileNavigate(item.url) : handleNavigate(item.url)}
              disabled={isActive || isNavigating}
            >
              <span className="hidden md:inline">{item.name}</span>
              <span className="md:hidden"><Icon size={18} strokeWidth={2.5} /></span>
              {isActive && (
                <motion.div
                  layoutId="lamp"
                  className="absolute inset-0 w-full bg-gradient-to-r from-[#8257E5]/10 to-[#B490FF]/10 dark:from-[#8257E5]/20 dark:to-[#B490FF]/20 rounded-full -z-10"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-[#8257E5] to-[#B490FF] rounded-t-full">
                    <div className="absolute w-12 h-6 bg-gradient-to-r from-[#8257E5]/20 to-[#B490FF]/20 rounded-full blur-md -top-2 -left-2" />
                    <div className="absolute w-8 h-6 bg-gradient-to-r from-[#8257E5]/20 to-[#B490FF]/20 rounded-full blur-md -top-1" />
                    <div className="absolute w-4 h-4 bg-gradient-to-r from-[#8257E5]/20 to-[#B490FF]/20 rounded-full blur-sm top-0 left-2" />
                  </div>
                </motion.div>
              )}
            </Button>
          )
        })}
      </div>
    </div>
  )
} 