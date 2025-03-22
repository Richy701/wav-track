import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recordBeatCreation } from '@/lib/data';
import { toast } from 'sonner';
import { Label } from "@/components/ui/label";
import { StatusSelect } from "@/components/ui/status-select";

interface AddBeatsFormProps {
  projects: Array<{ id: string; title: string }>;
}

export function AddBeatsForm({ projects }: AddBeatsFormProps) {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [beatCount, setBeatCount] = useState<number>(1);
  const [status, setStatus] = useState<string>('idea');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddBeats = async () => {
    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }
    
    if (beatCount <= 0) {
      toast.error("Please enter a valid beat count");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await recordBeatCreation(selectedProject, beatCount);
      toast.success(`Added ${beatCount} beats to the tracker`);
      setBeatCount(1);
      setSelectedProject(''); // Reset selection after successful addition
      setStatus('idea'); // Reset status after successful addition
    } catch (error) {
      console.error('Error adding beats:', error);
      toast.error("Failed to add beats. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-4 p-3 bg-muted/40 rounded-lg">
      <h4 className="text-sm font-medium mb-2">Add Beats to Tracker</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <div className="space-y-2">
          <Label htmlFor="project-select">Project</Label>
          <Select 
            value={selectedProject} 
            onValueChange={setSelectedProject}
            name="project-select"
            disabled={isSubmitting}
          >
            <SelectTrigger 
              className="text-sm h-9"
              id="project-select"
              aria-label="Select a project"
            >
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map(project => (
                <SelectItem 
                  key={project.id} 
                  value={project.id}
                >
                  {project.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="beat-count">Beat Count</Label>
          <Input 
            id="beat-count"
            type="number" 
            min="1"
            value={beatCount}
            onChange={(e) => setBeatCount(parseInt(e.target.value) || 0)}
            placeholder="Enter beat count"
            className="h-9"
            aria-label="Number of beats to add"
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-2">
          <StatusSelect
            value={status}
            onChange={setStatus}
            disabled={isSubmitting}
          />
        </div>
        
        <div className="flex items-end">
          <Button 
            onClick={handleAddBeats} 
            className="h-9 w-full"
            aria-label="Add beats to tracker"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Beats'}
          </Button>
        </div>
      </div>
    </div>
  );
}
