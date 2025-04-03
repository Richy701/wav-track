import { Project, Sample, Session, Note, BeatActivity } from './types'
import { cache } from './cache'
import { format as formatDate } from 'date-fns'
import { supabase } from './supabase'
import { User } from '@supabase/supabase-js'
import { Database } from '@/integrations/supabase/types'
import { QueryClient } from '@tanstack/react-query'

// Batch size for storage operations
const BATCH_SIZE = 100

// Type for pending writes
interface PendingWrites {
  [key: string]: unknown[]
}

interface ChartData {
  label: string
  value: number
  cumulative?: number
  date?: string
  period?: string
}

interface ChartDataPoint {
  label: string
  value: number
}

// Load data from localStorage with caching
const loadFromStorage = async <T>(key: string, defaultValue: T[]): Promise<T[]> => {
  try {
    // Check cache first
    const cachedData = cache.get<T[]>(key)
    if (cachedData) {
      return cachedData
    }

    // Use requestAnimationFrame to avoid blocking the main thread
    return new Promise<T[]>(resolve => {
      requestAnimationFrame(() => {
        const storedData = localStorage.getItem(key)
        const data: T[] = storedData ? JSON.parse(storedData) : defaultValue

        // Cache the loaded data
        cache.set(key, data)

        resolve(data)
      })
    })
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error)
    return defaultValue
  }
}

// Save data to localStorage with debouncing and batching
const saveTimeouts: { [key: string]: number } = {}
const pendingWrites: PendingWrites = {}

const saveToStorage = async <T>(key: string, data: T[]): Promise<void> => {
  try {
    // Clear any pending save for this key
    if (saveTimeouts[key]) {
      window.clearTimeout(saveTimeouts[key])
    }

    // Add to pending writes
    pendingWrites[key] = data

    // Debounce saves to prevent rapid successive writes
    return new Promise(resolve => {
      saveTimeouts[key] = window.setTimeout(() => {
        requestAnimationFrame(() => {
          // Process in batches if data is large
          if (data.length > BATCH_SIZE) {
            const chunks: T[][] = []
            for (let i = 0; i < data.length; i += BATCH_SIZE) {
              chunks.push(data.slice(i, Math.min(i + BATCH_SIZE, data.length)))
            }

            // Save each chunk with a small delay to prevent blocking
            chunks.forEach((chunk, index) => {
              setTimeout(() => {
                const partialKey = `${key}_part_${index}`
                localStorage.setItem(partialKey, JSON.stringify(chunk))
              }, index * 50)
            })

            // Save the chunk info
            localStorage.setItem(`${key}_chunks`, String(chunks.length))
          } else {
            localStorage.setItem(key, JSON.stringify(data))
          }

          // Update cache
          cache.set(key, data)

          // Clear pending writes
          delete pendingWrites[key]

          resolve()
        })
      }, 150) // Debounce time
    })
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
    throw error
  }
}

// Initialize arrays with data from localStorage or empty arrays
let projects: Project[] = []
let samples: Sample[] = []
let sessions: Session[] = []
let notes: Note[] = []
let beatActivities: BeatActivity[] = []

// Initialize all data asynchronously
Promise.all([
  loadFromStorage<Project>('projects', []),
  loadFromStorage<Sample>('samples', []),
  loadFromStorage<Session>('sessions', []),
  loadFromStorage<Note>('notes', []),
  loadFromStorage<BeatActivity>('beatActivities', []),
]).then(([loadedProjects, loadedSamples, loadedSessions, loadedNotes, loadedActivities]) => {
  projects = loadedProjects
  samples = loadedSamples
  sessions = loadedSessions
  notes = loadedNotes
  beatActivities = loadedActivities
})

export { projects, samples, sessions, notes, beatActivities }

// Status to completion percentage mapping
export const statusToCompletion = {
  idea: 0,
  'in-progress': 25,
  mixing: 50,
  mastering: 75,
  completed: 100,
}

