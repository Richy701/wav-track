import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import HeaderTitle from './header/HeaderTitle'
import HeaderActions from './header/HeaderActions'
import { Button } from './ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetOverlay } from './ui/sheet'
import { List } from '@phosphor-icons/react'

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
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
        scrolled ? 'backdrop-blur-md bg-white/80 dark:bg-black/80' : 'bg-white dark:bg-black',
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
              <Button variant="ghost" size="icon" className="touch-manipulation">
                <List className="h-5 w-5" />
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
