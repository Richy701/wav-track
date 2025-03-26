import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface AICoachCardProps {
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  actionItems: string[]
  icon?: React.ReactNode
  className?: string
  onComplete?: () => void
}

const priorityStyles = {
  high: "text-red-600 dark:text-red-400",
  medium: "text-amber-600 dark:text-amber-400",
  low: "text-emerald-600 dark:text-emerald-400"
}

export function AICoachCard({
  title,
  description,
  priority,
  actionItems,
  icon,
  className,
  onComplete
}: AICoachCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={className}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex-shrink-0 p-1 rounded-md bg-background/80 backdrop-blur-sm">
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground dark:text-foreground/90">
                {title}
              </h3>
              <p className={cn("text-sm font-medium", priorityStyles[priority])}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex-shrink-0 gap-1.5 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400"
            onClick={onComplete}
          >
            <Check className="w-4 h-4" />
            <span>Complete</span>
          </Button>
        </div>

        <div className="mt-3 space-y-3">
          <p className="text-sm leading-relaxed text-muted-foreground dark:text-muted-foreground/80">
            {description}
          </p>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground dark:text-foreground/90">
              Action Items:
            </h4>
            <ul className="space-y-1.5">
              {actionItems.map((item, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground dark:text-muted-foreground/80"
                >
                  <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 rounded-full bg-primary/60" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 