// Get projects with caching
export const getProjects = async (): Promise<Project[]> => {
  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error('No user found')
      return []
    }

    // Fetch from Supabase
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_deleted', false)
      .order('last_modified', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      throw error
    }

    if (!data) {
      return []
    }

    // Transform the data to match our Project interface
    return data.map(project => {
      const now = new Date().toISOString()
      const transformedProject: Project = {
        id: project.id,
        title: project.title,
        description: project.description || '',
        status: project.status as Project['status'],
        user_id: project.user_id || '',
        created_at: project.created_at || now,
        last_modified: project.last_modified || now,
        is_deleted: project.is_deleted || false,
        deleted_at: project.deleted_at,
        // Client-side fields
        dateCreated: project.created_at || now,
        lastModified: project.last_modified || now,
        bpm: project.bpm ?? 120,
        key: project.key ?? 'C',
        genre: project.genre ?? '',
        tags: project.tags ?? [],
        completionPercentage: statusToCompletion[project.status as Project['status']] || 0,
        audio_url: project.audio_url || null
      }
      return transformedProject
    })
  } catch (error) {
    console.error('Error in getProjects:', error)
    throw error // Re-throw the error to be handled by React Query
  }
}

const calculateProductivityScore = (
  totalBeats: number,
  completedProjects: number,
  totalSessions: number
): number => {
  // Base score from total beats (max 50 points)
  const beatsScore = Math.min(50, Math.round((totalBeats / 20) * 50))

  // Score from completed projects (max 30 points)
  const completionScore = Math.min(30, completedProjects * 5)

  // Score from active sessions (max 20 points)
  const sessionScore = Math.min(20, Math.round((totalSessions / 10) * 20))

  // Total score (max 100)
  return beatsScore + completionScore + sessionScore
}

// Update the profile stats update function with proper typing
const updateProfileStats = async (
  userId: string,
  stats: Database['public']['Tables']['profiles']['Update']
) => {
  const { error } = await supabase
    .from('profiles')
    .update(stats)
    .eq('id', userId)

  if (error) {
    console.error('Error updating profile stats:', error)
    throw error
  }
}

// Update the addProject function to use the new updateProfileStats function
export const addProject = async (project: Project): Promise<Project> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('No user found')
    }

    const now = new Date().toISOString()

    // Create the project object that matches the database schema
    const projectToInsert = {
      title: project.title,
      description: project.description,
      status: project.status,
      user_id: user.id,
      created_at: now,
      last_modified: now,
      audio_url: project.audio_url
    }

    // Insert into Supabase
    const { data, error } = await supabase
      .from('projects')
      .insert([projectToInsert])
      .select()
      .single()

    if (error) {
      console.error('Error adding project:', error)
      throw error
    }

    if (!data) {
      throw new Error('No data returned from insert')
    }

    // Get all projects to update profile stats
    const { data: allProjects } = await supabase.from('projects').select('*').eq('user_id', user.id)

    if (allProjects) {
      const totalProjects = allProjects.length
      const completedProjects = allProjects.filter(p => p.status === 'completed').length
      const completionRate = Math.round((completedProjects / totalProjects) * 100)

      // Get total beats from beat activities
      const { data: beatActivities } = await supabase
        .from('beat_activities')
        .select('count')
        .eq('user_id', user.id)

      // Calculate total beats without adding 1
      const totalBeats = beatActivities ? beatActivities.reduce((sum, activity) => sum + activity.count, 0) : 0

      // Get total sessions
      const { data: sessions } = await supabase.from('sessions').select('id').eq('user_id', user.id)

      const totalSessions = sessions?.length || 0

      // Calculate productivity score
      const productivityScore = calculateProductivityScore(
        totalBeats,
        completedProjects,
        totalSessions
      )

      // Update profile stats using the new function
      await updateProfileStats(user.id, {
        total_beats: totalBeats,
        completed_projects: completedProjects,
        completion_rate: completionRate,
        productivity_score: productivityScore,
        updated_at: now,
      })
    }

    // Ensure we have valid dates
    const created_at = data.created_at || now
    const last_modified = data.last_modified || now

    // Transform the Supabase response to match our Project interface
    const newProject: Project = {
      id: data.id,
      title: data.title,
      description: data.description || '',
      status: data.status as Project['status'],
      user_id: data.user_id || '',
      created_at: data.created_at || new Date().toISOString(),
      last_modified: data.last_modified || new Date().toISOString(),
      is_deleted: data.is_deleted || false,
      deleted_at: data.deleted_at,
      // Client-side fields
      dateCreated: data.created_at || new Date().toISOString(),
      lastModified: data.last_modified || new Date().toISOString(),
      bpm: 120,
      key: 'C',
      genre: '',
      tags: [],
      completionPercentage: statusToCompletion[data.status as Project['status']] || 0,
      audio_url: data.audio_url || project.audio_url || null // Use both database and input audio_url
    }

    console.log('Transformed project data:', {
      id: newProject.id,
      title: newProject.title,
      audio_url: newProject.audio_url
    })

    return newProject
  } catch (error) {
    console.error('Error in addProject:', error)
    throw error
  }
}

