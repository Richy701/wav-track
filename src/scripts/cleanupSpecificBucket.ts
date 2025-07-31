import { supabase } from '../lib/supabase'

interface BucketCleanupStats {
  bucketId: string
  totalFiles: number
  activeFiles: number
  orphanedFiles: number
  deletedProjectFiles: number
  filesToDelete: string[]
  fileDetails: Array<{
    name: string
    size: number
    lastModified: string
    isOrphaned: boolean
    isDeletedProject: boolean
  }>
}

export async function cleanupSpecificBucket(bucketId: string = '01342ba0-7e30-4562-9de1-ab90875d9b33'): Promise<BucketCleanupStats> {
  console.log(`🔍 Starting cleanup for bucket: ${bucketId}`)
  
  const stats: BucketCleanupStats = {
    bucketId,
    totalFiles: 0,
    activeFiles: 0,
    orphanedFiles: 0,
    deletedProjectFiles: 0,
    filesToDelete: [],
    fileDetails: []
  }
  
  try {
    // Step 1: Get all files from the specific bucket
    console.log('📁 Fetching all files from bucket...')
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from(bucketId)
      .list('', { limit: 1000 })
    
    if (storageError) {
      console.error('❌ Error fetching storage files:', storageError)
      throw storageError
    }
    
    stats.totalFiles = storageFiles?.length || 0
    console.log(`📊 Found ${stats.totalFiles} files in bucket`)
    
    if (!storageFiles || storageFiles.length === 0) {
      console.log('✅ No files found in bucket')
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
        // URL format: https://xxx.supabase.co/storage/v1/object/public/bucket-id/user-id/filename
        const urlParts = project.audio_url.split(`/${bucketId}/`)
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
    
    // Step 4: Analyze each file
    const storageFilePaths = storageFiles.map(file => file.name)
    const orphanedFiles = storageFilePaths.filter(filePath => 
      !activeAudioFiles.has(filePath) && !deletedProjectFiles.has(filePath)
    )
    
    stats.orphanedFiles = orphanedFiles.length
    console.log(`📊 Orphaned files: ${stats.orphanedFiles}`)
    
    // Step 5: Create detailed file analysis
    storageFiles.forEach(file => {
      const isOrphaned = orphanedFiles.includes(file.name)
      const isDeletedProject = deletedProjectFiles.has(file.name)
      
      stats.fileDetails.push({
        name: file.name,
        size: file.metadata?.size || 0,
        lastModified: file.updated_at || file.created_at || '',
        isOrphaned,
        isDeletedProject
      })
    })
    
    // Step 6: Files to delete (orphaned + deleted project files)
    stats.filesToDelete = [...orphanedFiles, ...deletedProjectFiles]
    
    if (stats.filesToDelete.length === 0) {
      console.log('✅ No files need to be deleted')
      return stats
    }
    
    console.log(`🗑️  Files to delete: ${stats.filesToDelete.length}`)
    console.log('📝 Files to be deleted:')
    stats.filesToDelete.forEach(file => console.log(`   - ${file}`))
    
    // Step 7: Calculate total size to be freed
    const totalSizeToDelete = stats.fileDetails
      .filter(file => stats.filesToDelete.includes(file.name))
      .reduce((total, file) => total + file.size, 0)
    
    console.log(`💾 Total size to be freed: ${(totalSizeToDelete / 1024 / 1024).toFixed(2)} MB`)
    
    // Step 8: Delete the files
    console.log('\n🗑️  Deleting files...')
    const { data: deleteResult, error: deleteError } = await supabase.storage
      .from(bucketId)
      .remove(stats.filesToDelete)
    
    if (deleteError) {
      console.error('❌ Error deleting files:', deleteError)
      throw deleteError
    }
    
    console.log('✅ Files deleted successfully!')
    console.log(`📊 Deleted ${stats.filesToDelete.length} files`)
    console.log(`💾 Freed ${(totalSizeToDelete / 1024 / 1024).toFixed(2)} MB of space`)
    
    // Step 9: Show final statistics
    const remainingFiles = stats.totalFiles - stats.filesToDelete.length
    console.log(`📊 Remaining files: ${remainingFiles}`)
    
    // Step 10: Verify deletion
    console.log('\n🔍 Verifying deletion...')
    const { data: remainingStorageFiles, error: verifyError } = await supabase.storage
      .from(bucketId)
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

// Function to get bucket statistics without deleting
export async function getBucketStats(bucketId: string = '01342ba0-7e30-4562-9de1-ab90875d9b33'): Promise<BucketCleanupStats> {
  console.log(`📊 Getting statistics for bucket: ${bucketId}`)
  
  const stats: BucketCleanupStats = {
    bucketId,
    totalFiles: 0,
    activeFiles: 0,
    orphanedFiles: 0,
    deletedProjectFiles: 0,
    filesToDelete: [],
    fileDetails: []
  }
  
  try {
    // Get all files from the bucket
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from(bucketId)
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
        const urlParts = project.audio_url.split(`/${bucketId}/`)
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
    
    // Create detailed file analysis
    storageFiles.forEach(file => {
      const isOrphaned = orphanedFiles.includes(file.name)
      const isDeletedProject = deletedProjectFiles.has(file.name)
      
      stats.fileDetails.push({
        name: file.name,
        size: file.metadata?.size || 0,
        lastModified: file.updated_at || file.created_at || '',
        isOrphaned,
        isDeletedProject
      })
    })
    
    return stats
    
  } catch (error) {
    console.error('❌ Error getting bucket stats:', error)
    throw error
  }
} 