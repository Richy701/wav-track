import { Loader2 } from 'lucide-react'
import { useLoadingState } from '@/hooks/useLoadingState'
import { cn } from '@/lib/utils'

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  isLoading: boolean
  timeout?: number
  onTimeout?: () => void
  loadingText?: string
  timeoutText?: string
}

export function Loading({
  isLoading,
  timeout,
  onTimeout,
  loadingText = 'Loading...',
  timeoutText = 'This is taking longer than expected...',
  className,
  ...props
}: LoadingProps) {
  const { showTimeout } = useLoadingState(isLoading, { timeout, onTimeout })

  if (!isLoading) return null

  return (
    <div
      className={cn('flex flex-col items-center justify-center space-y-4 p-4', className)}
      {...props}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{showTimeout ? timeoutText : loadingText}</p>
    </div>
  )
}