// Update the updateProject function to use the new updateProfileStats function
export const updateProject = async (updatedProject: Project): Promise<Project> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('No user found')
    }

    const now = new Date().toISOString()

    // Only include fields that exist in the database
    const projectToUpdate = {
      title: updatedProject.title,
      description: updatedProject.description,
      status: updatedProject.status,
      last_modified: now,
      audio_url: updatedProject.audio_url
    }

    // Update in Supabase
    const { data, error } = await supabase
      .from('projects')
      .update(projectToUpdate)
      .eq('id', updatedProject.id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating project:', error)
      throw error
    }

    if (!data) {
      throw new Error('No data returned from update')
    }

    // Update profile stats if status changed to completed
    if (data.status === 'completed') {
      // Get all projects to calculate stats
      const { data: allProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)

      if (allProjects) {
        const totalProjects = allProjects.length
        const completedProjects = allProjects.filter(p => p.status === 'completed').length
        const completionRate = Math.round((completedProjects / totalProjects) * 100)

        // Get total beats from beat activities
        const { data: beatActivities } = await supabase
          .from('beat_activities')
          .select('count')
          .eq('user_id', user.id)

        const totalBeats = beatActivities
          ? beatActivities.reduce((sum, activity) => sum + activity.count, 0)
          : 0

        // Get total sessions
        const { data: sessions } = await supabase
          .from('sessions')
          .select('id')
          .eq('user_id', user.id)

        const totalSessions = sessions?.length || 0

        // Calculate productivity score
        const productivityScore = calculateProductivityScore(
          totalBeats,
          completedProjects,
          totalSessions
        )

        // Update profile stats using the new function
        await updateProfileStats(user.id, {
          total_beats: totalBeats,
          completed_projects: completedProjects,
          completion_rate: completionRate,
          productivity_score: productivityScore,
          updated_at: now,
        })
      }
    }

    // Ensure we have valid dates
    const created_at = data.created_at || updatedProject.dateCreated
    const last_modified = data.last_modified || now

    const updatedData: Project = {
      ...data,
      dateCreated: created_at,
      lastModified: last_modified,
      bpm: updatedProject.bpm ?? 120,
      key: updatedProject.key ?? 'C',
      genre: updatedProject.genre ?? '',
      tags: updatedProject.tags ?? [],
      completionPercentage: statusToCompletion[data.status as Project['status']] || 0,
      audio_url: data.audio_url || null
    }

    return updatedData
  } catch (error) {
    console.error('Error in updateProject:', error)
    throw error
  }
}

