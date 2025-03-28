import { useState, useEffect } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from '@/lib/ThemeContext'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we have access to the theme
  useEffect(() => setMounted(true), [])

  const handleThemeChange = () => {
    console.log('Current theme:', theme)
    const newTheme = theme === 'light' ? 'dark' : 'light'
    console.log('Switching to theme:', newTheme)
    setTheme(newTheme)
    console.log('HTML classes:', document.documentElement.classList)
    console.log('Body classes:', document.body.classList)
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
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'transition-all duration-200'
      )}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {theme === 'light' ? (
          <Sun className="h-5 w-5 text-foreground/80 dark:text-foreground/70" />
        ) : (
          <Moon className="h-5 w-5 text-foreground/80 dark:text-foreground/70" />
        )}
      </motion.div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
