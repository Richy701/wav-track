import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trash, 
  ArrowsDownUp,
  Clock,
  ArrowsVertical
} from '@phosphor-icons/react';
import { clearAllProjects } from '@/lib/data';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProjectCard from '@/components/project/ProjectCard';
import { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useProjects } from '@/hooks/useProjects';
import { DndContext, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { SortableProjectCard } from '@/components/project/SortableProjectCard';

interface ProjectListProps {
  title?: string;
  onDragEnd?: (activeId: string, overId: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'name' | 'completion';

const ProjectList: React.FC<ProjectListProps> = ({ 
  title = "Recent Projects",
  onDragEnd 
}) => {
  const [isClearDialogOpen, setIsClearDialogOpen] = React.useState(false);
  const { projects, refreshProjects } = useProjects();
  const [filter, setFilter] = useState<Project['status'] | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id && onDragEnd) {
      onDragEnd(active.id as string, over.id as string);
    }
  };

  const handleClearAllProjects = () => {
    try {
      clearAllProjects();
      refreshProjects();
      setIsClearDialogOpen(false);
      toast.success("All projects deleted", {
        description: "Your project list has been cleared."
      });
    } catch (error) {
      console.error('Error clearing projects:', error);
      toast.error("Failed to clear projects", {
        description: "An error occurred while clearing projects."
      });
    }
  };

  const handleProjectUpdated = () => {
    refreshProjects();
  };

  const handleProjectDeleted = () => {
    refreshProjects();
  };

  const statuses: { value: Project['status'] | 'all'; label: string; className?: string }[] = [
    { value: 'all', label: 'All', className: 'bg-zinc-500/20 text-zinc-100' },
    { value: 'idea', label: 'Ideas', className: 'bg-blue-500/20 text-blue-500 dark:text-blue-400' },
    { value: 'in-progress', label: 'In Progress', className: 'bg-amber-500/20 text-amber-500 dark:text-amber-400' },
    { value: 'mixing', label: 'Mixing', className: 'bg-purple-500/20 text-purple-500 dark:text-purple-400' },
    { value: 'mastering', label: 'Mastering', className: 'bg-violet-500/20 text-violet-500 dark:text-violet-400' },
    { value: 'completed', label: 'Completed', className: 'bg-emerald-500/20 text-emerald-500 dark:text-emerald-400' }
  ];

  // Apply both filtering and sorting
  const filteredAndSortedProjects = useMemo(() => {
    // First filter
    const filtered = filter === 'all' 
      ? projects 
      : projects.filter(project => project.status === filter);
    
    // Then sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime();
        case 'oldest':
          return new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        case 'completion':
          return b.completionPercentage - a.completionPercentage;
        default:
          return 0;
      }
    });
  }, [projects, filter, sortBy]);

  // Get the appropriate icon and text for the current sort option
  const getSortOptionDisplay = (option: SortOption) => {
    switch (option) {
      case 'newest':
        return { icon: <Clock size={16} weight="bold" />, text: 'Newest First' };
      case 'oldest':
        return { icon: <Clock size={16} weight="bold" />, text: 'Oldest First' };
      case 'name':
        return { icon: <ArrowsDownUp size={16} weight="bold" />, text: 'Name (A-Z)' };
      case 'completion':
        return { icon: <ArrowsVertical size={16} weight="bold" className="transform rotate-180" />, text: 'Completion (High-Low)' };
    }
  };

  const currentSortDisplay = getSortOptionDisplay(sortBy);

  return (
    <section className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium">{title}</h2>
        
        <div className="flex items-center space-x-3">
          <div className="bg-card rounded-lg p-1 flex shadow-sm">
            {statuses.map(status => (
              <button
                key={status.value}
                onClick={() => setFilter(status.value)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  filter === status.value ? status.className : "text-muted-foreground hover:text-foreground"
                )}
              >
                {status.label}
              </button>
            ))}
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {currentSortDisplay.icon}
                {currentSortDisplay.text}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortBy('newest')}>
                <Clock className="mr-2 h-4 w-4" weight="bold" />
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('oldest')}>
                <Clock className="mr-2 h-4 w-4" weight="bold" />
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                <ArrowsDownUp className="mr-2 h-4 w-4" weight="bold" />
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('completion')}>
                <ArrowsVertical className="mr-2 h-4 w-4" weight="bold" />
                Completion (High-Low)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="destructive" 
            size="sm" 
            className="gap-2"
            onClick={() => setIsClearDialogOpen(true)}
          >
            <Trash className="h-4 w-4" />
            Clear All
          </Button>
        </div>
      </div>

      <AlertDialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all your projects. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleClearAllProjects}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Clear All Projects
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {filteredAndSortedProjects.length > 0 ? (
        <>
          <div className="flex items-center mb-6">
            <span className="text-sm mr-2">Sorting by:</span>
            <div className="bg-secondary/50 rounded-full px-3 py-1 text-xs flex items-center">
              {currentSortDisplay.icon}
              <span className="ml-1">{currentSortDisplay.text}</span>
            </div>
          </div>
          
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={filteredAndSortedProjects.map(p => p.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAndSortedProjects.map((project) => (
                  <SortableProjectCard
                    key={project.id}
                    project={project}
                    onProjectUpdated={handleProjectUpdated}
                    onProjectDeleted={handleProjectDeleted}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      ) : (
        <div className="bg-card rounded-xl p-8 text-center">
          <h3 className="text-xl font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-6">
            {filter === 'all' 
              ? "You haven't created any projects yet. Create your first project using the \"New Beat\" button in the header."
              : `You don't have any projects with status "${filter}".`}
          </p>
        </div>
      )}
    </section>
  );
};

export default ProjectList;
