
import { Project } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProjectStatusBadgeProps {
  status: Project['status'];
}

export default function ProjectStatusBadge({ status }: ProjectStatusBadgeProps) {
  // Get the status color
  const getStatusColor = (status: Project['status']) => {
    switch(status) {
      case 'idea':
        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'in-progress':
        return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'mixing':
        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
      case 'mastering':
        return 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400';
      case 'completed':
        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div 
      className={cn(
        "text-xs font-medium px-2.5 py-0.5 rounded-full uppercase tracking-wider text-minimal",
        getStatusColor(status)
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </div>
  );
}
