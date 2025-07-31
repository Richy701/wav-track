import { supabase } from '../lib/supabase'

interface DeepCleanupStats {
  bucketId: string
  totalFiles: number
  totalSize: number
  fileTypes: Record<string, number>
  userFolders: Record<string, number>
  orphanedFiles: string[]
  orphanedSize: number
  filesToDelete: string[]
  fileDetails: Array<{
    name: string
    size: number
    lastModified: string
    type: string
    userFolder: string
    isOrphaned: boolean
  }>
}

export async function deepCleanupBucket(bucketId: string = '01342ba0-7e30-4562-9de1-ab90875d9b33'): Promise<DeepCleanupStats> {
  console.log(`🔍 Starting deep cleanup for bucket: ${bucketId}`)
  
  const stats: DeepCleanupStats = {
    bucketId,
    totalFiles: 0,
    totalSize: 0,
    fileTypes: {},
    userFolders: {},
    orphanedFiles: [],
    orphanedSize: 0,
    filesToDelete: [],
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
      
      stats.fileDetails.push({
        name: file.name,
        size,
        lastModified: file.updated_at || file.created_at || '',
        type: fileExt,
        userFolder,
        isOrphaned: false
      })
    })
    
    console.log(`📊 Total size: ${(stats.totalSize / 1024 / 1024).toFixed(2)} MB`)
    console.log(`📊 File types:`, stats.fileTypes)
    console.log(`📊 User folders:`, stats.userFolders)
    
    // Step 3: Get all projects to check for references
    console.log('📋 Fetching all projects...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, audio_url, is_deleted, user_id')
    
    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError)
      throw projectsError
    }
    
    console.log(`📊 Found ${projects?.length || 0} projects`)
    
    // Step 4: Get all users to check for valid user folders
    console.log('📋 Fetching all users...')
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError)
      // Continue without user validation for now
    }
    
    const validUserIds = new Set(users?.data?.map(user => user.id) || [])
    console.log(`📊 Found ${validUserIds.size} valid users`)
    
    // Step 5: Find orphaned files
    const referencedFiles = new Set<string>()
    
    // Check project audio URLs
    projects?.forEach(project => {
      if (project.audio_url) {
        const urlParts = project.audio_url.split(`/${bucketId}/`)
        if (urlParts.length > 1) {
          referencedFiles.add(urlParts[1])
        }
      }
    })
    
    // Find orphaned files
    stats.orphanedFiles = storageFiles
      .map(file => file.name)
      .filter(fileName => !referencedFiles.has(fileName))
    
    stats.orphanedSize = stats.fileDetails
      .filter(file => stats.orphanedFiles.includes(file.name))
      .reduce((total, file) => total + file.size, 0)
    
    // Mark orphaned files
    stats.fileDetails.forEach(file => {
      file.isOrphaned = stats.orphanedFiles.includes(file.name)
    })
    
    console.log(`📊 Orphaned files: ${stats.orphanedFiles.length}`)
    console.log(`📊 Orphaned size: ${(stats.orphanedSize / 1024 / 1024).toFixed(2)} MB`)
    
    // Step 6: Additional cleanup strategies
    const filesToDelete = [...stats.orphanedFiles]
    
    // Strategy 1: Delete files from non-existent users
    const invalidUserFiles = storageFiles
      .filter(file => {
        const userFolder = file.name.split('/')[0]
        return userFolder && !validUserIds.has(userFolder) && userFolder !== 'root'
      })
      .map(file => file.name)
    
    console.log(`📊 Files from invalid users: ${invalidUserFiles.length}`)
    filesToDelete.push(...invalidUserFiles)
    
    // Strategy 2: Delete files older than 1 year (if no project reference)
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    const oldFiles = storageFiles
      .filter(file => {
        const lastModified = new Date(file.updated_at || file.created_at || '')
        return lastModified < oneYearAgo && !referencedFiles.has(file.name)
      })
      .map(file => file.name)
    
    console.log(`📊 Old files (>1 year): ${oldFiles.length}`)
    filesToDelete.push(...oldFiles)
    
    // Remove duplicates
    stats.filesToDelete = [...new Set(filesToDelete)]
    
    if (stats.filesToDelete.length === 0) {
      console.log('✅ No files need to be deleted')
      return stats
    }
    
    console.log(`🗑️  Files to delete: ${stats.filesToDelete.length}`)
    console.log('📝 Files to be deleted:')
    stats.filesToDelete.forEach(file => console.log(`   - ${file}`))
    
    // Calculate total size to be freed
    const totalSizeToDelete = stats.fileDetails
      .filter(file => stats.filesToDelete.includes(file.name))
      .reduce((total, file) => total + file.size, 0)
    
    console.log(`💾 Total size to be freed: ${(totalSizeToDelete / 1024 / 1024).toFixed(2)} MB`)
    
    // Step 7: Delete the files
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
    
    return stats
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    throw error
  }
}

