import { useState, useCallback, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface CreativeNote {
  id: string
  text: string
  type: 'idea' | 'reminder'
  created_at: string
  updated_at: string
  user_id: string
}

export function useCreativeNotes() {
  const { user, isInitialized } = useAuth()
  const queryClient = useQueryClient()
  const [useLocalStorage, setUseLocalStorage] = useState(false)

  // Fetch notes from database or localStorage
  const { data: notes = [], isLoading, error } = useQuery({
    queryKey: ['creative-notes', user?.id, useLocalStorage, isInitialized],
    queryFn: async () => {
      if (!user || !isInitialized) return []

      // If we're using localStorage fallback
      if (useLocalStorage) {
        const stored = localStorage.getItem(`creative-notes-${user.id}`)
        return stored ? JSON.parse(stored) : []
      }

      const { data, error } = await supabase
        .from('creative_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        // If table doesn't exist or any database error, fall back to localStorage silently
        if (error.code === '42P01' || error.message?.includes('404') || error.status === 404 || error.code === 'PGRST116') {
          // Don't log expected 404 errors to avoid console noise
          setUseLocalStorage(true)
          const stored = localStorage.getItem(`creative-notes-${user.id}`)
          return stored ? JSON.parse(stored) : []
        }
        // For other unexpected errors, log them but still fall back to localStorage
        console.warn('Database error for creative notes, falling back to localStorage:', error)
        setUseLocalStorage(true)
        const stored = localStorage.getItem(`creative-notes-${user.id}`)
        return stored ? JSON.parse(stored) : []
      }

      return data || []
    },
    enabled: !!user && isInitialized,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404 errors (table doesn't exist)
      if (error?.code === '42P01' || error?.message?.includes('404') || error?.status === 404 || error?.code === 'PGRST116') {
        return false
      }
      // Retry other errors up to 2 times
      return failureCount < 2
    },
    retryDelay: 1000
  })

  // Add note mutation
  const addNoteMutation = useMutation({
    mutationFn: async ({ text, type }: { text: string; type: 'idea' | 'reminder' }) => {
      if (!user) throw new Error('User not authenticated')

      const newNote = {
        id: Date.now().toString(),
        text,
        type,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id
      }

      // If using localStorage
      if (useLocalStorage) {
        const stored = localStorage.getItem(`creative-notes-${user.id}`)
        const existingNotes = stored ? JSON.parse(stored) : []
        const updatedNotes = [newNote, ...existingNotes]
        localStorage.setItem(`creative-notes-${user.id}`, JSON.stringify(updatedNotes))
        return newNote
      }

      // Try to insert into database
      const { data, error } = await supabase
        .from('creative_notes')
        .insert([{
          text,
          type,
          user_id: user.id
        }])
        .select()
        .single()

      if (error) {
        // Silently fall back to localStorage for expected database errors
        if (error.code === '42P01' || error.message?.includes('404') || error.status === 404 || error.code === 'PGRST116') {
          // Don't log expected errors
        } else {
          console.warn('Error adding note to database, falling back to localStorage:', error)
        }
        // Fall back to localStorage for any database error
        setUseLocalStorage(true)
        const stored = localStorage.getItem(`creative-notes-${user.id}`)
        const existingNotes = stored ? JSON.parse(stored) : []
        const updatedNotes = [newNote, ...existingNotes]
        localStorage.setItem(`creative-notes-${user.id}`, JSON.stringify(updatedNotes))
        return newNote
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-notes', user?.id, useLocalStorage] })
    },
  })

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: async ({ noteId, text, type }: { noteId: string; text: string; type: 'idea' | 'reminder' }) => {
      if (!user) throw new Error('User not authenticated')

      const updatedNote = {
        text,
        type,
        updated_at: new Date().toISOString()
      }

      // If using localStorage
      if (useLocalStorage) {
        const stored = localStorage.getItem(`creative-notes-${user.id}`)
        const existingNotes: CreativeNote[] = stored ? JSON.parse(stored) : []
        const updatedNotes = existingNotes.map(note => 
          note.id === noteId ? { ...note, ...updatedNote } : note
        )
        localStorage.setItem(`creative-notes-${user.id}`, JSON.stringify(updatedNotes))
        return { ...existingNotes.find(n => n.id === noteId), ...updatedNote }
      }

      // Try to update in database
      const { data, error } = await supabase
        .from('creative_notes')
        .update({ text, type })
        .eq('id', noteId)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        // Silently fall back to localStorage for expected database errors
        if (error.code === '42P01' || error.message?.includes('404') || error.status === 404 || error.code === 'PGRST116') {
          // Don't log expected errors
        } else {
          console.warn('Error updating note in database, falling back to localStorage:', error)
        }
        // Fall back to localStorage for any database error
        setUseLocalStorage(true)
        const stored = localStorage.getItem(`creative-notes-${user.id}`)
        const existingNotes: CreativeNote[] = stored ? JSON.parse(stored) : []
        const updatedNotes = existingNotes.map(note => 
          note.id === noteId ? { ...note, ...updatedNote } : note
        )
        localStorage.setItem(`creative-notes-${user.id}`, JSON.stringify(updatedNotes))
        return { ...existingNotes.find(n => n.id === noteId), ...updatedNote }
      }

      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-notes', user?.id, useLocalStorage] })
    },
  })

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      if (!user) throw new Error('User not authenticated')

      // If using localStorage
      if (useLocalStorage) {
        const stored = localStorage.getItem(`creative-notes-${user.id}`)
        const existingNotes: CreativeNote[] = stored ? JSON.parse(stored) : []
        const updatedNotes = existingNotes.filter(note => note.id !== noteId)
        localStorage.setItem(`creative-notes-${user.id}`, JSON.stringify(updatedNotes))
        return noteId
      }

      const { error } = await supabase
        .from('creative_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id)

      if (error && error.code !== '42P01') {
        throw error
      }

      return noteId
    },
    onMutate: async (noteId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['creative-notes', user?.id, useLocalStorage] })
      const previousNotes = queryClient.getQueryData(['creative-notes', user?.id, useLocalStorage])
      
      queryClient.setQueryData(['creative-notes', user?.id, useLocalStorage], (old: CreativeNote[] = []) =>
        old.filter(note => note.id !== noteId)
      )

      return { previousNotes }
    },
    onError: (err, noteId, context) => {
      // Rollback on error
      if (context?.previousNotes) {
        queryClient.setQueryData(['creative-notes', user?.id, useLocalStorage], context.previousNotes)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['creative-notes', user?.id, useLocalStorage] })
    },
  })

  const addNote = useCallback((text: string, type: 'idea' | 'reminder') => {
    if (!text.trim()) return
    addNoteMutation.mutate({ text: text.trim(), type })
  }, [addNoteMutation])

  const updateNote = useCallback((noteId: string, text: string, type: 'idea' | 'reminder') => {
    if (!text.trim()) return
    updateNoteMutation.mutate({ noteId, text: text.trim(), type })
  }, [updateNoteMutation])

  const deleteNote = useCallback((noteId: string) => {
    deleteNoteMutation.mutate(noteId)
  }, [deleteNoteMutation])

  return {
    notes,
    isLoading,
    error,
    addNote,
    updateNote,
    deleteNote,
    isAddingNote: addNoteMutation.isPending,
    isUpdatingNote: updateNoteMutation.isPending,
    isDeletingNote: deleteNoteMutation.isPending,
  }
}