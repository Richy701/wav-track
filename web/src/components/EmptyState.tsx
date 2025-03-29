import { Button } from './ui/button'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

export function EmptyState() {
  const { user } = useAuth()

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
      <p className="text-muted-foreground mb-4">Create your first project to get started.</p>
    </div>
  )
}