// Function to get detailed bucket analysis without deleting
export async function getDeepBucketAnalysis(bucketId: string = '01342ba0-7e30-4562-9de1-ab90875d9b33'): Promise<DeepCleanupStats> {
  console.log(`📊 Getting deep analysis for bucket: ${bucketId}`)
  
  const stats: DeepCleanupStats = {
    bucketId,
    totalFiles: 0,
    totalSize: 0,
    fileTypes: {},
    userFolders: {},
    orphanedFiles: [],
    orphanedSize: 0,
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
    
    // Analyze all files
    storageFiles.forEach(file => {
      const size = file.metadata?.size || 0
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'unknown'
      const userFolder = file.name.split('/')[0] || 'root'
      
      stats.totalSize += size
      stats.fileTypes[fileExt] = (stats.fileTypes[fileExt] || 0) + 1
      stats.userFolders[userFolder] = (stats.userFolders[userFolder] || 0) + 1
      
      stats.fileDetails.push({
        name: file.name,
        size,
        lastModified: file.updated_at || file.created_at || '',
        type: fileExt,
        userFolder,
        isOrphaned: false
      })
    })
    
    // Get all projects
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, audio_url, is_deleted, user_id')
    
    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError)
      throw projectsError
    }
    
    // Get all users
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers()
    const validUserIds = new Set(users?.data?.map(user => user.id) || [])
    
    // Find referenced files
    const referencedFiles = new Set<string>()
    projects?.forEach(project => {
      if (project.audio_url) {
        const urlParts = project.audio_url.split(`/${bucketId}/`)
        if (urlParts.length > 1) {
          referencedFiles.add(urlParts[1])
        }
      }
    })
    
    // Find orphaned files
    stats.orphanedFiles = storageFiles
      .map(file => file.name)
      .filter(fileName => !referencedFiles.has(fileName))
    
    stats.orphanedSize = stats.fileDetails
      .filter(file => stats.orphanedFiles.includes(file.name))
      .reduce((total, file) => total + file.size, 0)
    
    // Mark orphaned files
    stats.fileDetails.forEach(file => {
      file.isOrphaned = stats.orphanedFiles.includes(file.name)
    })
    
    // Find files to delete
    const filesToDelete = [...stats.orphanedFiles]
    
    // Add files from invalid users
    const invalidUserFiles = storageFiles
      .filter(file => {
        const userFolder = file.name.split('/')[0]
        return userFolder && !validUserIds.has(userFolder) && userFolder !== 'root'
      })
      .map(file => file.name)
    
    filesToDelete.push(...invalidUserFiles)
    
    // Add old files
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    
    const oldFiles = storageFiles
      .filter(file => {
        const lastModified = new Date(file.updated_at || file.created_at || '')
        return lastModified < oneYearAgo && !referencedFiles.has(file.name)
      })
      .map(file => file.name)
    
    filesToDelete.push(...oldFiles)
    
    // Remove duplicates
    stats.filesToDelete = [...new Set(filesToDelete)]
    
    return stats
    
  } catch (error) {
    console.error('❌ Error getting deep analysis:', error)
    throw error
  }
} 