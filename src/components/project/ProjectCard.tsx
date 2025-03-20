import { useState, useRef } from 'react';
import { 
  DotsThreeVertical, 
  Clock, 
  MusicNote, 
  PencilSimple, 
  Trash, 
  CheckCircle, 
  Play, 
  Pause, 
  SpeakerHigh,
  Waveform,
  Lightning,
  Calendar,
  ArrowClockwise
} from '@phosphor-icons/react';
import { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { updateProject } from '@/lib/data';
import { toast } from 'sonner';
import { useProjects } from '@/hooks/useProjects';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import ProjectStatusBadge from '@/components/project/ProjectStatusBadge';
import DeleteProjectDialog from '@/components/project/DeleteProjectDialog';
import EditProjectDialog from '@/components/project/EditProjectDialog';
import { Progress } from "@/components/ui/progress";

interface ProjectCardProps {
  project: Project;
  onProjectUpdated: () => void;
  onProjectDeleted: () => void;
  onProjectSelect?: (project: Project) => void;
  isSelected?: boolean;
}

export default function ProjectCard({ 
  project, 
  onProjectUpdated, 
  onProjectDeleted,
  onProjectSelect,
  isSelected = false 
}: ProjectCardProps) {
  const { deleteProject, isDeletingProject } = useProjects();
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [localProject, setLocalProject] = useState<Project>({ ...project });
  const [isPlaying, setIsPlaying] = useState(false);
  const [showWaveform, setShowWaveform] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  const statusToCompletion = {
    'idea': 0,
    'in-progress': 25,
    'mixing': 50,
    'mastering': 75,
    'completed': 100
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  };

  const handleDelete = () => {
    try {
      deleteProject(project.id);
      setIsDeleteDialogOpen(false);
      toast.success("Project deleted", {
        description: `"${project.title}" has been removed.`
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error("Failed to delete project", {
        description: "An error occurred while deleting the project."
      });
    }
  };

  const handleMoveToNextStage = () => {
    const statusOrder: Project['status'][] = ['idea', 'in-progress', 'mixing', 'mastering', 'completed'];
    const currentIndex = statusOrder.indexOf(localProject.status);
    
    if (currentIndex < statusOrder.length - 1) {
      const nextStatus = statusOrder[currentIndex + 1];
      const updatedProject = {
        ...localProject,
        status: nextStatus,
        completionPercentage: statusToCompletion[nextStatus],
        lastModified: new Date().toISOString()
      };
      
      try {
        updateProject(updatedProject);
        setLocalProject(updatedProject);
        onProjectUpdated();
        
        toast.success("Project status updated", {
          description: `"${updatedProject.title}" moved to ${nextStatus.replace('-', ' ')}.`
        });
      } catch (error) {
        console.error('Error updating project status:', error);
        toast.error("Failed to update status", {
          description: "An error occurred while updating the project status."
        });
      }
    }
  };

  const handleProjectUpdated = (updatedProject: Project) => {
    try {
      updateProject(updatedProject);
      setLocalProject(updatedProject);
      onProjectUpdated();
      setIsEditDialogOpen(false);
      
      toast.success("Project updated", {
        description: `"${updatedProject.title}" has been updated.`
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error("Failed to update project", {
        description: "An error occurred while updating the project."
      });
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger if clicking on buttons or menu
    if (
      e.target instanceof HTMLElement && 
      (e.target.closest('button') || e.target.closest('[role="menuitem"]'))
    ) {
      return;
    }
    onProjectSelect?.(project);
  };
  return (
    <div 
      className={cn(
        "group relative bg-card rounded-xl overflow-hidden transition-all duration-300 cursor-pointer",
        isHovered ? "shadow-lg transform -translate-y-1" : "shadow hover:shadow-md",
        "border border-border",
        isSelected && "ring-2 ring-primary"
      )}
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      aria-pressed="false"
    >
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className={`px-2 py-1 rounded-md text-xs font-medium ${
              localProject.status === 'completed'
                ? 'bg-green-500/10 text-green-600'
                : localProject.status === 'mastering'
                ? 'bg-blue-500/10 text-blue-600'
                : localProject.status === 'mixing'
                ? 'bg-yellow-500/10 text-yellow-600'
                : localProject.status === 'in-progress'
                ? 'bg-orange-500/10 text-orange-600'
                : 'bg-red-500/10 text-red-600'
            }`}>
              {localProject.status.replace('-', ' ')}
            </div>
            <div className="text-xs text-muted-foreground">
              {localProject.completionPercentage}%
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button 
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Open project menu"
              >
                <DotsThreeVertical size={20} weight="bold" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleMoveToNextStage} disabled={localProject.status === 'completed'}>
                <CheckCircle className="mr-2 h-4 w-4" />
                {localProject.status === 'completed' ? 'Completed' : 'Move to Next Stage'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <PencilSimple className="mr-2 h-4 w-4" />
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="text-red-600 dark:text-red-400"
                disabled={isDeletingProject}
              >
                <Trash className="mr-2 h-4 w-4" />
                {isDeletingProject ? 'Deleting...' : 'Delete Project'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-medium mb-1 tracking-tight line-clamp-1">{localProject.title}</h3>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(localProject.dateCreated)}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MusicNote className="h-3.5 w-3.5" />
                <span>{localProject.bpm} BPM</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <MusicNote className="h-3.5 w-3.5" />
                <span>{localProject.key}</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <ArrowClockwise className="h-3.5 w-3.5" />
                <span>Updated {formatTimeAgo(localProject.lastModified)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium px-2 py-1 rounded-md bg-primary/10 text-primary">
              {localProject.genre}
            </div>
            {localProject.audioFile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={togglePlayback}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" weight="fill" />
                ) : (
                  <Play className="h-4 w-4" weight="fill" />
                )}
              </Button>
            )}
          </div>
          
          {localProject.audioFile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowWaveform(!showWaveform)}
            >
              {showWaveform ? (
                <SpeakerHigh className="h-4 w-4" weight="fill" />
              ) : (
                <Waveform className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        
        <div className="mt-4">
          <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                localProject.completionPercentage === 100 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : localProject.completionPercentage >= 75
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                  : localProject.completionPercentage >= 50
                  ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                  : localProject.completionPercentage >= 25
                  ? 'bg-gradient-to-r from-orange-500 to-red-500'
                  : 'bg-gradient-to-r from-red-500 to-pink-500'
              }`}
              style={{ width: `${localProject.completionPercentage}%` }}
            />
          </div>
        </div>

        {showWaveform && localProject.audioFile && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="bg-muted rounded-lg p-3 relative overflow-hidden">
              <div className="flex justify-center">
                <Lightning className="h-5 w-5 text-primary animate-pulse" weight="fill" />
              </div>
              <div className="text-xs text-center text-muted-foreground mt-1">
                Waveform visualization coming soon
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audio element */}
      {localProject.audioFile && (
        <audio
          ref={audioRef}
          src={localProject.audioFile.url}
          onEnded={handleAudioEnded}
          onPause={() => setIsPlaying(false)}
          onPlay={() => setIsPlaying(true)}
        />
      )}

      <DeleteProjectDialog
        project={localProject}
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />

      <EditProjectDialog
        project={localProject}
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onProjectUpdated={handleProjectUpdated}
      />
    </div>
  );
}