// Update the deleteProject function to use the new updateProfileStats function
export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('No user found')
    }

    // Soft delete the project
    const { error: projectError } = await supabase
      .from('projects')
      .update({ 
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', projectId)

    if (projectError) {
      throw projectError
    }

    // Delete related beat activities
    const { error: activitiesError } = await supabase
      .from('beat_activities')
      .delete()
      .eq('project_id', projectId)

    if (activitiesError) {
      throw activitiesError
    }

    // Get all remaining active projects to calculate stats
    const { data: allProjects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_deleted', false)

    if (allProjects) {
      const totalProjects = allProjects.length
      const completedProjects = allProjects.filter(p => p.status === 'completed').length
      const completionRate =
        totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0

      // Get total beats from beat activities
      const { data: beatActivities } = await supabase
        .from('beat_activities')
        .select('count')
        .eq('user_id', user.id)

      const totalBeats = beatActivities
        ? beatActivities.reduce((sum, activity) => sum + activity.count, 0)
        : 0

      // Get total sessions
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', user.id)

      const totalSessions = sessions?.length || 0

      // Calculate productivity score
      const productivityScore = calculateProductivityScore(
        totalBeats,
        completedProjects,
        totalSessions
      )

      // Update profile stats
      await updateProfileStats(user.id, {
        total_beats: totalBeats,
        completed_projects: completedProjects,
        completion_rate: completionRate,
        productivity_score: productivityScore
      })

      // Update achievements if needed
      await updateUserAchievements(user.id, totalBeats)
    }
  } catch (error) {
    console.error('Error in deleteProject:', error)
    throw error
  }
}

export const clearAllProjects = async (): Promise<void> => {
  try {
    // Get the current user
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()

    if (authError) {
      console.error('Authentication error:', authError)
      throw new Error('Authentication failed')
    }

    if (!user) {
      console.error('No user found when trying to clear projects')
      throw new Error('No authenticated user found')
    }

    console.log('Starting to clear projects for user:', user.id)

    // First, get all non-deleted projects to ensure we have access
    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_deleted', false)

    if (fetchError) {
      console.error('Error fetching projects:', fetchError)
      throw fetchError
    }

    if (projects && projects.length > 0) {
      // Perform a single batch update for all projects
      const now = new Date().toISOString()
      const { error: updateError } = await supabase
        .from('projects')
        .update({ 
          is_deleted: true,
          deleted_at: now
        })
        .eq('user_id', user.id)
        .eq('is_deleted', false)

      if (updateError) {
        console.error('Error updating projects:', updateError)
        throw updateError
      }
    }

    // Delete all beat activities
    console.log('Clearing beat activities')
    const { error: activitiesError } = await supabase
      .from('beat_activities')
      .delete()
      .eq('user_id', user.id)

    if (activitiesError) {
      console.error('Error clearing beat activities:', activitiesError)
      throw activitiesError
    }

    // Reset all user achievements to 0 progress
    console.log('Resetting achievements')
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('id, requirement')

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError)
      throw achievementsError
    }

    if (achievements) {
      // Reset progress for each achievement
      const resetPromises = achievements.map(achievement =>
        supabase
          .from('user_achievements')
          .upsert({
            user_id: user.id,
            achievement_id: achievement.id,
            progress: 0,
            total: achievement.requirement,
            unlocked_at: null
          }, {
            onConflict: 'user_id,achievement_id'
          })
      )

      await Promise.all(resetPromises)
    }

    // Update profile stats with zero values
    console.log('Updating profile stats')
    await updateProfileStats(user.id, {
      total_beats: 0,
      completed_projects: 0,
      completion_rate: 0,
      productivity_score: 0
    })

    // Invalidate all relevant queries
    const queryClient = new QueryClient()
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['projects'] }),
      queryClient.invalidateQueries({ queryKey: ['beatActivities'] }),
      queryClient.invalidateQueries({ queryKey: ['achievements'] }),
      queryClient.invalidateQueries({ queryKey: ['profile'] }),
      queryClient.invalidateQueries({ queryKey: ['stats'] })
    ])

    console.log('Successfully cleared all projects and reset achievements')
  } catch (error) {
    console.error('Error in clearAllProjects:', error)
    throw error
  }
}

export const getProjectById = (id: string): Project | undefined => {
  return projects.find(project => project.id === id)
}

export const getSessionsByProjectId = async (projectId: string): Promise<Session[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('No user found')
      return []
    }

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sessions:', error)
      throw error
    }

    return data ? data.map(mapDatabaseSessionToSession) : []
  } catch (error) {
    console.error('Error in getSessionsByProjectId:', error)
    throw error
  }
}

export const getNotesByProjectId = (projectId: string): Note[] => {
  return notes.filter(note => note.projectId === projectId)
}

