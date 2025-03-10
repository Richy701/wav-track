import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ProjectCard from './ProjectCard';
import { Project } from '@/lib/types';

interface SortableProjectCardProps {
  project: Project;
  onProjectUpdated: () => void;
  onProjectDeleted: () => void;
}

export function SortableProjectCard({ project, onProjectUpdated, onProjectDeleted }: SortableProjectCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <ProjectCard
        project={project}
        onProjectUpdated={onProjectUpdated}
        onProjectDeleted={onProjectDeleted}
      />
    </div>
  );
} 