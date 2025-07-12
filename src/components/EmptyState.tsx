import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description: string
  icon: ReactNode
  className?: string
}

export function EmptyState({ title, description, icon, className }: EmptyStateProps) {
  return (
    <div className={cn('text-center', className)}>
      <div className="inline-flex p-3 rounded-full bg-white/5 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white/90">{title}</h3>
      <p className="text-base text-white/70">{description}</p>
    </div>
  )
}
