import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import ProjectCard from './ProjectCard'
import { Project } from '@/lib/types'
import { cn } from '@/lib/utils'
import styles from './SortableProjectCard.module.css'

interface SortableProjectCardProps {
  project: Project
  onProjectUpdated: () => void
  onProjectDeleted: () => void
  onProjectSelect?: (project: Project) => void
  isSelected?: boolean
}

export function SortableProjectCard({
  project,
  onProjectUpdated,
  onProjectDeleted,
  onProjectSelect,
  isSelected,
}: SortableProjectCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(styles.sortableCard, isDragging ? styles.dragging : styles.notDragging)}
      style={
        {
          '--dnd-transform': transform ? CSS.Transform.toString(transform) : 'none',
        } as React.CSSProperties
      }
      {...attributes}
      {...listeners}
    >
      <ProjectCard
        project={project}
        onProjectUpdated={onProjectUpdated}
        onProjectDeleted={onProjectDeleted}
        onProjectSelect={onProjectSelect}
        isSelected={isSelected}
      />
    </div>
  )
}
