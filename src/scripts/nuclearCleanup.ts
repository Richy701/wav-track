import { supabase } from '../lib/supabase'

interface NuclearCleanupStats {
  bucketId: string
  totalFiles: number
  totalSize: number
  fileTypes: Record<string, number>
  userFolders: Record<string, number>
  allFiles: string[]
  fileDetails: Array<{
    name: string
    size: number
    lastModified: string
    type: string
    userFolder: string
  }>
}

export async function nuclearCleanupBucket(bucketId: string = '01342ba0-7e30-4562-9de1-ab90875d9b33'): Promise<NuclearCleanupStats> {
  console.log(`☢️  Starting NUCLEAR cleanup for bucket: ${bucketId}`)
  console.log('⚠️  WARNING: This will delete ALL files in the bucket!')
  
  const stats: NuclearCleanupStats = {
    bucketId,
    totalFiles: 0,
    totalSize: 0,
    fileTypes: {},
    userFolders: {},
    allFiles: [],
    fileDetails: []
  }
  
  try {
    // Step 1: Get all files from the bucket
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
    
    // Step 2: Analyze all files
    console.log('📋 Analyzing files...')
    storageFiles.forEach(file => {
      const size = file.metadata?.size || 0
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'unknown'
      const userFolder = file.name.split('/')[0] || 'root'
      
      // Update statistics
      stats.totalSize += size
      stats.fileTypes[fileExt] = (stats.fileTypes[fileExt] || 0) + 1
      stats.userFolders[userFolder] = (stats.userFolders[userFolder] || 0) + 1
      stats.allFiles.push(file.name)
      
      stats.fileDetails.push({
        name: file.name,
        size,
        lastModified: file.updated_at || file.created_at || '',
        type: fileExt,
        userFolder
      })
    })
    
    console.log(`📊 Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`📊 File types:`, stats.fileTypes)
    console.log(`📊 User folders:`, stats.userFolders)
    console.log(`📊 All files will be deleted: ${stats.allFiles.length}`)
    
    // Step 3: Show detailed breakdown
    console.log('\n📝 Files to be deleted:')
    stats.fileDetails.forEach(file => {
      console.log(`   - ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB, ${file.type})`)
    })
    
    // Step 4: Delete ALL files
    console.log('\n☢️  NUCLEAR DELETE: Removing ALL files...')
    const { data: deleteResult, error: deleteError } = await supabase.storage
      .from(bucketId)
      .remove(stats.allFiles)
    
    if (deleteError) {
      console.error('❌ Error deleting files:', deleteError)
      throw deleteError
    }
    
    console.log('✅ NUCLEAR cleanup completed!')
    console.log(`📊 Deleted ${stats.allFiles.length} files`)
    console.log(`💾 Freed ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB of space`)
    
    // Step 5: Verify bucket is empty
    console.log('\n🔍 Verifying bucket is empty...')
    const { data: remainingFiles, error: verifyError } = await supabase.storage
      .from(bucketId)
      .list('', { limit: 1000 })
    
    if (verifyError) {
      console.error('❌ Error verifying deletion:', verifyError)
    } else {
      console.log(`✅ Verification complete: ${remainingFiles?.length || 0} files remaining`)
      if (remainingFiles?.length === 0) {
        console.log('🎉 Bucket is completely empty!')
      }
    }
    
    return stats
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    throw error
  }
}

// Function to get nuclear analysis without deleting
export async function getNuclearAnalysis(bucketId: string = '01342ba0-7e30-4562-9de1-ab90875d9b33'): Promise<NuclearCleanupStats> {
  console.log(`📊 Getting nuclear analysis for bucket: ${bucketId}`)
  
  const stats: NuclearCleanupStats = {
    bucketId,
    totalFiles: 0,
    totalSize: 0,
    fileTypes: {},
    userFolders: {},
    allFiles: [],
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
    
    // Analyze all files
    storageFiles.forEach(file => {
      const size = file.metadata?.size || 0
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'unknown'
      const userFolder = file.name.split('/')[0] || 'root'
      
      stats.totalSize += size
      stats.fileTypes[fileExt] = (stats.fileTypes[fileExt] || 0) + 1
      stats.userFolders[userFolder] = (stats.userFolders[userFolder] || 0) + 1
      stats.allFiles.push(file.name)
      
      stats.fileDetails.push({
        name: file.name,
        size,
        lastModified: file.updated_at || file.created_at || '',
        type: fileExt,
        userFolder
      })
    })
    
    return stats
    
  } catch (error) {
    console.error('❌ Error getting nuclear analysis:', error)
    throw error
  }
} 