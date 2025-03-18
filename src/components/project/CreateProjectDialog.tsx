import { useState } from 'react';
import { 
  Plus, 
  Calendar as PhCalendar, 
  Sparkle, 
  MusicNote, 
  Timer as PhTimer, 
  Queue as PhQueue, 
  UploadSimple, 
  Tag as PhTag, 
  X as PhX,
  CircleNotch
} from '@phosphor-icons/react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { format } from "date-fns";
import { Project } from '@/lib/types';
import { recordBeatCreation } from '@/lib/data';
import { AudioUpload } from '@/components/AudioUpload';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';
import { useProjects } from '@/hooks/useProjects';

interface CreateProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectsCount: number;
  onProjectCreated?: () => void;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({
  isOpen,
  onOpenChange,
  projectsCount,
  onProjectCreated
}) => {
  const { addProject, isAddingProject } = useProjects();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'idea' as Project['status'],
    bpm: 120,
    key: 'C',
    genre: '',
    tags: [] as string[],
    completionPercentage: 0,
    dateCreated: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    length: '3:30',
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.genre) {
      newErrors.genre = 'Genre is required';
    }
    
    if (!formData.length.match(/^\d+:\d{2}$/)) {
      newErrors.length = 'Length must be in format M:SS';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'bpm') {
      const bpmValue = Number(value);
      if (!isNaN(bpmValue) && bpmValue > 0 && bpmValue <= 300) {
        setFormData(prev => ({ ...prev, [name]: bpmValue }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBpmChange = (value: number[]) => {
    setFormData(prev => ({ ...prev, bpm: value[0] }));
  };

  const handleStatusChange = (value: string) => {
    const status = value as Project['status'];
    const completionPercentage = getCompletionPercentage(status);
    setFormData(prev => ({ 
      ...prev, 
      status,
      completionPercentage
    }));
  };

  const handleGenreChange = (value: string) => {
    setFormData(prev => ({ ...prev, genre: value }));
    if (errors.genre) {
      setErrors(prev => ({ ...prev, genre: '' }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, dateCreated: date.toISOString() }));
    }
  };

  const getCompletionPercentage = (status: 'idea' | 'in-progress' | 'mixing' | 'mastering' | 'completed'): number => {
    switch(status) {
      case 'idea': return 0;
      case 'in-progress': return 25;
      case 'mixing': return 50;
      case 'mastering': return 75;
      case 'completed': return 100;
      default: return 0;
    }
  };

  const handleCreateBeat = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const newProject: Project = {
        id: crypto.randomUUID(),
        ...formData,
        lastModified: new Date().toISOString(),
      };

      // First, create the project and wait for it to be saved
      const createdProject = await addProject(newProject);
      
      if (!createdProject) {
        throw new Error('Failed to create project');
      }

      // Then record the beat activity with the created project's ID
      await recordBeatCreation(createdProject.id, 1);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        status: 'idea',
        bpm: 120,
        key: 'C',
        genre: '',
        tags: [],
        completionPercentage: 0,
        dateCreated: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        length: '3:30',
      });

      // Close dialog and notify parent
      onOpenChange(false);
      onProjectCreated?.();
      
      toast.success("Project created successfully", {
        description: "Your new project has been added to the list."
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error("Failed to create project", {
        description: "An error occurred while creating your project."
      });
    }
  };

  const genreOptions = [
    'Hip Hop', 'Trap', 'R&B', 'Pop', 'Electronic', 'House', 
    'Techno', 'Drill', 'Soul', 'Jazz', 'Lo-Fi', 'Reggaeton', 'Afrobeat'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Beat</DialogTitle>
          <DialogDescription>
            Add a new beat to your collection. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateBeat} className="space-y-4">
          <div className="grid gap-5 py-6">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right font-medium">
                Title
              </Label>
              <div className="col-span-3 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <div className="p-1 rounded-md bg-violet-500/10">
                    <MusicNote weight="fill" className="h-4 w-4 text-violet-500" />
                  </div>
                </div>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={cn(
                    "pl-12 transition-colors",
                    errors.title ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary"
                  )}
                  placeholder="Enter project title"
                />
                {errors.title && (
                  <p className="text-sm text-destructive mt-1.5 animate-in fade-in slide-in-from-top-1">{errors.title}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="genre" className="text-right font-medium">
                Genre
              </Label>
              <div className="col-span-3 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="p-1 rounded-md bg-pink-500/10">
                    <PhTag weight="fill" className="h-4 w-4 text-pink-500" />
                  </div>
                </div>
                <Select 
                  value={formData.genre} 
                  onValueChange={handleGenreChange}
                  name="genre"
                >
                  <SelectTrigger 
                    id="genre"
                    className={cn(
                      "pl-12 transition-colors",
                      errors.genre ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary"
                    )}
                    aria-label="Select project genre"
                    aria-describedby={errors.genre ? "genre-error" : undefined}
                  >
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Genres</SelectLabel>
                      {genreOptions.map(genre => (
                        <SelectItem 
                          key={genre} 
                          value={genre}
                          role="option"
                          aria-selected={formData.genre === genre}
                        >
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                {errors.genre && (
                  <p id="genre-error" className="text-sm text-destructive mt-1.5 animate-in fade-in slide-in-from-top-1">
                    {errors.genre}
                  </p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bpm" className="text-right font-medium">
                BPM
              </Label>
              <div className="col-span-3 flex items-center gap-4">
                <div className="p-1 rounded-md bg-emerald-500/10">
                  <PhTimer weight="fill" className="h-4 w-4 text-emerald-500" />
                </div>
                <Slider
                  id="bpm"
                  name="bpm"
                  min={60}
                  max={200}
                  step={1}
                  value={[formData.bpm]}
                  onValueChange={handleBpmChange}
                  className="flex-1"
                />
                <span className="text-sm font-mono w-14 text-center bg-muted/50 px-2.5 py-1.5 rounded-md ring-1 ring-border/50">
                  {formData.bpm}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="length" className="text-right font-medium">
                Length
              </Label>
              <div className="col-span-3 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <div className="p-1 rounded-md bg-amber-500/10">
                    <PhTimer weight="fill" className="h-4 w-4 text-amber-500" />
                  </div>
                </div>
                <Input
                  id="length"
                  name="length"
                  value={formData.length}
                  onChange={handleInputChange}
                  placeholder="3:30"
                  className={cn(
                    "pl-12 transition-colors",
                    errors.length ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary"
                  )}
                />
                {errors.length && (
                  <p className="text-sm text-destructive mt-1.5 animate-in fade-in slide-in-from-top-1">{errors.length}</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right font-medium">
                Date
              </Label>
              <div className="col-span-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal hover:bg-accent/50 transition-colors pl-12 relative",
                        "focus-visible:ring-primary"
                      )}
                    >
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <div className="p-1 rounded-md bg-blue-500/10">
                          <PhCalendar weight="fill" className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                      {formData.dateCreated ? format(new Date(formData.dateCreated), "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={new Date(formData.dateCreated)}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right font-medium">
                Status
              </Label>
              <div className="col-span-3 relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                  <div className="p-1 rounded-md bg-indigo-500/10">
                    <PhQueue weight="fill" className="h-4 w-4 text-indigo-500" />
                  </div>
                </div>
                <Select 
                  value={formData.status} 
                  onValueChange={handleStatusChange}
                  name="status"
                >
                  <SelectTrigger 
                    id="status"
                    className="pl-12 focus-visible:ring-primary"
                    aria-label="Select project status"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel className="text-xs font-medium text-muted-foreground">Project Status</SelectLabel>
                      <SelectItem 
                        value="idea" 
                        className="text-sm"
                        role="option"
                        aria-selected={formData.status === 'idea'}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-zinc-400" />
                          Idea
                        </div>
                      </SelectItem>
                      <SelectItem 
                        value="in-progress" 
                        className="text-sm"
                        role="option"
                        aria-selected={formData.status === 'in-progress'}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          In Progress
                        </div>
                      </SelectItem>
                      <SelectItem 
                        value="mixing" 
                        className="text-sm"
                        role="option"
                        aria-selected={formData.status === 'mixing'}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-amber-500" />
                          Mixing
                        </div>
                      </SelectItem>
                      <SelectItem 
                        value="mastering" 
                        className="text-sm"
                        role="option"
                        aria-selected={formData.status === 'mastering'}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-violet-500" />
                          Mastering
                        </div>
                      </SelectItem>
                      <SelectItem 
                        value="completed" 
                        className="text-sm"
                        role="option"
                        aria-selected={formData.status === 'completed'}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-emerald-500" />
                          Completed
                        </div>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="audio" className="text-right font-medium mt-2">
                Audio File
              </Label>
              <div className="col-span-3 relative">
                <div className="absolute left-3 top-6 z-10">
                  <div className="p-1 rounded-md bg-rose-500/10">
                    <UploadSimple weight="fill" className="h-4 w-4 text-rose-500" />
                  </div>
                </div>
                <AudioUpload
                  onAudioUpload={setAudioFile}
                  onAudioRemove={() => setAudioFile(null)}
                  currentFile={audioFile}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={isAddingProject}
              className="w-full"
            >
              {isAddingProject ? (
                <>
                  <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Project
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateProjectDialog;
