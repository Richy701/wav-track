import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Lightbulb, Bell, X, PencilSimple } from '@phosphor-icons/react'
import { useCreativeNotes, type CreativeNote } from '@/hooks/useCreativeNotes'
import { AddNoteDialog } from '@/components/ui/add-note-dialog'
import { EditNoteDialog } from '@/components/ui/edit-note-dialog'
import { formatDistanceToNow } from 'date-fns'

export function CreativeNotes() {
  const { notes, addNote, updateNote, deleteNote, isAddingNote, isUpdatingNote } = useCreativeNotes()
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false)
  const [isEditNoteDialogOpen, setIsEditNoteDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<CreativeNote | null>(null)

  const handleEditNote = (note: CreativeNote) => {
    setEditingNote(note)
    setIsEditNoteDialogOpen(true)
  }

  return (
    <>
      <motion.div 
        className="relative space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {/* Header */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-start gap-2">
              <Brain className="h-5 w-5 text-orange-600 dark:text-orange-400" weight="fill" />
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Creative Notes
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Capture your creative ideas
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsAddNoteDialogOpen(true)}
              className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition-colors"
            >
              + Add Note
            </button>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          {notes.length > 0 ? (
            notes.slice(0, 6).map((note, index) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -20, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ 
                  delay: 0.4 + (index * 0.1),
                  duration: 0.4,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ 
                  scale: 1.02,
                  y: -2,
                  transition: { duration: 0.2 }
                }}
                className="flex items-start gap-3 p-3 rounded-lg bg-black/5 dark:bg-black/20 border border-zinc-200/20 dark:border-zinc-800/20 backdrop-blur-sm group hover:shadow-md hover:bg-black/10 dark:hover:bg-black/30 transition-all duration-300"
              >
                <motion.div 
                  className={`p-1.5 rounded-md shadow-sm ${
                    note.type === 'idea' 
                      ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  }`}
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 5,
                    transition: { duration: 0.2 }
                  }}
                >
                  {note.type === 'idea' ? (
                    <Lightbulb className="h-3 w-3" weight="fill" />
                  ) : (
                    <Bell className="h-3 w-3" />
                  )}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <motion.p 
                    className="text-sm text-zinc-900 dark:text-white font-medium"
                    whileHover={{ x: 2 }}
                    transition={{ duration: 0.2 }}
                  >
                    {note.text}
                  </motion.p>
                  <motion.p 
                    className="text-xs text-zinc-500 dark:text-zinc-400 mt-1"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 + (index * 0.1), duration: 0.3 }}
                  >
                    {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                  </motion.p>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <button 
                    onClick={() => handleEditNote(note)}
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200"
                    title="Edit note"
                  >
                    <PencilSimple className="h-3 w-3 text-zinc-400" />
                  </button>
                  <button 
                    onClick={() => deleteNote(note.id)}
                    className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all duration-200"
                    title="Delete note"
                  >
                    <X className="h-3 w-3 text-zinc-400" />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 px-4 rounded-lg bg-black/5 dark:bg-black/20 border border-zinc-200/20 dark:border-zinc-800/20 backdrop-blur-sm"
            >
              <Brain className="h-8 w-8 text-orange-500 dark:text-orange-400 mx-auto mb-3" weight="fill" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No creative notes yet. Use the + Add Note button above to get started.
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Add Note Dialog */}
      <AddNoteDialog
        open={isAddNoteDialogOpen}
        onOpenChange={setIsAddNoteDialogOpen}
        onAddNote={addNote}
        isLoading={isAddingNote}
      />

      {/* Edit Note Dialog */}
      <EditNoteDialog
        open={isEditNoteDialogOpen}
        onOpenChange={setIsEditNoteDialogOpen}
        onUpdateNote={updateNote}
        note={editingNote}
        isLoading={isUpdatingNote}
      />
    </>
  )
}