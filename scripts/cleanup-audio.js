import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('- VITE_SUPABASE_URL')
  console.error('- SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupAudioFiles() {
  console.log('🔍 Starting audio file cleanup...')
  
  try {
    // Step 1: Get all audio files from storage
    console.log('📁 Fetching all audio files from storage...')
    const { data: storageFiles, error: storageError } = await supabase.storage
      .from('project-audio')
      .list('', { limit: 1000 })
    
    if (storageError) {
      console.error('❌ Error fetching storage files:', storageError)
      return
    }
    
    console.log(`📊 Found ${storageFiles?.length || 0} audio files in storage`)
    
    if (!storageFiles || storageFiles.length === 0) {
      console.log('✅ No audio files found in storage')
      return
    }
    
    // Step 2: Get all projects with audio URLs
    console.log('📋 Fetching projects with audio URLs...')
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('id, audio_url, is_deleted')
      .not('audio_url', 'is', null)
    
    if (projectsError) {
      console.error('❌ Error fetching projects:', projectsError)
      return
    }
    
    console.log(`📊 Found ${projects?.length || 0} projects with audio URLs`)
    
    // Step 3: Extract file paths from audio URLs
    const activeAudioFiles = new Set()
    const deletedProjectFiles = new Set()
    
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
    
    console.log(`📊 Active audio files: ${activeAudioFiles.size}`)
    console.log(`📊 Deleted project audio files: ${deletedProjectFiles.size}`)
    
    // Step 4: Find orphaned files (files in storage but not in active projects)
    const storageFilePaths = storageFiles.map(file => file.name)
    const orphanedFiles = storageFilePaths.filter(filePath => 
      !activeAudioFiles.has(filePath) && !deletedProjectFiles.has(filePath)
    )
    
    console.log(`📊 Orphaned files: ${orphanedFiles.length}`)
    
    // Step 5: Files to delete (orphaned + deleted project files)
    const filesToDelete = [...orphanedFiles, ...deletedProjectFiles]
    
    if (filesToDelete.length === 0) {
      console.log('✅ No files need to be deleted')
      return
    }
    
    console.log(`🗑️  Files to delete: ${filesToDelete.length}`)
    console.log('📝 Files to be deleted:')
    filesToDelete.forEach(file => console.log(`   - ${file}`))
    
    // Step 6: Delete the files
    console.log('\n🗑️  Deleting files...')
    const { data: deleteResult, error: deleteError } = await supabase.storage
      .from('project-audio')
      .remove(filesToDelete)
    
    if (deleteError) {
      console.error('❌ Error deleting files:', deleteError)
      return
    }
    
    console.log('✅ Files deleted successfully!')
    console.log(`📊 Deleted ${filesToDelete.length} files`)
    
    // Step 7: Show final statistics
    const remainingFiles = storageFilePaths.length - filesToDelete.length
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
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Run the cleanup
cleanupAudioFiles()
  .then(() => {
    console.log('\n🎉 Audio cleanup completed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  }) 