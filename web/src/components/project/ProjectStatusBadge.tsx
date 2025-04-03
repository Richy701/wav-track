import { cn } from '@/lib/utils'
import { Project } from '@/lib/types'

interface ProjectStatusBadgeProps {
  status: Project['status']
}

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  const getStatusStyles = (status: Project['status']) => {
    const styles = {
      'idea': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'in-progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'mixing': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
      'mastering': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'completed': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    }
    return styles[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
  }

  return (
    <span
      className={cn(
        'px-2.5 py-1 rounded-full text-xs font-medium',
        getStatusStyles(status)
      )}
    >
      {status.replace('-', ' ')}
    </span>
  )
} 