import { useState, useEffect } from 'react';
import { Project } from '@/lib/types';
import { updateProject as updateProjectInStorage } from '@/lib/data';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, SelectLabel } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface EditProjectDialogProps {
  project: Project;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdated: (project: Project) => void;
}

export default function EditProjectDialog({ 
  project, 
  isOpen, 
  onOpenChange,
  onProjectUpdated
}: EditProjectDialogProps) {
  const [editedProject, setEditedProject] = useState<Project>({ ...project });
  
  // Map status to completion percentage
  const statusToCompletion = {
    'idea': 0,
    'in-progress': 25,
    'mixing': 50,
    'mastering': 75,
    'completed': 100
  };
  
  // Update completion percentage when status changes
  useEffect(() => {
    if (editedProject.status in statusToCompletion) {
      const suggestedCompletion = statusToCompletion[editedProject.status as keyof typeof statusToCompletion];
      setEditedProject(prev => ({
        ...prev,
        completionPercentage: suggestedCompletion
      }));
    }
  }, [editedProject.status]);
  
  // Genre options
  const genreOptions = [
    'Hip Hop', 'Trap', 'R&B', 'Pop', 'Electronic', 'House', 
    'Techno', 'Drill', 'Soul', 'Jazz', 'Lo-Fi', 'Reggaeton', 'Afrobeat'
  ];
  
  const handleChange = (field: keyof Project, value: string | number) => {
    setEditedProject(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editedProject.title.trim()) {
      toast.error("Invalid project title ❌", {
        description: "Please enter a project title."
      });
      return;
    }
    
    if (isNaN(Number(editedProject.bpm)) || Number(editedProject.bpm) <= 0) {
      toast.error("Invalid BPM ❌", {
        description: "BPM must be a positive number."
      });
      return;
    }
    
    // Use setTimeout to prevent UI freezing by moving the save operation
    // to the next event loop cycle
    setTimeout(() => {
      saveProject();
    }, 0);
  };
  
  const saveProject = () => {
    try {
      // Create updated project with edited values
      const updatedProject = {
        ...project,
        ...editedProject,
        lastModified: new Date().toISOString()
      };
      
      // Use the imported updateProject function
      updateProjectInStorage(updatedProject);
      
      toast.success("Project updated ✏️", {
        description: `"${updatedProject.title}" has been updated.`,
      });
      
      // Call the update callback and close the dialog in the next event loop cycle
      setTimeout(() => {
        onProjectUpdated(updatedProject);
        onOpenChange(false);
      }, 0);
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project ❌", {
        description: "An error occurred. Please try again."
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Make changes to your project here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                type="text"
                id="title"
                value={editedProject.title}
                onChange={(e) => handleChange('title', e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="genre" className="text-right">
                Genre
              </Label>
              <div className="col-span-3">
                <Select value={editedProject.genre} onValueChange={(value) => handleChange('genre', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Genres</SelectLabel>
                      {genreOptions.map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bpm" className="text-right">
                BPM
              </Label>
              <Input
                type="number"
                id="bpm"
                value={editedProject.bpm}
                onChange={(e) => handleChange('bpm', Number(e.target.value))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Status
              </Label>
              <Select 
                value={editedProject.status} 
                onValueChange={(value: Project['status']) => handleChange('status', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={editedProject.status} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="idea">Idea</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="mixing">Mixing</SelectItem>
                  <SelectItem value="mastering">Mastering</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <Label htmlFor="completionPercentage" className="text-right self-center">
                Completion
              </Label>
              <div className="col-span-3">
                <div className="flex items-center space-x-2">
                  <Slider
                    id="completionPercentage"
                    min={0}
                    max={100}
                    step={1}
                    value={[editedProject.completionPercentage]}
                    onValueChange={(values) => handleChange('completionPercentage', values[0])}
                  />
                  <span className="text-sm min-w-12 text-right font-mono">
                    {editedProject.completionPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
