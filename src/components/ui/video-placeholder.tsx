import { cn } from '@/lib/utils'
import { Play, Video } from '@phosphor-icons/react'

interface VideoPlaceholderProps {
  className?: string
  title?: string
  subtitle?: string
  onClick?: () => void
}

export function VideoPlaceholder({ 
  className, 
  title = "Video Demo", 
  subtitle = "Click to view",
  onClick 
}: VideoPlaceholderProps) {
  return (
    <div 
      className={cn(
        "relative aspect-video bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900",
        "rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700",
        "flex flex-col items-center justify-center gap-4",
        "cursor-pointer transition-all duration-300",
        "hover:from-zinc-200 hover:to-zinc-300 dark:hover:from-zinc-700 dark:hover:to-zinc-800",
        "hover:shadow-lg",
        className
      )}
      onClick={onClick}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(0,0,0,0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-3 text-center p-6">
        <div className="relative">
          <div className="p-4 rounded-full bg-white dark:bg-zinc-800 shadow-lg">
            <Video size={32} className="text-zinc-600 dark:text-zinc-400" />
          </div>
          
          {/* Play button overlay */}
          <div className="absolute -bottom-1 -right-1 p-2 rounded-full bg-purple-500 shadow-lg">
            <Play size={16} weight="fill" className="text-white ml-0.5" />
          </div>
        </div>
        
        <div>
          <h3 className="font-semibold text-zinc-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            {subtitle}
          </p>
        </div>
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 bg-purple-500/10 opacity-0 transition-opacity duration-300 hover:opacity-100" />
    </div>
  )
}