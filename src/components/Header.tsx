import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import HeaderTitle from './header/HeaderTitle'
import HeaderActions from './header/HeaderActions'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetOverlay } from './ui/sheet'
import { Bars3Icon } from '@heroicons/react/24/outline'

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <HeaderTitle />

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          <HeaderActions />
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
                <HeaderActions orientation="vertical" />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
