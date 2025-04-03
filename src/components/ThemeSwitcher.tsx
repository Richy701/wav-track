import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/ThemeContext'
import { Button } from '@/components/ui/button'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), [])

  const handleThemeChange = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  if (!mounted) {
    return null
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeChange}
      className={cn(
        'relative h-10 w-10 rounded-full',
        'bg-background/80 hover:bg-background',
        'flex items-center justify-center',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'
      )}
    >
      {theme === 'light' ? (
        <Sun className="h-5 w-5 text-foreground/80 dark:text-foreground/70" />
      ) : (
        <Moon className="h-5 w-5 text-foreground/80 dark:text-foreground/70" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
