import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { recordBeatCreation } from '@/lib/data';
import { toast } from 'sonner';

interface AddBeatsFormProps {
  projects: Array<{ id: string; title: string }>;
}

export function AddBeatsForm({ projects }: AddBeatsFormProps) {
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [beatCount, setBeatCount] = useState<number>(1);

  const handleAddBeats = () => {
    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }
    
    if (beatCount <= 0) {
      toast.error("Please enter a valid beat count");
      return;
    }
    
    recordBeatCreation(selectedProject, beatCount);
    toast.success(`Added ${beatCount} beats to the tracker`);
    setBeatCount(1);
  };

  return (
    <div className="mb-4 p-3 bg-muted/40 rounded-lg">
      <h4 className="text-sm font-medium mb-2">Add Beats to Tracker</h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="text-sm h-9">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Input 
          type="number" 
          min="1"
          value={beatCount}
          onChange={(e) => setBeatCount(parseInt(e.target.value) || 0)}
          placeholder="Beat count"
          className="h-9"
        />
        
        <Button onClick={handleAddBeats} className="h-9">
          Add Beats
        </Button>
      </div>
    </div>
  );
}
