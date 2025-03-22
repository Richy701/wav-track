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
  CircleNotch,
  Image
} from '@phosphor-icons/react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { format } from "date-fns";
import { Project } from '@/lib/types';
import { recordBeatCreation } from '@/lib/data';
import { uploadCoverArt } from '@/lib/services/coverArt';
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
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

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
  const queryClient = useQueryClient();
  const { addProject, isAddingProject } = useProjects();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'idea' as Project['status'],
    bpm: 120,
    key: 'C',
    genres: [] as string[],
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
    
    if (formData.genres.length === 0) {
      newErrors.genres = 'At least one genre is required';
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
    if (!formData.genres.includes(value)) {
      setFormData(prev => ({
        ...prev,
        genres: [...prev.genres, value].sort()
      }));
    }
    if (errors.genres) {
      setErrors(prev => ({ ...prev, genres: '' }));
    }
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(genre => genre !== genreToRemove)
    }));
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
      // Create the project first without cover art
      const newProject: Omit<Project, 'id'> = {
        ...formData,
        genre: formData.genres.join(', '), // Join multiple genres for storage
        lastModified: new Date().toISOString(),
      };

      // Create project with cover art if available
      const projectWithCoverArt = {
        ...newProject,
        coverArt: formData.coverArt // Use the URL that was saved during upload
      };

      // Create the project and get back the database-generated ID
      const createdProject = await addProject(projectWithCoverArt);

      if (!createdProject) {
        throw new Error('Failed to create project');
      }

      // Record the beat activity with the database-generated ID
      await recordBeatCreation(createdProject.id, 1);

      // Invalidate queries without waiting for refetch
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['beatActivities'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });

      // Reset form and close dialog immediately for better UX
      setFormData({
        title: '',
        description: '',
        status: 'idea',
        bpm: 120,
        key: 'C',
        genres: [],
        tags: [],
        completionPercentage: 0,
        dateCreated: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        length: '3:30',
      });
      setCoverArtFile(null);
      setAudioFile(null);
      setErrors({});
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

  // Add cover art file handler
  const handleCoverArtChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingCover(true);
      setCoverArtFile(file); // Set the file immediately for preview

      const { url } = await uploadCoverArt(file);
      if (!url) {
        throw new Error('No URL returned from upload');
      }

      setFormData(prev => ({ ...prev, coverArt: url }));
      toast.success('Cover art uploaded successfully');
    } catch (error) {
      console.error('Error uploading cover art:', error);
      setCoverArtFile(null); // Clear the file if upload failed
      toast.error('Failed to upload cover art', {
        description: error instanceof Error ? error.message : 'Please try again or choose a different image.'
      });
    } finally {
      setIsUploadingCover(false);
      // Clear the input value to allow selecting the same file again
      e.target.value = '';
    }
  };

  const handleRemoveCoverArt = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCoverArtFile(null);
    setFormData(prev => ({ ...prev, coverArt: undefined }));
  };

  const handleAudioAnalysis = (result: AudioAnalysisResult) => {
    setFormData(prev => ({
      ...prev,
      bpm: Math.round(result.bpm),
      key: result.key,
      length: formatLength(result.duration)
    }));
    
    // Add appropriate genres based on analysis
    if (result.danceability > 0.7) {
      handleGenreChange('Electronic');
      handleGenreChange('House');
    } else if (result.energy > 0.7) {
      handleGenreChange('Hip Hop');
      handleGenreChange('Trap');
    }
    
    toast.success('Audio analysis complete', {
      description: `Detected BPM: ${Math.round(result.bpm)}, Key: ${result.key}`
    });
  };

  const formatLength = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-xl">Create New Beat</DialogTitle>
          <DialogDescription className="text-sm">
            Add a new beat to your collection. Fill in the details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateBeat} className="space-y-6">
          <div className="grid gap-6 py-3">
            {/* Title and Description Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="title" className="text-right text-sm font-medium">
                  Title
                </Label>
                <div className="col-span-3 relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
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
                      "pl-10 h-9 text-sm transition-colors",
                      errors.title ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary"
                    )}
                    placeholder="Enter project title"
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive mt-1 animate-in fade-in slide-in-from-top-1">{errors.title}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-3">
                <Label htmlFor="description" className="text-right text-sm font-medium mt-1">
                  Description
                </Label>
                <div className="col-span-3">
                  <Input
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter project description"
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Genre Section */}
            <div className="grid grid-cols-4 items-start gap-3">
              <Label htmlFor="genre" className="text-right text-sm font-medium">
                Genres
              </Label>
              <div className="col-span-3 relative space-y-2">
                <div className="relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10">
                    <div className="p-1 rounded-md bg-pink-500/10">
                      <PhTag weight="fill" className="h-4 w-4 text-pink-500" />
                    </div>
                  </div>
                  <Select 
                    value=""
                    onValueChange={handleGenreChange}
                    name="genre"
                  >
                    <SelectTrigger 
                      id="genre"
                      className={cn(
                        "pl-10 h-9 text-sm transition-colors",
                        errors.genres ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary"
                      )}
                      aria-label="Select project genres"
                      aria-describedby={errors.genres ? "genre-error" : undefined}
                    >
                      <SelectValue placeholder="Select genres" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel className="text-sm">Genres</SelectLabel>
                        {genreOptions.map(genre => (
                          <SelectItem 
                            key={genre} 
                            value={genre}
                            role="option"
                            disabled={formData.genres.includes(genre)}
                            className="cursor-pointer transition-colors hover:bg-muted/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
                          >
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                {formData.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {formData.genres.map((genre) => (
                      <Badge
                        key={genre}
                        variant="secondary"
                        className="flex items-center gap-1 px-2 py-1 text-sm"
                      >
                        {genre}
                        <button
                          type="button"
                          className="ml-1 rounded-full hover:bg-muted/50 p-0.5"
                          onClick={() => handleRemoveGenre(genre)}
                          aria-label={`Remove ${genre} genre`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                
                {errors.genres && (
                  <p id="genre-error" className="text-xs text-destructive mt-1 animate-in fade-in slide-in-from-top-1">
                    {errors.genres}
                  </p>
                )}
              </div>
            </div>
            
            {/* BPM and Key Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="bpm" className="text-right text-sm font-medium">
                  BPM
                </Label>
                <div className="col-span-3 flex items-center gap-3">
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
                  <span className="text-sm font-mono w-12 text-center bg-muted/50 px-2 py-1 rounded-md ring-1 ring-border/50">
                    {formData.bpm}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="key" className="text-right text-sm font-medium">
                  Key
                </Label>
                <div className="col-span-3 relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                    <div className="p-1 rounded-md bg-purple-500/10">
                      <MusicNote weight="fill" className="h-4 w-4 text-purple-500" />
                    </div>
                  </div>
                  <Select 
                    value={formData.key} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, key: value }))}
                    name="key"
                  >
                    <SelectTrigger 
                      id="key"
                      className="pl-10 h-9 text-sm focus-visible:ring-primary"
                      aria-label="Select project key"
                    >
                      <SelectValue placeholder="Select key" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel className="text-sm">Project Key</SelectLabel>
                        {['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].map(key => (
                          <SelectItem 
                            key={key}
                            value={key} 
                            className="cursor-pointer transition-colors hover:bg-muted/50 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground text-sm"
                          >
                            {key}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* Length and Date Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="length" className="text-right text-sm font-medium">
                  Length
                </Label>
                <div className="col-span-3 relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
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
                      "pl-10 h-9 text-sm transition-colors",
                      errors.length ? "border-destructive focus-visible:ring-destructive" : "focus-visible:ring-primary"
                    )}
                  />
                  {errors.length && (
                    <p className="text-xs text-destructive mt-1 animate-in fade-in slide-in-from-top-1">{errors.length}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="date" className="text-right text-sm font-medium">
                  Date
                </Label>
                <div className="col-span-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal hover:bg-accent/50 transition-colors pl-10 h-9 text-sm relative",
                          "focus-visible:ring-primary"
                        )}
                      >
                        <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
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
            </div>
            
            {/* Status Section */}
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="status" className="text-right text-sm font-medium">
                Status
              </Label>
              <div className="col-span-3 relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 z-10">
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
                    className="pl-10 h-9 text-sm hover:bg-accent/50 transition-colors focus-visible:ring-primary"
                    aria-label="Select project status"
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-background dark:bg-background border shadow-lg min-w-[200px]">
                    <SelectGroup>
                      <SelectLabel className="text-xs text-muted-foreground px-3 py-1.5">Project Status</SelectLabel>
                      <SelectItem 
                        value="idea"
                        className="hover:bg-accent/50 cursor-pointer transition-colors px-3 py-1.5 text-sm data-[highlighted]:bg-accent/50"
                      >
                        <span className="text-red-600 dark:text-red-400">Idea</span>
                      </SelectItem>
                      <SelectItem 
                        value="in-progress"
                        className="hover:bg-accent/50 cursor-pointer transition-colors px-3 py-1.5 text-sm data-[highlighted]:bg-accent/50"
                      >
                        <span className="text-orange-600 dark:text-orange-400">In Progress</span>
                      </SelectItem>
                      <SelectItem 
                        value="mixing"
                        className="hover:bg-accent/50 cursor-pointer transition-colors px-3 py-1.5 text-sm data-[highlighted]:bg-accent/50"
                      >
                        <span className="text-yellow-600 dark:text-yellow-400">Mixing</span>
                      </SelectItem>
                      <SelectItem 
                        value="mastering"
                        className="hover:bg-accent/50 cursor-pointer transition-colors px-3 py-1.5 text-sm data-[highlighted]:bg-accent/50"
                      >
                        <span className="text-blue-600 dark:text-blue-400">Mastering</span>
                      </SelectItem>
                      <SelectItem 
                        value="completed"
                        className="hover:bg-accent/50 cursor-pointer transition-colors px-3 py-1.5 text-sm data-[highlighted]:bg-accent/50"
                      >
                        <span className="text-green-600 dark:text-green-400">Completed</span>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Files Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-start gap-3">
                <Label htmlFor="audio" className="text-right text-sm font-medium mt-1">
                  Audio File
                </Label>
                <div className="col-span-3">
                  <AudioUpload
                    onAudioUpload={setAudioFile}
                    onAudioRemove={() => setAudioFile(null)}
                    onAnalysisComplete={handleAudioAnalysis}
                    currentFile={audioFile}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-3">
                <Label htmlFor="coverArt" className="text-right text-sm font-medium mt-1">
                  Cover Art
                </Label>
                <div className="col-span-3">
                  <div className="relative">
                    <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                      <div className="p-1 rounded-md bg-rose-500/10">
                        <Image weight="fill" className="h-4 w-4 text-rose-500" />
                      </div>
                    </div>
                    <div className="relative">
                      <Input
                        type="file"
                        id="coverArt"
                        name="coverArt"
                        accept="image/*"
                        onChange={handleCoverArtChange}
                        className="pl-10 h-9 text-sm file:hidden cursor-pointer"
                        disabled={isUploadingCover}
                      />
                      <div className="absolute inset-0 pointer-events-none pl-10 flex items-center gap-2">
                        {(coverArtFile || formData.coverArt) && (
                          <>
                            <div className="h-7 w-7 rounded-sm overflow-hidden border border-border/50 bg-background relative">
                              {isUploadingCover ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                  <div className="h-4 w-4 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                              ) : (
                                <img
                                  src={coverArtFile ? URL.createObjectURL(coverArtFile) : formData.coverArt}
                                  alt="Cover art preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                                  }}
                                />
                              )}
                            </div>
                            <span className="text-sm truncate flex-1">
                              {isUploadingCover ? 'Uploading...' : (coverArtFile ? coverArtFile.name : 'Current cover art')}
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveCoverArt}
                              className="p-0.5 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-destructive transition-colors"
                              aria-label="Remove cover art"
                              disabled={isUploadingCover}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </>
                        )}
                        {!coverArtFile && !formData.coverArt && !isUploadingCover && (
                          <span className="text-muted-foreground">Choose cover art...</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter className="pt-3">
            <Button 
              type="submit" 
              disabled={isAddingProject}
              className="w-full h-9 text-sm"
            >
              {isAddingProject ? (
                <>
                  <CircleNotch className="mr-2 h-4 w-4 animate-spin" />
                  Creating Project...
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
