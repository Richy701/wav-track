import { useState, useEffect } from 'react'
import { Project } from '@/lib/types'
import { updateProject as updateProjectInStorage } from '@/lib/data'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectLabel,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  X,
  Plus,
  Music,
  Tag,
  Info,
  Mic2,
  Activity,
  Hash,
  Key,
  FileText,
  Percent,
} from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

interface EditProjectDialogProps {
  project: Project
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onProjectUpdated: (project: Project) => void
}

export default function EditProjectDialog({
  project,
  isOpen,
  onOpenChange,
  onProjectUpdated,
}: EditProjectDialogProps) {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description || '',
    genre: project.genre || '',
    bpm: project.bpm || '',
    key: project.key || '',
    status: project.status,
    completionPercentage: project.completionPercentage,
    audioFile: project.audioFile,
  })

  // Map status to completion percentage
  const statusToCompletion = {
    idea: 0,
    'in-progress': 25,
    mixing: 50,
    mastering: 75,
    completed: 100,
  }

  // Musical keys
  const musicalKeys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

  // Update completion percentage when status changes
  useEffect(() => {
    if (formData.status in statusToCompletion) {
      const suggestedCompletion =
        statusToCompletion[formData.status as keyof typeof statusToCompletion]
      setFormData(prev => ({
        ...prev,
        completionPercentage: suggestedCompletion,
      }))
    }
  }, [formData.status])

  // Genre options
  const genreOptions = [
    'Hip Hop',
    'Trap',
    'R&B',
    'Pop',
    'Electronic',
    'House',
    'Techno',
    'Drill',
    'Soul',
    'Jazz',
    'Lo-Fi',
    'Reggaeton',
    'Afrobeat',
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as Project['status'],
      completionPercentage: statusToCompletion[value as Project['status']],
    }))
  }

  const handleGenreChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      genre: value,
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      toast.error('Title is required', {
        description: 'Please enter a title for your project.',
      })
      return
    }

    if (formData.bpm && (isNaN(Number(formData.bpm)) || Number(formData.bpm) < 0)) {
      toast.error('Invalid BPM', {
        description: 'BPM must be a positive number.',
      })
      return
    }

    try {
      // Submit the project
      const updatedProject = {
        ...project,
        ...formData,
        bpm: formData.bpm ? Number(formData.bpm) : undefined,
      }

      onProjectUpdated(updatedProject)
      onOpenChange(false)
      toast.success('Project updated', {
        description: `"${formData.title}" has been updated.`,
      })
    } catch (error) {
      console.error('Error updating project:', error)
      toast.error('Failed to update project', {
        description: 'An error occurred while updating the project.',
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Make changes to your project here. Click save when you're done.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid gap-6 py-3">
            {/* Title and Description */}
            <div className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-3">
                <Label htmlFor="title" className="text-right text-sm font-medium">
                  Title
                </Label>
                <div className="col-span-3 relative">
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                    <div className="p-1 rounded-md bg-violet-500/10">
                      <Music className="h-4 w-4 text-violet-500" />
                    </div>
                  </div>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="pl-10 h-9 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-start gap-3">
                <Label htmlFor="description" className="text-right text-sm font-medium mt-1">
                  Description
                </Label>
                <div className="col-span-3">
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="h-20 text-sm"
                    placeholder="Enter project description"
                  />
                </div>
              </div>
            </div>

            {/* Genre */}
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="genre" className="text-right text-sm font-medium">
                Genre
              </Label>
              <div className="col-span-3 relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                  <div className="p-1 rounded-md bg-pink-500/10">
                    <Tag className="h-4 w-4 text-pink-500" />
                  </div>
                </div>
                <Select value={formData.genre} onValueChange={handleGenreChange}>
                  <SelectTrigger className="pl-10 h-9 text-sm">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Genre</SelectLabel>
                      {genreOptions.map(genre => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* BPM and Key */}
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="bpm" className="text-right text-sm font-medium">
                BPM
              </Label>
              <div className="col-span-3 relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                  <div className="p-1 rounded-md bg-amber-500/10">
                    <Activity className="h-4 w-4 text-amber-500" />
                  </div>
                </div>
                <Input
                  type="number"
                  id="bpm"
                  name="bpm"
                  value={formData.bpm}
                  onChange={handleChange}
                  min="20"
                  max="300"
                  className="pl-10 h-9 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="key" className="text-right text-sm font-medium">
                Key
              </Label>
              <div className="col-span-3 relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                  <div className="p-1 rounded-md bg-emerald-500/10">
                    <Key className="h-4 w-4 text-emerald-500" />
                  </div>
                </div>
                <Select value={formData.key} onValueChange={value => setFormData(prev => ({ ...prev, key: value }))}>
                  <SelectTrigger className="pl-10 h-9 text-sm">
                    <SelectValue placeholder="Select key" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Musical Key</SelectLabel>
                      {musicalKeys.map(key => (
                        <SelectItem key={key} value={key}>
                          {key}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status */}
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="status" className="text-right text-sm font-medium">
                Status
              </Label>
              <div className="col-span-3 relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                  <div className="p-1 rounded-md bg-indigo-500/10">
                    <FileText className="h-4 w-4 text-indigo-500" />
                  </div>
                </div>
                <Select value={formData.status} onValueChange={handleStatusChange}>
                  <SelectTrigger className="pl-10 h-9 text-sm">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Project Status</SelectLabel>
                      <SelectItem value="idea">
                        <span className="text-red-600 dark:text-red-400">Idea</span>
                      </SelectItem>
                      <SelectItem value="in-progress">
                        <span className="text-orange-600 dark:text-orange-400">In Progress</span>
                      </SelectItem>
                      <SelectItem value="mixing">
                        <span className="text-yellow-600 dark:text-yellow-400">Mixing</span>
                      </SelectItem>
                      <SelectItem value="mastering">
                        <span className="text-blue-600 dark:text-blue-400">Mastering</span>
                      </SelectItem>
                      <SelectItem value="completed">
                        <span className="text-green-600 dark:text-green-400">Completed</span>
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Completion Percentage */}
            <div className="grid grid-cols-4 items-center gap-3">
              <Label htmlFor="completion" className="text-right text-sm font-medium">
                Progress
              </Label>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center justify-end text-xs">
                  <span className="font-medium tabular-nums">
                    {formData.completionPercentage}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      (formData.completionPercentage ?? 0) === 100
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                        : (formData.completionPercentage ?? 0) >= 75
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          : (formData.completionPercentage ?? 0) >= 50
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-500'
                            : (formData.completionPercentage ?? 0) >= 25
                              ? 'bg-gradient-to-r from-orange-500 to-red-500'
                              : 'bg-gradient-to-r from-red-500 to-pink-500'
                    }`}
                    style={{ width: `${formData.completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
