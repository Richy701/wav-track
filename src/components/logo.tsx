import { cn } from "@/lib/utils"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <div className={cn("flex items-center", className)} {...props}>
      <span className="font-heading font-semibold text-xl tracking-tight bg-gradient-to-r from-violet-600 to-violet-400 dark:from-violet-400 dark:to-violet-500 bg-clip-text text-transparent">
        WavTrack
      </span>
    </div>
  )
} 