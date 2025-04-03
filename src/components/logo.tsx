import { cn } from "@/lib/utils"

interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Logo({ className, ...props }: LogoProps) {
  return (
    <div className={cn("flex items-center", className)} {...props}>
      <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-emerald-500 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent">
        WavTrack
      </span>
    </div>
  )
} 