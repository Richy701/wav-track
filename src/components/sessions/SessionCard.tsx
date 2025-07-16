import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { CheckIcon, ClockIcon, PencilIcon, EllipsisVerticalIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline'
import { Button } from '@/components/ui/button'
import { Track } from '@/types/track'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

interface SessionCardProps {
  track: Track
  onComplete: (trackId: string) => void
  onEdit: (trackId: string) => void
  onPlay: (trackId: string) => void
  onPause: (trackId: string) => void
}

const cardVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1
    }
  }
}

const buttonStyles = {
  statusComplete: cn(
    "text-white",
    "shadow-sm",
    "transition-all duration-300",
    "relative overflow-hidden",
    "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1000"
  ),
  statusPending: cn(
    "text-white",
    "shadow-sm",
    "transition-all duration-300",
    "relative overflow-hidden",
    "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-1000"
  ),
  outlineGradient: cn(
    "bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10",
    "border border-primary/20 dark:border-primary/30",
    "text-primary hover:text-primary/90",
    "hover:border-primary/30 dark:hover:border-primary/40",
    "hover:shadow-[0_0_15px_rgba(var(--primary),0.1)] dark:hover:shadow-[0_0_15px_rgba(var(--primary),0.05)]"
  )
}

const textStyles = {
  cardTitle: "text-lg sm:text-xl font-semibold tracking-tight text-foreground dark:text-foreground/90",
  dateText: "text-xs text-muted-foreground dark:text-muted-foreground/70",
  statusText: "text-xs font-medium",
  bodyText: "text-sm text-muted-foreground dark:text-muted-foreground/80"
}

const statusStyles = {
  completed: {
    border: "border-l-4 border-l-emerald-500/30 dark:border-l-emerald-400/20",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50/50 dark:bg-emerald-900/20",
    hover: "hover:shadow-[0_0_15px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_15px_rgba(16,185,129,0.1)]"
  },
  in_progress: {
    border: "border-l-4 border-l-amber-500/30 dark:border-l-amber-400/20",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50/50 dark:bg-amber-900/20",
    hover: "hover:shadow-[0_0_15px_rgba(245,158,11,0.15)] dark:hover:shadow-[0_0_15px_rgba(245,158,11,0.1)]"
  }
}

export function SessionCard({ track, onComplete, onEdit, onPlay, onPause }: SessionCardProps) {
  const { toast } = useToast()
  const [isPlaying, setIsPlaying] = React.useState(false)
  const status = track.status || 'in_progress'
  const statusStyle = statusStyles[status]

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying) {
      onPlay(track.id)
      toast({
        title: "Session Started",
        description: `Now tracking time for "${track.title}"`,
      })
    } else {
      onPause(track.id)
      toast({
        title: "Session Paused",
        description: `Paused tracking for "${track.title}"`,
      })
    }
  }

  const handleComplete = () => {
    onComplete(track.id)
    toast({
      title: "Session Completed",
      description: `Marked "${track.title}" as complete`,
    })
  }

  const handleEdit = () => {
    onEdit(track.id)
  }

  return (
    <motion.div
      key={track.id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        "relative overflow-hidden rounded-lg",
        "bg-white dark:bg-gradient-to-b dark:from-background/20 dark:to-background/5",
        "border border-border/40 dark:border-border/20",
        "shadow-sm dark:shadow-none",
        "transition-all duration-200",
        "hover:scale-[1.01]",
        statusStyle.border,
        statusStyle.hover
      )}
    >
      <div className="relative z-10 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-medium text-foreground dark:text-foreground/90">
              {track.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                statusStyle.bg,
                statusStyle.text
              )}>
                {status === 'completed' ? 'Completed' : 'In Progress'}
              </span>
              <span className="text-xs text-muted-foreground dark:text-muted-foreground/70">
                {track.created_at === 'Not Started' ? 'Not Started' : new Date(track.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status !== 'completed' && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handlePlayPause}
                  className={cn(
                    "h-8 w-8 rounded-full",
                    "bg-emerald-50/50 dark:bg-emerald-900/20",
                    "text-emerald-600 dark:text-emerald-400",
                    "hover:bg-emerald-100 dark:hover:bg-emerald-900/40",
                    "hover:text-emerald-700 dark:hover:text-emerald-300",
                    "border border-emerald-200/50 dark:border-emerald-800/30",
                    "hover:border-emerald-300 dark:hover:border-emerald-700",
                    "shadow-sm hover:shadow-[0_0_10px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_10px_rgba(16,185,129,0.1)]",
                    "transition-all duration-200"
                  )}
                >
                  <PlayIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEdit}
                  className={cn(
                    "h-8 w-8 rounded-full",
                    "bg-background/80 dark:bg-background/50",
                    "text-muted-foreground dark:text-muted-foreground/70",
                    "hover:bg-primary/10 dark:hover:bg-primary/20",
                    "hover:text-primary dark:hover:text-primary/90",
                    "border border-border/50 dark:border-border/30",
                    "hover:border-primary/30 dark:hover:border-primary/20",
                    "shadow-sm hover:shadow-[0_0_10px_rgba(var(--primary),0.15)] dark:hover:shadow-[0_0_10px_rgba(var(--primary),0.1)]",
                    "transition-all duration-200"
                  )}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleComplete}
                  className={cn(
                    "h-8 w-8 rounded-full",
                    "bg-background/80 dark:bg-background/50",
                    "text-muted-foreground dark:text-muted-foreground/70",
                    "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
                    "hover:text-emerald-600 dark:hover:text-emerald-400",
                    "border border-border/50 dark:border-border/30",
                    "hover:border-emerald-300 dark:hover:border-emerald-700",
                    "shadow-sm hover:shadow-[0_0_10px_rgba(16,185,129,0.15)] dark:hover:shadow-[0_0_10px_rgba(16,185,129,0.1)]",
                    "transition-all duration-200"
                  )}
                >
                  <CheckIcon className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
} 