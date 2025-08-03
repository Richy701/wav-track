import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useLocation, useNavigate } from 'react-router-dom'
import HeaderTitle from './header/HeaderTitle'
import { TubelightNavbar } from './ui/tubelight-navbar'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetOverlay } from './ui/sheet'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import ThemeSwitcher from './ThemeSwitcher'
import UserAvatar from './UserAvatar'
import { useAuth } from '@/contexts/AuthContext'
import { Home, Clock, Trophy, User as UserIcon, Settings as SettingsIcon, Plus } from 'lucide-react'
import CreateProjectDialog from './project/CreateProjectDialog'
import { useProjects } from '@/hooks/useProjects'
import ReactDOM from 'react-dom'
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user, logout, isLoggingOut } = useAuth()
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { projects } = useProjects()

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [scrolled])

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [isMobileMenuOpen]);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 border-0',
        scrolled 
          ? 'backdrop-blur-2xl bg-white/20 dark:bg-black/20 supports-[backdrop-filter]:bg-white/5 supports-[backdrop-filter]:dark:bg-black/5' 
          : 'bg-transparent',
        'px-4 py-3 md:px-6 md:py-4'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4 header-container">
        {/* Logo left */}
        <div className="flex-shrink-0 flex items-center">
          <HeaderTitle />
        </div>
        {/* Nav pill centered - hidden on mobile */}
        <nav className="hidden md:flex flex-1 justify-center">
          <TubelightNavbar />
        </nav>
        {/* Actions right - only on desktop */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeSwitcher />
          {user ? (
            <>
              <UserAvatar />
              {location.pathname === '/dashboard' && (
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-[#8257E5] to-[#B490FF] text-white px-2 py-1 h-8 rounded-full text-xs min-w-[90px] flex items-center justify-center gap-1"
                  onClick={() => setIsCreateProjectOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">New Project</span>
                </Button>
              )}
            </>
          ) : (
            <Button
              variant="default"
              className="bg-gradient-to-r from-violet-600 to-violet-400 text-white px-4 py-2 h-9 rounded-full text-sm font-medium hover:from-violet-700 hover:to-violet-500 transition-all duration-200"
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          )}
        </div>
        {/* Hamburger on mobile - right side */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2.5 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open main menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Add CreateProjectDialog */}
      {location.pathname === '/dashboard' && (
        <CreateProjectDialog
          isOpen={isCreateProjectOpen}
          onOpenChange={setIsCreateProjectOpen}
          projectsCount={projects?.length || 0}
        />
      )}

      {/* Mobile slide-over menu */}
      {isMobileMenuOpen &&
        ReactDOM.createPortal(
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-[9999] bg-black/50"
              onClick={(e) => {
                e.stopPropagation();
                setIsMobileMenuOpen(false);
              }}
              aria-hidden="true"
            />
            {/* Slide-over */}
            <div className="fixed inset-y-0 right-0 z-[10000] w-80 bg-white dark:bg-zinc-900 shadow-lg flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                <h2 className="text-lg font-medium">Menu</h2>
                <button
                  type="button"
                  className="p-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              {/* Content */}
              <div className="p-4 space-y-4 flex-1 overflow-y-auto">
                {/* User Info */}
                {user && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded">
                    <UserAvatar />
                    <div>
                      <p className="font-medium">
                        {user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {user.email}
                      </p>
                    </div>
                  </div>
                )}
                
                {/* New Project Button */}
                {user && location.pathname === '/dashboard' && (
                  <Button
                    className="w-full"
                    onClick={() => { setIsCreateProjectOpen(true); setIsMobileMenuOpen(false); }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                )}
                
                {/* Navigation */}
                <div className="space-y-1">
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                    onClick={() => { setIsMobileMenuOpen(false); navigate('/dashboard') }}
                  >
                    <Home className="h-4 w-4" />
                    Dashboard
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                    onClick={() => { setIsMobileMenuOpen(false); navigate('/sessions') }}
                  >
                    <Clock className="h-4 w-4" />
                    Sessions
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                    onClick={() => { setIsMobileMenuOpen(false); navigate('/achievements') }}
                  >
                    <Trophy className="h-4 w-4" />
                    Achievements
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                    onClick={() => { setIsMobileMenuOpen(false); navigate('/profile') }}
                  >
                    <UserIcon className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-zinc-800 rounded"
                    onClick={() => { setIsMobileMenuOpen(false); navigate('/profile/settings') }}
                  >
                    <SettingsIcon className="h-4 w-4" />
                    Settings
                  </button>
                </div>
                
                {/* Theme Switcher */}
                <div className="pt-4 border-t">
                  <ThemeSwitcher />
                </div>
                
                {/* Auth Buttons */}
                {!user ? (
                  <div className="space-y-2 pt-4 border-t">
                    <button
                      className="w-full flex items-center justify-center gap-3 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-zinc-800"
                      onClick={(e) => { 
                        e.stopPropagation();
                        setIsMobileMenuOpen(false); 
                        navigate('/login'); 
                      }}
                    >
                      Sign In
                    </button>
                    <button
                      className="w-full flex items-center justify-center gap-3 px-3 py-2 bg-gradient-to-r from-[#8257E5] to-[#B490FF] text-white rounded hover:from-[#8257E5]/90 hover:to-[#B490FF]/90"
                      onClick={(e) => { 
                        e.stopPropagation();
                        setIsMobileMenuOpen(false); 
                        navigate('/register'); 
                      }}
                    >
                      Join Waitlist
                    </button>
                  </div>
                ) : (
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded mt-4 border-t pt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoggingOut}
                    onClick={async () => { 
                      setIsMobileMenuOpen(false); 
                      if (logout && !isLoggingOut) {
                        await logout();
                      }
                    }}
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </header>
  )
}