export const getTotalSessionTime = async (): Promise<number> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('No user found')
      return 0
    }

    const { data, error } = await supabase
      .from('sessions')
      .select('duration')
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching sessions:', error)
      throw error
    }

    return data ? data.reduce((total, session) => total + session.duration, 0) : 0
  } catch (error) {
    console.error('Error in getTotalSessionTime:', error)
    throw error
  }
}

export const getCompletedProjects = (): Project[] => {
  return projects.filter(project => project.status === 'completed')
}

export const getProjectsByStatus = async (status: Project['status']): Promise<Project[]> => {
  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error('No user found')
      return []
    }

    // Fetch from Supabase
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', status)
      .order('last_modified', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      throw error
    }

    if (!data) {
      return []
    }

    // Transform the data to match our Project interface
    return data.map(project => {
      const now = new Date().toISOString()
      return {
        ...project,
        dateCreated: project.created_at || now,
        lastModified: project.last_modified || now,
        bpm: project.bpm ?? 120,
        key: project.key ?? 'C',
        genre: project.genre ?? '',
        tags: project.tags ?? [],
        completionPercentage: statusToCompletion[project.status as Project['status']] || 0,
        audio_url: project.audio_url || null
      }
    })
  } catch (error) {
    console.error('Error in getProjectsByStatus:', error)
    throw error
  }
}

// Beat activity tracking functions
export const recordBeatCreation = async (projectId: string, count: number = 1): Promise<void> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('No user found')
    }

    const now = new Date()
    const timestamp = now.getTime()

    // Insert the beat activity
    const { error } = await supabase.from('beat_activities').insert([
      {
        user_id: user.id,
        project_id: projectId,
        count: count,
        timestamp: timestamp,
        date: now.toISOString().split('T')[0]
      }
    ])

    if (error) {
      console.error('Error recording beat creation:', error)
      throw error
    }

    // Get total beats for the user
    const { data: totalBeatsData, error: totalBeatsError } = await supabase
      .from('beat_activities')
      .select('count')
      .eq('user_id', user.id)

    if (totalBeatsError) {
      console.error('Error getting total beats:', totalBeatsError)
      throw totalBeatsError
    }

    // Calculate total beats
    const totalBeats = totalBeatsData.reduce((sum, activity) => sum + (activity.count || 0), 0)

    // Update user achievements
    await updateUserAchievements(user.id, totalBeats)
  } catch (error) {
    console.error('Error in recordBeatCreation:', error)
    throw error
  }
}

export const getBeatsCreatedByProject = async (projectId: string): Promise<number> => {
  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return 0
    }

    // Fetch beat activities from Supabase
    const { data, error } = await supabase
      .from('beat_activities')
      .select('count')
      .eq('project_id', projectId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching beat activities:', error)
      return 0
    }

    // Sum up all the counts
    return data?.reduce((total, activity) => total + (activity.count || 0), 0) || 0
  } catch (error) {
    console.error('Error in getBeatsCreatedByProject:', error)
    return 0
  }
}

export const getBeatsCreatedInRange = async (
  startDate: Date,
  endDate: Date
): Promise<BeatActivity[]> => {
  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    // Convert dates to timestamps for accurate comparison
    const startTimestamp = startDate.getTime()
    const endTimestamp = endDate.getTime()

    console.log('Searching for beats between:', {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
      startTimestamp,
      endTimestamp,
    })

    // Fetch beat activities from Supabase
    const { data: activities, error } = await supabase
      .from('beat_activities')
      .select('*')
      .eq('user_id', user.id)
      .gte('timestamp', startTimestamp)
      .lte('timestamp', endTimestamp)
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Error fetching beat activities:', error)
      return []
    }

    // Transform the data to match our BeatActivity interface
    return activities.map(activity => {
      const transformedActivity: BeatActivity = {
        id: activity.id,
        projectId: activity.project_id || '',
        date: activity.date,
        count: activity.count,
        timestamp: activity.timestamp || new Date().toISOString()
      }
      return transformedActivity
    })
  } catch (error) {
    console.error('Error in getBeatsCreatedInRange:', error)
    return []
  }
}

