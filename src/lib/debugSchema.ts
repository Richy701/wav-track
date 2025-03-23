import { supabase } from './supabase'
import { logError } from './errorLogger'

// Function to inspect database schema
export const inspectProjectsTable = async (): Promise<void> => {
  console.log('Inspecting projects table structure...')

  // Get the current user for authorization
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    logError('Auth Error', 'Failed to get current user', userError)
    throw new Error(`Authentication error: ${userError.message}`)
  }

  if (!user) {
    const error = new Error('No authenticated user found')
    logError('Auth Error', error.message)
    throw error
  }

  // 1. Try to get a single project to see the structure
  const { data: sampleProject, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .limit(1)
    .single()

  if (projectError) {
    logError('Database Error', 'Error getting sample project', projectError)
    console.error('Error getting sample project:', projectError)
  } else {
    console.log('Sample project structure:', JSON.stringify(sampleProject, null, 2))
  }

  // Skip RPC call that might not exist
  console.log('Note: Table schema inspection requires admin privileges and is not available')

  // 3. Try inserting a minimal project to see what fields are required
  const minimalProject = {
    title: 'Debug Test Project',
    description: 'Test project for debug purposes',
    status: 'idea',
    user_id: user.id,
    created_at: new Date().toISOString(),
    last_modified: new Date().toISOString(),
    dateCreated: new Date().toISOString(),
    lastModified: new Date().toISOString(),
  }

  console.log('Trying to insert minimal project:', JSON.stringify(minimalProject, null, 2))

  const { data: insertResult, error: insertError } = await supabase
    .from('projects')
    .insert([minimalProject])
    .select()
    .single()

  if (insertError) {
    logError('Database Error', 'Error inserting minimal project', insertError)
    console.error('Error inserting minimal project:', insertError)
  } else {
    console.log('Successfully inserted minimal project:', insertResult)

    // Clean up the test project
    const { error: deleteError } = await supabase
      .from('projects')
      .delete()
      .eq('id', insertResult.id)

    if (deleteError) {
      logError('Database Error', 'Error deleting test project', deleteError)
      console.error('Error deleting test project:', deleteError)
    } else {
      console.log('Successfully deleted test project')
    }
  }

  console.log('Inspection complete!')
}

// Function to check existing data
export const checkExistingData = async (): Promise<void> => {
  console.log('Checking existing data...')

  // Get the current user for authorization
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    logError('Auth Error', 'Failed to get current user', userError)
    throw new Error(`Authentication error: ${userError.message}`)
  }

  if (!user) {
    const error = new Error('No authenticated user found')
    logError('Auth Error', error.message)
    throw error
  }

  // Count projects
  const { data: projectCount, error: countError } = await supabase
    .from('projects')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    logError('Database Error', 'Error counting projects', countError)
    console.error('Error counting projects:', countError)
  } else {
    console.log(`Total projects in database: ${projectCount?.count || 0}`)
  }

  // Count user's projects
  const { data: userProjects, error: userProjectsError } = await supabase
    .from('projects')
    .select('id, title, status, created_at, last_modified')
    .eq('user_id', user.id)

  if (userProjectsError) {
    logError('Database Error', 'Error getting user projects', userProjectsError)
    console.error('Error getting user projects:', userProjectsError)
  } else {
    console.log(`User has ${userProjects?.length || 0} projects`)
    if (userProjects && userProjects.length > 0) {
      console.log('First few user projects:', userProjects.slice(0, 3))
    }
  }

  console.log('Data check complete!')
}
