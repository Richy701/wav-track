import { useState } from 'react'
import { Plus, Pin, PinOff, X } from 'lucide-react'
import { Note } from '@/lib/types'
import { cn } from '@/lib/utils'

interface NotesProps {
  notes: Note[]
}

export default function Notes({ notes }: NotesProps) {
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)

  // Format the date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  // Toggle pin status (in a real app, this would update the backend)
  const togglePin = (id: string) => {
    // In a real implementation, this would update the backend
    console.log(`Toggle pin for note: ${id}`)
  }

  return (
    <div className="bg-card rounded-xl overflow-hidden h-full animate-fade-in">
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-medium">Notes & Ideas</h3>
          <button className="text-sm text-primary hover:text-primary/80 flex items-center transition-colors">
            <Plus size={16} className="mr-1" />
            New Note
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100%-4rem)]">
        <div className="w-1/3 border-r border-border overflow-auto">
          {notes.length > 0 ? (
            notes.map(note => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                className={cn(
                  'p-4 border-b border-border cursor-pointer transition-colors',
                  selectedNote?.id === note.id ? 'bg-secondary' : 'hover:bg-secondary/50'
                )}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium truncate">{note.title}</h4>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      togglePin(note.id)
                    }}
                    className="text-muted-foreground hover:text-primary ml-2 transition-colors"
                  >
                    {note.pinned ? <Pin size={14} /> : <PinOff size={14} />}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{note.content}</p>
                <p className="text-xs text-muted-foreground mt-2">{formatDate(note.dateCreated)}</p>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground">No notes available</div>
          )}
        </div>

        <div className="w-2/3 p-5 overflow-auto">
          {selectedNote ? (
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">{selectedNote.title}</h3>
                <button className="text-muted-foreground hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              <div className="text-sm text-muted-foreground mb-6">
                Created on {formatDate(selectedNote.dateCreated)}
                {selectedNote.projectId && ' • Project: Summer Waves'}
              </div>

              <div className="prose prose-sm dark:prose-invert max-w-none">
                <p>{selectedNote.content}</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-center text-muted-foreground">
              <div>
                <p className="mb-4">Select a note to view or edit</p>
                <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors">
                  <Plus size={18} />
                  <span>Create New Note</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
