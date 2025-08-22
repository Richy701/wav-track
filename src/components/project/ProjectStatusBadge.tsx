import { Project } from '@/lib/types'
import { cn } from '@/lib/utils'
import { getStatusClasses } from '@/lib/constants/colors'

interface ProjectStatusBadgeProps {
  status: Project['status']
}

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  return (
    <div
      className={cn(
        'text-xs font-medium px-2.5 py-0.5 rounded-full uppercase tracking-wider text-minimal',
        getStatusClasses(status)
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </div>
  )
}
