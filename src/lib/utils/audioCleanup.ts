import { supabase } from '../supabase'
import { toast } from 'sonner'

export interface AudioCleanupResult {
  orphanedFilesDeleted: number
  oldFilesDeleted: number
  deletedProjectFilesDeleted: number
  totalFilesDeleted: number
  errors: string[]
}

/**
 * Clean up orphaned audio files that don't have corresponding active projects
 */
export async function cleanupOrphanedAudioFiles(): Promise<AudioCleanupResult> {
  const result: AudioCleanupResult = {
    orphanedFilesDeleted: 0,
    oldFilesDeleted: 0,
    deletedProjectFilesDeleted: 0,
    totalFilesDeleted: 0,
    errors: []
  }

  try {
    // Call the cleanup function
    const { data, error } = await supabase.rpc('cleanup_orphaned_audio_files')
    
    if (error) {
      result.errors.push(`Orphaned files cleanup failed: ${error.message}`)
      console.error('Orphaned files cleanup error:', error)
    } else if (data && data.length > 0) {
      result.orphanedFilesDeleted = data[0].deleted_count || 0
      console.log(`Cleaned up ${result.orphanedFilesDeleted} orphaned audio files`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    result.errors.push(`Orphaned files cleanup failed: ${errorMessage}`)
    console.error('Orphaned files cleanup error:', error)
  }

  return result
}

/**
 * Clean up old audio files from projects that haven't been modified in over 1 year
 */
export async function cleanupOldAudioFiles(): Promise<AudioCleanupResult> {
  const result: AudioCleanupResult = {
    orphanedFilesDeleted: 0,
    oldFilesDeleted: 0,
    deletedProjectFilesDeleted: 0,
    totalFilesDeleted: 0,
    errors: []
  }

  try {
    // Call the cleanup function
    const { data, error } = await supabase.rpc('cleanup_old_audio_files')
    
    if (error) {
      result.errors.push(`Old files cleanup failed: ${error.message}`)
      console.error('Old files cleanup error:', error)
    } else if (data && data.length > 0) {
      result.oldFilesDeleted = data[0].deleted_count || 0
      console.log(`Cleaned up ${result.oldFilesDeleted} old audio files`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    result.errors.push(`Old files cleanup failed: ${errorMessage}`)
    console.error('Old files cleanup error:', error)
  }

  return result
}

/**
 * Clean up audio files from soft-deleted projects
 */
export async function cleanupDeletedProjectAudio(): Promise<AudioCleanupResult> {
  const result: AudioCleanupResult = {
    orphanedFilesDeleted: 0,
    oldFilesDeleted: 0,
    deletedProjectFilesDeleted: 0,
    totalFilesDeleted: 0,
    errors: []
  }

  try {
    // Call the cleanup function
    const { data, error } = await supabase.rpc('cleanup_deleted_project_audio')
    
    if (error) {
      result.errors.push(`Deleted project files cleanup failed: ${error.message}`)
      console.error('Deleted project files cleanup error:', error)
    } else if (data && data.length > 0) {
      result.deletedProjectFilesDeleted = data[0].deleted_count || 0
      console.log(`Cleaned up ${result.deletedProjectFilesDeleted} deleted project audio files`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    result.errors.push(`Deleted project files cleanup failed: ${errorMessage}`)
    console.error('Deleted project files cleanup error:', error)
  }

  return result
}

/**
 * Perform comprehensive audio file cleanup
 */
export async function performAudioCleanup(): Promise<AudioCleanupResult> {
  const result: AudioCleanupResult = {
    orphanedFilesDeleted: 0,
    oldFilesDeleted: 0,
    deletedProjectFilesDeleted: 0,
    totalFilesDeleted: 0,
    errors: []
  }

  console.log('Starting comprehensive audio file cleanup...')

  // Clean up orphaned files
  const orphanedResult = await cleanupOrphanedAudioFiles()
  result.orphanedFilesDeleted = orphanedResult.orphanedFilesDeleted
  result.errors.push(...orphanedResult.errors)

  // Clean up old files
  const oldResult = await cleanupOldAudioFiles()
  result.oldFilesDeleted = oldResult.oldFilesDeleted
  result.errors.push(...oldResult.errors)

  // Clean up deleted project files
  const deletedResult = await cleanupDeletedProjectAudio()
  result.deletedProjectFilesDeleted = deletedResult.deletedProjectFilesDeleted
  result.errors.push(...deletedResult.errors)

  // Calculate total
  result.totalFilesDeleted = 
    result.orphanedFilesDeleted + 
    result.oldFilesDeleted + 
    result.deletedProjectFilesDeleted

  // Show results
  if (result.totalFilesDeleted > 0) {
    toast.success('Audio cleanup completed', {
      description: `Deleted ${result.totalFilesDeleted} files (${result.orphanedFilesDeleted} orphaned, ${result.oldFilesDeleted} old, ${result.deletedProjectFilesDeleted} deleted projects)`
    })
  } else {
    toast.info('Audio cleanup completed', {
      description: 'No files needed cleanup'
    })
  }

  if (result.errors.length > 0) {
    console.error('Audio cleanup errors:', result.errors)
    toast.error('Some cleanup operations failed', {
      description: `Check console for ${result.errors.length} error(s)`
    })
  }

  console.log('Audio cleanup completed:', result)
  return result
}

/**
 * Get audio storage statistics
 */
export async function getAudioStorageStats() {
  try {
    // Get count of audio files in storage
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('project-audio')
      .list('', { limit: 1000 })

    if (storageError) {
      console.error('Error getting storage files:', storageError)
      return null
    }

    // Get count of projects with audio
    const { count: projectsWithAudio, error: projectsError } = await supabase
      .from('projects')
      .select('*', { count: 'exact', head: true })
      .not('audio_url', 'is', null)
      .eq('is_deleted', false)

    if (projectsError) {
      console.error('Error getting projects count:', projectsError)
      return null
    }

    return {
      totalAudioFiles: storageFiles?.length || 0,
      projectsWithAudio: projectsWithAudio || 0,
      orphanedFiles: Math.max(0, (storageFiles?.length || 0) - (projectsWithAudio || 0))
    }
  } catch (error) {
    console.error('Error getting audio storage stats:', error)
    return null
  }
} 