export const getTotalBeatsInTimeRange = async (
  timeRange: 'day' | 'week' | 'month' | 'year',
  projectId?: string | null
): Promise<number> => {
  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log('No user found when fetching total beats')
      return 0
    }

    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
        break
      case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
      default:
        startDate = new Date(0)
    }

    // Set proper time boundaries
    startDate.setHours(0, 0, 0, 0)
    now.setHours(23, 59, 59, 999)

    console.log('Fetching total beats:', {
      timeRange,
      projectId,
      startDate: startDate.toISOString(),
      endDate: now.toISOString(),
      startTimestamp: startDate.getTime(),
      endTimestamp: now.getTime(),
    })

    // Build the query
    let query = supabase
      .from('beat_activities')
      .select('*') // Select all fields to ensure we have everything we need
      .eq('user_id', user.id)
      .gte('timestamp', startDate.getTime())
      .lte('timestamp', now.getTime())

    // Add project filter if specified
    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    // Execute the query
    const { data, error } = await query

    if (error) {
      console.error('Error fetching total beats:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return 0
    }

    // Log the fetched activities
    console.log('Fetched beat activities:', {
      count: data?.length || 0,
      activities: data?.map(a => ({
        date: a.date,
        count: a.count,
        timestamp: a.timestamp
      })),
    })

    // Sum up all the counts
    const totalBeats = data?.reduce((sum, activity) => sum + (activity.count || 0), 0) || 0

    console.log('Total beats calculated:', {
      timeRange,
      projectId,
      totalBeats,
      activityCount: data?.length || 0,
    })

    return totalBeats
  } catch (error) {
    console.error('Error in getTotalBeatsInTimeRange:', error)
    return 0
  }
}

// Add type definition for beat activity with project
interface BeatActivityWithProject {
  id: string
  user_id: string
  project_id: string
  count: number
  timestamp: number
  projects: {
    is_deleted: boolean
  }
}

