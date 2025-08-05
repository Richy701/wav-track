import React, { useState } from 'react'
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

interface AddNoteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddNote: (text: string, type: 'idea' | 'reminder') => void
  isLoading?: boolean
}

export function AddNoteDialog({ open, onOpenChange, onAddNote, isLoading }: AddNoteDialogProps) {
  const [text, setText] = useState('')
  const [type, setType] = useState<'idea' | 'reminder'>('idea')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    
    onAddNote(text.trim(), type)
    setText('')
    setType('idea')
    onOpenChange(false)
  }

  const handleCancel = () => {
    setText('')
    setType('idea')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Creative Note</DialogTitle>
          <DialogDescription>
            Capture your creative ideas and reminders for future sessions.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="note-text">Note</Label>
            <Textarea
              id="note-text"
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
                <RadioGroupItem value="idea" id="idea" />
                <Label htmlFor="idea" className="flex items-center gap-2 cursor-pointer">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  Creative Idea
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="reminder" id="reminder" />
                <Label htmlFor="reminder" className="flex items-center gap-2 cursor-pointer">
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
                  Adding...
                </>
              ) : (
                'Add Note'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}