import { supabase } from '../lib/supabase'

interface AudioCleanupStats {
  totalFiles: number
  activeFiles: number
  orphanedFiles: number
  deletedProjectFiles: number
  filesToDelete: string[]
}

export async function cleanupUnusedAudioFiles(): Promise<AudioCleanupStats> {
  console.log('🔍 Starting audio file cleanup...')
  
  const stats: AudioCleanupStats = {
    totalFiles: 0,
    activeFiles: 0,
    orphanedFiles: 0,
    deletedProjectFiles: 0,
    filesToDelete: []
  }
  
  try {
    // Step 1: Get all audio files from storage
    console.log('📁 Fetching all audio files from storage...')
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('project-audio')
      .list('', { limit: 1000 })
    
    if (storageError) {
      console.error('❌ Error fetching storage files:', storageError)
      throw storageError
    }
    
    stats.totalFiles = storageFiles?.length || 0
    console.log(`📊 Found ${stats.totalFiles} audio files in storage`)
    
    if (!storageFiles || storageFiles.length === 0) {
      console.log('✅ No audio files found in storage')
      return stats
    }
    
    // Step 2: Get all projects with audio URLs
    console.log('📋 Fetching projects with audio URLs...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, audio_url, is_deleted')
      .not('audio_url', 'is', null)
    
    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError)
      throw projectsError
    }
    
    console.log(`📊 Found ${projects?.length || 0} projects with audio URLs`)
    
    // Step 3: Extract file paths from audio URLs
    const activeAudioFiles = new Set<string>()
    const deletedProjectFiles = new Set<string>()
    
    projects?.forEach(project => {
      if (project.audio_url) {
        // Extract the file path from the URL
        // URL format: https://xxx.supabase.co/storage/v1/object/public/project-audio/user-id/filename
        const urlParts = project.audio_url.split('/project-audio/')
        if (urlParts.length > 1) {
          const filePath = urlParts[1]
          if (project.is_deleted) {
            deletedProjectFiles.add(filePath)
          } else {
            activeAudioFiles.add(filePath)
          }
        }
      }
    })
    
    stats.activeFiles = activeAudioFiles.size
    stats.deletedProjectFiles = deletedProjectFiles.size
    console.log(`📊 Active audio files: ${stats.activeFiles}`)
    console.log(`📊 Deleted project audio files: ${stats.deletedProjectFiles}`)
    
    // Step 4: Find orphaned files (files in storage but not in active projects)
    const storageFilePaths = storageFiles.map(file => file.name)
    const orphanedFiles = storageFilePaths.filter(filePath => 
      !activeAudioFiles.has(filePath) && !deletedProjectFiles.has(filePath)
    )
    
    stats.orphanedFiles = orphanedFiles.length
    console.log(`📊 Orphaned files: ${stats.orphanedFiles}`)
    
    // Step 5: Files to delete (orphaned + deleted project files)
    stats.filesToDelete = [...orphanedFiles, ...deletedProjectFiles]
    
    if (stats.filesToDelete.length === 0) {
      console.log('✅ No files need to be deleted')
      return stats
    }
    
    console.log(`🗑️  Files to delete: ${stats.filesToDelete.length}`)
    console.log('📝 Files to be deleted:')
    stats.filesToDelete.forEach(file => console.log(`   - ${file}`))
    
    // Step 6: Delete the files
    console.log('\n🗑️  Deleting files...')
    const { data: deleteResult, error: deleteError } = await supabase.storage
      .from('project-audio')
      .remove(stats.filesToDelete)
    
    if (deleteError) {
      console.error('❌ Error deleting files:', deleteError)
      throw deleteError
    }
    
    console.log('✅ Files deleted successfully!')
    console.log(`📊 Deleted ${stats.filesToDelete.length} files`)
    
    // Step 7: Show final statistics
    const remainingFiles = stats.totalFiles - stats.filesToDelete.length
    console.log(`📊 Remaining files: ${remainingFiles}`)
    
    // Step 8: Verify deletion
    console.log('\n🔍 Verifying deletion...')
    const { data: remainingStorageFiles, error: verifyError } = await supabase.storage
      .from('project-audio')
      .list('', { limit: 1000 })
    
    if (verifyError) {
      console.error('❌ Error verifying deletion:', verifyError)
    } else {
      console.log(`✅ Verification complete: ${remainingStorageFiles?.length || 0} files remaining`)
    }
    
    return stats
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    throw error
  }
}

// Function to get audio storage statistics without deleting
export async function getAudioStorageStats(): Promise<AudioCleanupStats> {
  console.log('📊 Getting audio storage statistics...')
  
  const stats: AudioCleanupStats = {
    totalFiles: 0,
    activeFiles: 0,
    orphanedFiles: 0,
    deletedProjectFiles: 0,
    filesToDelete: []
  }
  
  try {
    // Get all audio files from storage
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('project-audio')
      .list('', { limit: 1000 })
    
    if (storageError) {
      console.error('❌ Error fetching storage files:', storageError)
      throw storageError
    }
    
    stats.totalFiles = storageFiles?.length || 0
    
    if (!storageFiles || storageFiles.length === 0) {
      return stats
    }
    
    // Get all projects with audio URLs
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, audio_url, is_deleted')
      .not('audio_url', 'is', null)
    
    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError)
      throw projectsError
    }
    
    // Extract file paths from audio URLs
    const activeAudioFiles = new Set<string>()
    const deletedProjectFiles = new Set<string>()
    
    projects?.forEach(project => {
      if (project.audio_url) {
        const urlParts = project.audio_url.split('/project-audio/')
        if (urlParts.length > 1) {
          const filePath = urlParts[1]
          if (project.is_deleted) {
            deletedProjectFiles.add(filePath)
          } else {
            activeAudioFiles.add(filePath)
          }
        }
      }
    })
    
    stats.activeFiles = activeAudioFiles.size
    stats.deletedProjectFiles = deletedProjectFiles.size
    
    // Find orphaned files
    const storageFilePaths = storageFiles.map(file => file.name)
    const orphanedFiles = storageFilePaths.filter(filePath => 
      !activeAudioFiles.has(filePath) && !deletedProjectFiles.has(filePath)
    )
    
    stats.orphanedFiles = orphanedFiles.length
    stats.filesToDelete = [...orphanedFiles, ...deletedProjectFiles]
    
    return stats
    
  } catch (error) {
    console.error('❌ Error getting storage stats:', error)
    throw error
  }
} 