export const getBeatsDataForChart = async (
  timeRange: 'day' | 'week' | 'month' | 'year',
  projectId?: string | null
): Promise<ChartData[]> => {
  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.log('No user found when fetching beat data')
      return []
    }

    console.log('Fetching beat data for chart:', {
      timeRange,
      projectId,
      userId: user.id,
    })

    const now = new Date()
    const data: ChartData[] = []

    // Base query for beat activities
    let query = supabase
      .from('beat_activities')
      .select(`
        *,
        projects:projects!inner(is_deleted)
      `)
      .eq('user_id', user.id)
      .eq('projects.is_deleted', false) // Only include activities from non-deleted projects

    // Add project filter if specified
    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    console.log('Base query constructed:', {
      hasProjectFilter: !!projectId,
      projectId,
    })

    switch (timeRange) {
      case 'month': {
        // Get the start of the current month
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        startDate.setHours(0, 0, 0, 0)
        // Get the end of the current month
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        endDate.setHours(23, 59, 59, 999)

        console.log('Fetching monthly data:', {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          startTimestamp: startDate.getTime(),
          endTimestamp: endDate.getTime(),
        })

        // Fetch all beat activities for the month
        const { data: rawActivities, error } = await query
          .gte('timestamp', startDate.getTime())
          .lte('timestamp', endDate.getTime())
          .order('timestamp', { ascending: true })

        if (error) {
          console.error('Error fetching monthly beat activities:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          })
          return []
        }

        // Transform raw activities into the expected format
        const activities = rawActivities.map(activity => ({
          id: activity.id,
          user_id: activity.user_id,
          project_id: activity.project_id,
          count: activity.count,
          timestamp: activity.timestamp || new Date().toISOString(),
          projects: activity.projects || { is_deleted: false }
        })) as BeatActivityWithProject[]

        console.log('Monthly activities fetched:', {
          count: activities?.length || 0,
          activities: activities?.map(a => ({
            date: new Date(a.timestamp).toISOString().split('T')[0],
            count: a.count,
            timestamp: a.timestamp
          })),
        })

        // Group activities by day
        const dailyData = new Map<string, number>()
        activities?.forEach(activity => {
          const date = new Date(activity.timestamp).toISOString().split('T')[0]
          dailyData.set(date, (dailyData.get(date) || 0) + activity.count)
        })

        // Convert to array format and add week-based periods
        const chartData: ChartData[] = Array.from(dailyData.entries()).map(([date, count]) => {
          const dayDate = new Date(date)
          const dayOfWeek = dayDate.getDay()
          const period = dayOfWeek === 0 || dayOfWeek === 6 ? 'weekend' : 'workweek'
          
          return {
            label: formatDate(dayDate, 'd'),
            value: count,
            date: date,
            period: period
          }
        })

        data.push(...chartData)
        break
      }

      case 'week': {
        const weekStart = new Date(now)
        // Calculate the start of the week (Monday)
        const day = weekStart.getDay()
        const diff = day === 0 ? 6 : day - 1 // If Sunday (0), go back 6 days, otherwise go back (day-1) days
        weekStart.setDate(weekStart.getDate() - diff)
        weekStart.setHours(0, 0, 0, 0)

        const weekEnd = new Date(now)
        weekEnd.setHours(23, 59, 59, 999)

        // Fetch all beat activities for the week
        const { data: activities, error } = await query
          .gte('timestamp', weekStart.getTime())
          .lte('timestamp', weekEnd.getTime())
          .order('timestamp', { ascending: true })

        if (error) {
          console.error('Error fetching weekly beat activities:', error)
          return []
        }

        // Get dates for the week starting from Monday
        const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        const periods = ['workweek', 'workweek', 'workweek', 'workweek', 'workweek', 'weekend', 'weekend']

        for (let i = 0; i < 7; i++) {
          const date = new Date(weekStart)
          date.setDate(date.getDate() + i)
          const dayStart = new Date(date)
          dayStart.setHours(0, 0, 0, 0)
          const dayEnd = new Date(date)
          dayEnd.setHours(23, 59, 59, 999)

          const dayActivities = activities.filter(activity => {
            const activityTime = activity.timestamp
            return activityTime >= dayStart.getTime() && activityTime <= dayEnd.getTime()
          })

          const value = dayActivities.reduce((sum, activity) => sum + (activity.count || 0), 0)

          data.push({
            label: formatDate(date, 'EEE'),
            value: value,
            date: date.toISOString().split('T')[0],
            period: periods[i]
          })
        }
        break
      }

      case 'year': {
        // Get the start of the current year (January 1st)
        const yearStart = new Date(now.getFullYear(), 0, 1)
        yearStart.setHours(0, 0, 0, 0)

        const yearEnd = new Date(now)
        yearEnd.setHours(23, 59, 59, 999)

        // Fetch all beat activities for the year
        const { data: activities, error } = await query
          .gte('timestamp', yearStart.getTime())
          .lte('timestamp', yearEnd.getTime())
          .order('timestamp', { ascending: true })

        if (error) {
          console.error('Error fetching yearly beat activities:', error)
          return []
        }

        // Get data for each month of the year starting from January
        const seasons = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'fall', 'fall', 'fall', 'winter']

        for (let i = 0; i < 12; i++) {
          const monthStart = new Date(now.getFullYear(), i, 1)
          const monthEnd = new Date(now.getFullYear(), i + 1, 0)
          monthStart.setHours(0, 0, 0, 0)
          monthEnd.setHours(23, 59, 59, 999)

          const monthActivities = activities.filter(activity => {
            const activityTime = activity.timestamp
            return activityTime >= monthStart.getTime() && activityTime <= monthEnd.getTime()
          })

          const value = monthActivities.reduce((sum, activity) => sum + (activity.count || 0), 0)

          data.push({
            label: formatDate(monthStart, 'MMM'),
            value: value,
            period: seasons[i]
          })
        }
        break
      }

      default: {
        // day
        const dayStart = new Date(now)
        dayStart.setHours(0, 0, 0, 0)

        const dayEnd = new Date(now)
        dayEnd.setHours(23, 59, 59, 999)

        console.log('Fetching daily data:', {
          dayStart: dayStart.toISOString(),
          dayEnd: dayEnd.toISOString(),
          startTimestamp: dayStart.getTime(),
          endTimestamp: dayEnd.getTime(),
        })

        // Fetch all beat activities for today
        const { data: activities, error } = await query
          .gte('timestamp', dayStart.getTime())
          .lte('timestamp', dayEnd.getTime())
          .order('timestamp', { ascending: true })

        if (error) {
          console.error('Error fetching daily beat activities:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          })
          return []
        }

        console.log('Daily activities fetched:', {
          count: activities?.length || 0,
          activities: activities?.map(a => ({
            date: a.date,
            count: a.count,
            timestamp: a.timestamp
          })),
        })

        // Create 6 intervals (4 hours each)
        const intervals = [
          '8 PM - 12 AM',
          '4 PM - 8 PM',
          '12 PM - 4 PM',
          '8 AM - 12 PM',
          '4 AM - 8 AM',
          '12 AM - 4 AM'
        ]

        // Always create data points for all intervals
        intervals.forEach((label, index) => {
          const intervalStart = new Date(dayStart)
          intervalStart.setHours(20 - (index * 4), 0, 0, 0)

          const intervalEnd = new Date(dayStart)
          intervalEnd.setHours(23 - (index * 4), 59, 59, 999)

          // If we have activities, filter them for this interval
          const intervalActivities = activities?.filter(activity => {
            const activityTime = activity.timestamp
            return activityTime >= intervalStart.getTime() && activityTime <= intervalEnd.getTime()
          }) || []

          const value = intervalActivities.reduce((sum, activity) => sum + (activity.count || 0), 0)

          data.push({
            label: label,
            value: value,
            period: ['night', 'evening', 'afternoon', 'morning', 'early-morning', 'late-night'][index]
          })
        })
        break
      }
    }

    console.log('Final chart data:', {
      timeRange,
      projectId,
      dataPoints: data.length,
      data: data,
    })

    return data
  } catch (error) {
    console.error('Error in getBeatsDataForChart:', error)
    return []
  }
}

