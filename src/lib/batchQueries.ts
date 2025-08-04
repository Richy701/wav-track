// Batch query utilities to solve N+1 problems
import { supabase } from './supabase'

/**
 * Batch fetch beats for multiple projects to avoid N+1 queries
 */
export const getBeatsByProjectsBatch = async (projectIds: string[]): Promise<Record<string, number>> => {
  if (projectIds.length === 0) return {}

  try {
    const { data, error } = await supabase
      .from('beat_activities')
      .select('project_id, count')
      .in('project_id', projectIds)

    if (error) throw error

    // Group beats by project_id and sum counts
    const beatsByProject: Record<string, number> = {}
    
    projectIds.forEach(projectId => {
      beatsByProject[projectId] = 0
    })

    data?.forEach(beat => {
      if (beat.project_id && beat.count) {
        beatsByProject[beat.project_id] = (beatsByProject[beat.project_id] || 0) + beat.count
      }
    })

    return beatsByProject
  } catch (error) {
    console.error('Error batch fetching beats:', error)
    return {}
  }
}

/**
 * Batch fetch beats for time range across all projects
 */
export const getBeatsInTimeRangeBatch = async (
  timeRange: 'day' | 'week' | 'year',
  projectIds?: string[]
): Promise<{ total: number; byProject: Record<string, number> }> => {
  try {
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    }

    let query = supabase
      .from('beat_activities')
      .select('project_id, count, date')
      .gte('date', startDate.toISOString().split('T')[0])

    if (projectIds && projectIds.length > 0) {
      query = query.in('project_id', projectIds)
    }

    const { data, error } = await query

    if (error) throw error

    let total = 0
    const byProject: Record<string, number> = {}

    data?.forEach(beat => {
      const count = beat.count || 0
      total += count
      
      if (beat.project_id) {
        byProject[beat.project_id] = (byProject[beat.project_id] || 0) + count
      }
    })

    return { total, byProject }
  } catch (error) {
    console.error('Error fetching beats in time range:', error)
    return { total: 0, byProject: {} }
  }
}

/**
 * Batch fetch session data for multiple projects
 */
export const getSessionsByProjectsBatch = async (projectIds: string[]): Promise<Record<string, number>> => {
  if (projectIds.length === 0) return {}

  try {
    const { data, error } = await supabase
      .from('sessions')
      .select('project_id, duration')
      .in('project_id', projectIds)

    if (error) throw error

    const sessionsByProject: Record<string, number> = {}
    
    projectIds.forEach(projectId => {
      sessionsByProject[projectId] = 0
    })

    data?.forEach(session => {
      if (session.project_id && session.duration) {
        sessionsByProject[session.project_id] = (sessionsByProject[session.project_id] || 0) + session.duration
      }
    })

    return sessionsByProject
  } catch (error) {
    console.error('Error batch fetching sessions:', error)
    return {}
  }
}