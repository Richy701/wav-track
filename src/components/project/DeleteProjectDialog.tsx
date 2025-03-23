import { useState } from 'react'
import { Project } from '@/lib/types'
import { toast } from 'sonner'
import { useProjects } from '@/hooks/useProjects'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteProjectDialogProps {
  project: Project
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export default function DeleteProjectDialog({
  project,
  isOpen,
  onOpenChange,
  onConfirm,
}: DeleteProjectDialogProps) {
  const { deleteProject, isDeletingProject } = useProjects()

  const handleDelete = async () => {
    try {
      await deleteProject(project.id)
      onOpenChange(false)
      onConfirm()
      toast.success('Project deleted', {
        description: `"${project.title}" has been removed.`,
      })
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.error('Failed to delete project', {
        description: 'An error occurred while deleting the project.',
      })
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete "{project.title}". This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeletingProject}
          >
            {isDeletingProject ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
