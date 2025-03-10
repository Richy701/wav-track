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
  X as PhX 
} from '@phosphor-icons/react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { format } from "date-fns";
import { Project } from '@/lib/types';
import { addProject, recordBeatCreation } from '@/lib/data';
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

interface CreateProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  projectsCount: number;
  onProjectCreated?: () => void;
}

export default function CreateProjectDialog({ isOpen, onOpenChange, projectsCount, onProjectCreated }: CreateProjectDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [newBeat, setNewBeat] = useState({
    title: `New Project ${projectsCount > 0 ? projectsCount + 1 : 1}`,
    genre: 'Hip Hop',
    bpm: 95,
    status: 'idea' as Project['status'],
    description: '',
    completionPercentage: 0,
    length: '3:30',
    createdDate: new Date()
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!newBeat.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!newBeat.genre) {
      newErrors.genre = 'Genre is required';
    }
    
    if (!newBeat.length.match(/^\d+:\d{2}$/)) {
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
        setNewBeat(prev => ({ ...prev, [name]: bpmValue }));
      }
    } else {
      setNewBeat(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBpmChange = (value: number[]) => {
    setNewBeat(prev => ({ ...prev, bpm: value[0] }));
  };

  const handleStatusChange = (value: string) => {
    const status = value as Project['status'];
    const completionPercentage = getCompletionPercentage(status);
    setNewBeat(prev => ({ 
      ...prev, 
      status,
      completionPercentage
    }));
  };

  const handleGenreChange = (value: string) => {
    setNewBeat(prev => ({ ...prev, genre: value }));
    if (errors.genre) {
      setErrors(prev => ({ ...prev, genre: '' }));
    }
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setNewBeat(prev => ({ ...prev, createdDate: date }));
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

  const handleCreateBeat = async () => {
    if (!validateForm()) {
      toast.error("Please fix the errors before continuing");
      return;
    }
    
    setIsSubmitting(true);
    try {
      let audioFileData = null;

      if (audioFile) {
        // In a real app, you would upload the file to a storage service here
        // For now, we'll just create an object URL
        audioFileData = {
          name: audioFile.name,
          size: audioFile.size,
          type: audioFile.type,
          url: URL.createObjectURL(audioFile)
        };
      }

      const newProject = {
        id: uuidv4(),
        title: newBeat.title,
        description: newBeat.description || '',
        genre: newBeat.genre,
        bpm: newBeat.bpm,
        key: 'C',
        status: newBeat.status as Project['status'],
        dateCreated: newBeat.createdDate.toISOString(),
        lastModified: new Date().toISOString(),
        completionPercentage: newBeat.completionPercentage,
        length: newBeat.length,
        tags: [],
        audioFile: audioFileData
      };
      
      await addProject(newProject);
      await recordBeatCreation(newProject.id, 1, newBeat.createdDate);
      
      toast.success("New project created! 🎵", {
        description: `"${newProject.title}" has been added to your projects.`,
      });
      
      // Call the onProjectCreated callback if provided
      if (onProjectCreated) {
        onProjectCreated();
      }
      
      // Reset form and close dialog
      setNewBeat({
        title: `New Project ${projectsCount > 0 ? projectsCount + 1 : 1}`,
        genre: 'Hip Hop',
        bpm: 95,
        status: 'idea' as Project['status'],
        description: '',
        completionPercentage: 0,
        length: '3:30',
        createdDate: new Date()
      });
      setAudioFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project", {
        description: "An error occurred. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const genreOptions = [
    'Hip Hop', 'Trap', 'R&B', 'Pop', 'Electronic', 'House', 
    'Techno', 'Drill', 'Soul', 'Jazz', 'Lo-Fi', 'Reggaeton', 'Afrobeat'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] overflow-hidden bg-background border-border/50 shadow-lg">
        <DialogHeader className="pb-2 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 ring-1 ring-primary/20">
              <Sparkle weight="fill" className="h-6 w-6 text-primary animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold tracking-tight">Create New Project</DialogTitle>
              <DialogDescription className="text-muted-foreground/90">
                Set up your new beat with key details. Let's get this track started.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
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
                value={newBeat.title}
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
              <Select value={newBeat.genre} onValueChange={handleGenreChange}>
                <SelectTrigger 
                  className={cn(
                    "pl-12 transition-colors",
                    errors.genre ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary"
                  )}
                >
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
              {errors.genre && (
                <p className="text-sm text-destructive mt-1.5 animate-in fade-in slide-in-from-top-1">{errors.genre}</p>
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
                value={[newBeat.bpm]}
                onValueChange={handleBpmChange}
                className="flex-1"
              />
              <span className="text-sm font-mono w-14 text-center bg-muted/50 px-2.5 py-1.5 rounded-md ring-1 ring-border/50">
                {newBeat.bpm}
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
                value={newBeat.length}
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
                    {newBeat.createdDate ? format(newBeat.createdDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={newBeat.createdDate}
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
              <Select value={newBeat.status} onValueChange={handleStatusChange}>
                <SelectTrigger className="pl-12 focus-visible:ring-primary">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel className="text-xs font-medium text-muted-foreground">Project Status</SelectLabel>
                    <SelectItem value="idea" className="text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-zinc-400" />
                        Idea
                      </div>
                    </SelectItem>
                    <SelectItem value="in-progress" className="text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        In Progress
                      </div>
                    </SelectItem>
                    <SelectItem value="mixing" className="text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        Mixing
                      </div>
                    </SelectItem>
                    <SelectItem value="mastering" className="text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-violet-500" />
                        Mastering
                      </div>
                    </SelectItem>
                    <SelectItem value="completed" className="text-sm">
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
        
        <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-border">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-w-[100px] bg-background hover:bg-accent hover:text-accent-foreground"
          >
            <span className="flex items-center gap-2">
              <PhX weight="bold" className="h-4 w-4" />
              Cancel
            </span>
          </Button>
          <Button 
            onClick={handleCreateBeat}
            disabled={isSubmitting}
            className="min-w-[140px] bg-primary hover:bg-primary/90"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Plus weight="bold" className="h-4 w-4" />
                Create Project
              </span>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
