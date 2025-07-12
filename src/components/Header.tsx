import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useLocation, useNavigate } from 'react-router-dom'
import HeaderTitle from './header/HeaderTitle'
import { TubelightNavbar } from './ui/tubelight-navbar'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetOverlay } from './ui/sheet'
import { Bars3Icon } from '@heroicons/react/24/outline'
import ThemeSwitcher from './ThemeSwitcher'
import UserAvatar from './UserAvatar'
import { useAuth } from '@/contexts/AuthContext'
import { Plus } from 'lucide-react'
import CreateProjectDialog from './project/CreateProjectDialog'
import { useProjects } from '@/hooks/useProjects'

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
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo left */}
        <HeaderTitle />
        {/* Nav pill centered */}
        <nav className="flex-1 flex justify-center">
          <TubelightNavbar />
        </nav>
        {/* Actions right */}
        <div className="flex items-center gap-2">
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
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="touch-manipulation text-foreground">
                <Bars3Icon className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetOverlay className="bg-black/80 backdrop-blur-sm" />
            <SheetContent side="right" className="w-[85vw] sm:w-[385px] p-6">
              <div className="flex flex-col space-y-6 py-4">
                <TubelightNavbar />
                {!user && (
                  <Button
                    variant="default"
                    className="bg-gradient-to-r from-violet-600 to-violet-400 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-violet-700 hover:to-violet-500 transition-all duration-200 w-full"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      navigate('/login')
                    }}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Add CreateProjectDialog */}
        {location.pathname === '/dashboard' && (
          <CreateProjectDialog
            isOpen={isCreateProjectOpen}
            onOpenChange={setIsCreateProjectOpen}
            projectsCount={projects?.length || 0}
          />
        )}
      </div>
    </header>
  )
}
