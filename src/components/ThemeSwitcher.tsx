import { useState, useEffect } from 'react'
import { MoonIcon as MoonSolid, SunIcon as SunSolid } from '@heroicons/react/24/solid'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return null
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        'relative h-10 w-10 rounded-full',
        'bg-background/80 hover:bg-background',
        'flex items-center justify-center',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
      )}
    >
      {theme === 'dark' ? (
        <MoonSolid className="h-5 w-5 text-foreground/80 dark:text-foreground/70" />
      ) : (
        <SunSolid className="h-5 w-5 text-foreground/80 dark:text-foreground/70" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
