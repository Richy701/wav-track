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

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { user } = useAuth()
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
      {isMobileMenuOpen && ReactDOM.createPortal(
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
          {/* Slide-over */}
          <div className="fixed inset-y-0 right-0 z-[9999] w-full max-w-xs bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md shadow-xl px-6 py-6 flex flex-col transition-transform duration-300 ease-in-out translate-x-0 animate-slide-in">
            <div className="fixed top-0 right-0 z-10 flex items-center justify-end mb-6 bg-white/80 dark:bg-zinc-900/90 backdrop-blur-md">
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            {/* Mobile actions at the top */}
            <div className="flex items-center gap-4 mb-6">
              <ThemeSwitcher />
              {user && <UserAvatar />}
            </div>
            {user && location.pathname === '/dashboard' && (
              <Button
                variant="default"
                className="w-full bg-gradient-to-r from-[#8257E5] to-[#B490FF] text-white px-3 py-3 rounded-xl text-base font-semibold flex items-center gap-2 justify-center mb-4 shadow-lg hover:scale-[1.03] transition-transform"
                onClick={() => { setIsCreateProjectOpen(true); setIsMobileMenuOpen(false); }}
              >
                <Plus className="h-5 w-5" />
                New Project
              </Button>
            )}
            <nav className="flex flex-col gap-2 mt-2">
              <button
                className="flex items-center gap-3 text-left w-full px-3 py-3 rounded-lg text-base font-semibold text-gray-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                onClick={() => { setIsMobileMenuOpen(false); navigate('/dashboard') }}
              ><Home className="h-5 w-5 opacity-80" />Dashboard</button>
              <button
                className="flex items-center gap-3 text-left w-full px-3 py-3 rounded-lg text-base font-semibold text-gray-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                onClick={() => { setIsMobileMenuOpen(false); navigate('/sessions') }}
              ><Clock className="h-5 w-5 opacity-80" />Sessions</button>
              <button
                className="flex items-center gap-3 text-left w-full px-3 py-3 rounded-lg text-base font-semibold text-gray-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                onClick={() => { setIsMobileMenuOpen(false); navigate('/achievements') }}
              ><Trophy className="h-5 w-5 opacity-80" />Achievements</button>
              <button
                className="flex items-center gap-3 text-left w-full px-3 py-3 rounded-lg text-base font-semibold text-gray-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                onClick={() => { setIsMobileMenuOpen(false); navigate('/profile') }}
              ><UserIcon className="h-5 w-5 opacity-80" />Profile</button>
              <button
                className="flex items-center gap-3 text-left w-full px-3 py-3 rounded-lg text-base font-semibold text-gray-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                onClick={() => { setIsMobileMenuOpen(false); navigate('/profile/settings') }}
              ><SettingsIcon className="h-5 w-5 opacity-80" />Settings</button>
            </nav>
            <div className="my-6 border-t border-zinc-200 dark:border-zinc-800" />
            {!user && (
              <div className="flex flex-col gap-2 mt-2">
                <button
                  className="flex items-center gap-3 text-left w-full px-3 py-3 rounded-lg text-base font-semibold text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900 transition"
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/login') }}
                >Sign In</button>
                <button
                  className="flex items-center gap-3 text-left w-full px-3 py-3 rounded-lg text-base font-semibold text-white bg-gradient-to-r from-violet-600 to-violet-400 hover:from-violet-700 hover:to-violet-500 transition"
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/register') }}
                >Register</button>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </header>
  )
}