export function chunkData<T>(data: T[], size: number = BATCH_SIZE): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < data.length; i += size) {
    chunks.push(data.slice(i, Math.min(i + size, data.length)))
  }
  return chunks
}

export async function processDataInBatches<T>(
  data: T[],
  processFn: (batch: T[]) => Promise<void>
): Promise<void> {
  const chunks = chunkData(data)

  try {
    for (const chunk of chunks) {
      await processFn(chunk)
    }
  } catch (error) {
    console.error('Error processing data chunks:', error)
    throw error
  }
}

// Add this helper function after the imports
const mapDatabaseSessionToSession = (dbSession: Database['public']['Tables']['sessions']['Row']): Session => {
  const transformedSession: Session = {
    id: dbSession.id || '',
    user_id: dbSession.user_id || '',
    project_id: dbSession.project_id || '',
    duration: dbSession.duration,
    created_at: dbSession.created_at || new Date().toISOString(),
    notes: dbSession.notes || undefined,
    productivity_score: dbSession.productivity_score || undefined,
    tags: dbSession.tags || undefined,
    status: dbSession.status || undefined
  }
  return transformedSession
}

// Update any functions that fetch sessions to use the mapper
export const getSessions = async (): Promise<Session[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('No user found')
      return []
    }

    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching sessions:', error)
      throw error
    }

    return data ? data.map(mapDatabaseSessionToSession) : []
  } catch (error) {
    console.error('Error in getSessions:', error)
    throw error
  }
}

// Helper function to update user achievements
const updateUserAchievements = async (userId: string, totalBeats: number): Promise<void> => {
  try {
    // Get all achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('category', 'production')

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError)
      return
    }

    if (!achievements) return

    // Update or insert user achievements
    for (const achievement of achievements) {
      const progress = Math.min(totalBeats, achievement.requirement)
      const unlocked = progress >= achievement.requirement

      const { error: upsertError } = await supabase
        .from('user_achievements')
        .upsert({
          user_id: userId,
          achievement_id: achievement.id,
          progress,
          total: achievement.requirement,
          unlocked_at: unlocked ? new Date().toISOString() : null,
        }, {
          onConflict: 'user_id,achievement_id'
        })

      if (upsertError) {
        console.error('Error updating user achievement:', upsertError)
      }
    }
  } catch (error) {
    console.error('Error in updateUserAchievements:', error)
  }
}
