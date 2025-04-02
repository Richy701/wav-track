import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/lib/ThemeContext'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [isTransitioning, setIsTransitioning] = useState(false)

  const handleThemeChange = () => {
    if (isTransitioning) return
    setIsTransitioning(true)
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    // Reset transition state after animation completes
    setTimeout(() => setIsTransitioning(false), 300)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleThemeChange}
            disabled={isTransitioning}
            className={cn(
              "w-10 h-10 rounded-full",
              "bg-background/80 dark:bg-background/50",
              "backdrop-blur-sm",
              "border border-border/50 dark:border-border/30",
              "shadow-sm dark:shadow-none",
              "hover:bg-primary/10 dark:hover:bg-primary/5",
              "hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] dark:hover:shadow-[0_0_15px_rgba(var(--primary),0.1)]",
              "transition-all duration-300",
              "focus-visible:ring-2 focus-visible:ring-primary/50 dark:focus-visible:ring-primary/30",
              isTransitioning && "pointer-events-none"
            )}
          >
            <motion.div
              initial={false}
              animate={{ 
                scale: isTransitioning ? 0.8 : 1,
                opacity: isTransitioning ? 0.5 : 1,
                rotate: isTransitioning ? 180 : 0
              }}
              transition={{ duration: 0.2 }}
            >
              {theme === 'light' ? (
                <Sun className="h-5 w-5 text-foreground/80 dark:text-foreground/70" />
              ) : (
                <Moon className="h-5 w-5 text-foreground/80 dark:text-foreground/70" />
              )}
            </motion.div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {theme === 'light' ? 'dark' : 'light'} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 