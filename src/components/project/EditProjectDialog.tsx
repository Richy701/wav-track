import { useState, useEffect } from 'react';
import { Project } from '@/lib/types';
import { updateProject as updateProjectInStorage } from '@/lib/data';
import { uploadCoverArt } from '@/lib/services/coverArt';
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Music, Tag, Info, Mic2, Activity, Hash, Key, FileText, Percent, Image as ImageIcon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || '',
    genre: project.genre || '',
    genres: project.genres || [],
    bpm: project.bpm || '',
    key: project.key || '',
    status: project.status,
    completionPercentage: project.completionPercentage,
    audioFile: project.audioFile,
    coverArt: project.coverArt
  });
  const [coverArtFile, setCoverArtFile] = useState<File | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverArtPreview, setCoverArtPreview] = useState<string | null>(
    formData.coverArt || null
  );
  
  // Map status to completion percentage
  const statusToCompletion = {
    'idea': 0,
    'in-progress': 25,
    'mixing': 50,
    'mastering': 75,
    'completed': 100
  };
  
  // Musical keys
  const musicalKeys = [
    'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'
  ];
  
  // Update completion percentage when status changes
  useEffect(() => {
    if (formData.status in statusToCompletion) {
      const suggestedCompletion = statusToCompletion[formData.status as keyof typeof statusToCompletion];
      setFormData(prev => ({
        ...prev,
        completionPercentage: suggestedCompletion
      }));
    }
  }, [formData.status]);
  
  // Genre options
  const genreOptions = [
    'Hip Hop', 'Trap', 'R&B', 'Pop', 'Electronic', 'House', 
    'Techno', 'Drill', 'Soul', 'Jazz', 'Lo-Fi', 'Reggaeton', 'Afrobeat'
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as Project['status'],
      completionPercentage: statusToCompletion[value as Project['status']]
    }));
  };

  const handleGenreChange = (value: string) => {
    if (formData.genres.includes(value)) return;
    if (formData.genres.length >= 3) {
      toast.error("Maximum genres reached", {
        description: "You can only select up to 3 genres."
      });
      return;
    }
    setFormData(prev => ({
      ...prev,
      genres: [...prev.genres, value]
    }));
  };

  const handleRemoveGenre = (genreToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.filter(genre => genre !== genreToRemove)
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Title is required", {
        description: "Please enter a title for your project."
      });
      return;
    }

    if (formData.bpm && (isNaN(Number(formData.bpm)) || Number(formData.bpm) < 0)) {
      toast.error("Invalid BPM", {
        description: "BPM must be a positive number."
      });
      return;
    }

    try {
      // Submit the project without coverArt
      const updatedProject = {
        ...project,
        ...formData,
        // Remove coverArt from the update
        coverArt: undefined
      };

      onProjectUpdated(updatedProject);
      onOpenChange(false);
      toast.success("Project updated", {
        description: `"${formData.title}" has been updated.`
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error("Failed to update project", {
        description: "An error occurred while updating the project."
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] dark:bg-background/95 bg-background/95 backdrop-blur-sm">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-semibold">Edit Project</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Make changes to your project here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSave}>
          <ScrollArea className="h-[50vh] px-4">
            <div className="space-y-4 py-2">
              {/* Basic Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-blue-500/10 dark:bg-blue-500/20">
                    <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  </div>
                  <h3 className="text-sm font-medium">Basic Information</h3>
                </div>
                <div className="grid gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter project title"
                      className="h-8 px-3 bg-background dark:bg-background"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter project description"
                      className="h-20 resize-none px-3 bg-background dark:bg-background"
                    />
                  </div>
                </div>
              </div>

              <Separator className="my-3" />

              {/* Project Information */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-purple-500/10 dark:bg-purple-500/20">
                    <Mic2 className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                  </div>
                  <h3 className="text-sm font-medium">Project Information</h3>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="genre">Genres</Label>
                    <div className="space-y-1.5">
                      <Select onValueChange={handleGenreChange}>
                        <SelectTrigger className="h-8 hover:bg-accent/50 transition-colors px-3 w-full bg-background dark:bg-background">
                          <SelectValue placeholder="Add genre" className="text-sm" />
                        </SelectTrigger>
                        <SelectContent className="bg-background dark:bg-background border shadow-lg min-w-[200px]">
                          <SelectGroup>
                            <SelectLabel className="text-xs text-muted-foreground px-3 py-1.5">Genres</SelectLabel>
                            {genreOptions
                              .filter(genre => !formData.genres.includes(genre))
                              .map(genre => (
                                <SelectItem 
                                  key={genre} 
                                  value={genre}
                                  className="hover:bg-accent/50 cursor-pointer transition-colors px-3 py-1.5 text-sm data-[highlighted]:bg-accent/50"
                                >
                                  <span className="text-purple-600 dark:text-purple-400">{genre}</span>
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.genres.map((genre) => (
                          <Badge 
                            key={genre} 
                            variant="secondary" 
                            className="flex items-center gap-1 h-6 px-2 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 dark:hover:bg-purple-500/30"
                          >
                            {genre}
                            <button
                              type="button"
                              onClick={() => handleRemoveGenre(genre)}
                              className="ml-0.5 hover:text-purple-700 dark:hover:text-purple-300"
                              aria-label={`Remove ${genre} genre`}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      {formData.genres.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {formData.genres.length}/3 genres selected
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="bpm">BPM</Label>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-purple-500/10 dark:bg-purple-500/20">
                        <Hash className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                      </div>
                      <Input
                        id="bpm"
                        name="bpm"
                        type="number"
                        value={formData.bpm}
                        onChange={handleChange}
                        placeholder="Enter BPM"
                        className="h-8 px-3 bg-background dark:bg-background"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="key">Key</Label>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-purple-500/10 dark:bg-purple-500/20">
                        <Key className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                      </div>
                      <Select value={formData.key} onValueChange={(value) => handleChange({ target: { name: 'key', value } } as any)}>
                        <SelectTrigger className="h-8 hover:bg-accent/50 transition-colors px-3 w-full bg-background dark:bg-background">
                          <SelectValue placeholder="Select key" className="text-sm" />
                        </SelectTrigger>
                        <SelectContent className="bg-background dark:bg-background border shadow-lg min-w-[200px]">
                          <SelectGroup>
                            <SelectLabel className="text-xs text-muted-foreground px-3 py-1.5">Project Key</SelectLabel>
                            {musicalKeys.map(key => (
                              <SelectItem 
                                key={key} 
                                value={key}
                                className="hover:bg-accent/50 cursor-pointer transition-colors px-3 py-1.5 text-sm data-[highlighted]:bg-accent/50"
                              >
                                <span className="text-purple-600 dark:text-purple-400">{key}</span>
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-3" />

              {/* Project Status */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-orange-500/10 dark:bg-orange-500/20">
                    <Activity className="h-4 w-4 text-orange-500 dark:text-orange-400" />
                  </div>
                  <h3 className="text-sm font-medium">Project Status</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="status">Status</Label>
                    <div className="space-y-1.5">
                      <Select value={formData.status} onValueChange={handleStatusChange}>
                        <SelectTrigger className="h-8 hover:bg-accent/50 transition-colors px-3 w-full bg-background dark:bg-background">
                          <SelectValue className="text-sm" />
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
                  <div className="space-y-1.5">
                    <Label>Completion</Label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-8 flex items-center">
                        <div className="w-full h-1.5 rounded-full bg-muted/50 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              formData.completionPercentage === 100 
                                ? 'bg-gradient-to-r from-green-500/90 to-emerald-500/90 dark:from-green-400 dark:to-emerald-400' 
                                : formData.completionPercentage >= 75
                                ? 'bg-gradient-to-r from-blue-500/90 to-indigo-500/90 dark:from-blue-400 dark:to-indigo-400'
                                : formData.completionPercentage >= 50
                                ? 'bg-gradient-to-r from-yellow-500/90 to-amber-500/90 dark:from-yellow-400 dark:to-amber-400'
                                : formData.completionPercentage >= 25
                                ? 'bg-gradient-to-r from-orange-500/90 to-red-500/90 dark:from-orange-400 dark:to-red-400'
                                : 'bg-gradient-to-r from-red-500/90 to-pink-500/90 dark:from-red-400 dark:to-pink-400'
                            }`}
                            style={{ width: `${formData.completionPercentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-[40px] text-center">
                        <span className={`text-sm font-medium ${
                          formData.completionPercentage === 100 
                            ? 'text-green-600 dark:text-green-400' 
                            : formData.completionPercentage >= 75
                            ? 'text-blue-600 dark:text-blue-400'
                            : formData.completionPercentage >= 50
                            ? 'text-yellow-600 dark:text-yellow-400'
                            : formData.completionPercentage >= 25
                            ? 'text-orange-600 dark:text-orange-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {formData.completionPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-3" />

              {/* Audio File */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-green-500/10 dark:bg-green-500/20">
                    <Music className="h-4 w-4 text-green-500 dark:text-green-400" />
                  </div>
                  <h3 className="text-sm font-medium">Audio File</h3>
                </div>
                <div className="space-y-1.5">
                  {formData.audioFile ? (
                    <div className="flex items-center justify-between p-2 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-green-500 dark:text-green-400" />
                        <div>
                          <p className="text-sm font-medium">{formData.audioFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(formData.audioFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => setFormData(prev => ({ ...prev, audioFile: undefined }))}
                        aria-label="Remove audio file"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg bg-muted/50">
                      <p className="text-sm text-muted-foreground">No audio file uploaded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="secondary" size="default">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" size="default">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
