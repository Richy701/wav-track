import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Lightbulb, Bell } from '@phosphor-icons/react'
import { Loader2 } from 'lucide-react'
import type { CreativeNote } from '@/hooks/useCreativeNotes'

interface EditNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdateNote: (noteId: string, text: string, type: 'idea' | 'reminder') => void
  note: CreativeNote | null
  isLoading?: boolean
}

export function EditNoteDialog({ open, onOpenChange, onUpdateNote, note, isLoading }: EditNoteDialogProps) {
  const [text, setText] = useState('')
  const [type, setType] = useState<'idea' | 'reminder'>('idea')

  // Update form when note changes
  useEffect(() => {
    if (note) {
      setText(note.text)
      setType(note.type)
    }
  }, [note])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || !note) return
    
    onUpdateNote(note.id, text.trim(), type)
    onOpenChange(false)
  }

  const handleCancel = () => {
    if (note) {
      setText(note.text)
      setType(note.type)
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Creative Note</DialogTitle>
          <DialogDescription>
            Update your creative idea or reminder.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-note-text">Note</Label>
            <Textarea
              id="edit-note-text"
              placeholder="What's on your mind?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[100px] resize-none"
              maxLength={500}
              disabled={isLoading}
            />
            <div className="text-xs text-muted-foreground text-right">
              {text.length}/500
            </div>
          </div>

          <div className="space-y-3">
            <Label>Type</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => setType(value as 'idea' | 'reminder')}
              className="flex space-x-4"
              disabled={isLoading}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="idea" id="edit-idea" />
                <Label htmlFor="edit-idea" className="flex items-center gap-2 cursor-pointer">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  Creative Idea
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reminder" id="edit-reminder" />
                <Label htmlFor="edit-reminder" className="flex items-center gap-2 cursor-pointer">
                  <Bell className="h-4 w-4 text-blue-600" />
                  Reminder
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!text.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Note'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}