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

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className={cn(
              "w-10 h-10 rounded-full",
              "bg-background/80 dark:bg-background/50",
              "backdrop-blur-sm",
              "border border-border/50 dark:border-border/30",
              "shadow-sm dark:shadow-none",
              "hover:bg-primary/10 dark:hover:bg-primary/5",
              "hover:shadow-[0_0_15px_rgba(var(--primary),0.2)] dark:hover:shadow-[0_0_15px_rgba(var(--primary),0.1)]",
              "transition-all duration-300",
              "focus-visible:ring-2 focus-visible:ring-primary/50 dark:focus-visible:ring-primary/30"
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
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {theme === 'light' ? 'dark' : 'light'} mode</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 