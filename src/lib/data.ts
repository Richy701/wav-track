import { Project, Sample, Session, Note, BeatActivity } from './types';
import { cache } from './cache';
import { format as formatDate } from 'date-fns';
import { supabase } from './supabase';

// Batch size for storage operations
const BATCH_SIZE = 100;

// Type for pending writes
interface PendingWrites {
  [key: string]: unknown[];
}

interface ChartData {
  label: string;
  value: number;
  cumulative?: number;
}

interface ChartDataPoint {
  label: string;
  value: number;
}

// Load data from localStorage with caching
const loadFromStorage = async <T>(key: string, defaultValue: T[]): Promise<T[]> => {
  try {
    // Check cache first
    const cachedData = cache.get<T[]>(key);
    if (cachedData) {
      return cachedData;
    }

    // Use requestAnimationFrame to avoid blocking the main thread
    return new Promise<T[]>((resolve) => {
      requestAnimationFrame(() => {
    const storedData = localStorage.getItem(key);
        const data: T[] = storedData ? JSON.parse(storedData) : defaultValue;
        
        // Cache the loaded data
        cache.set(key, data);
        
        resolve(data);
      });
    });
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Save data to localStorage with debouncing and batching
const saveTimeouts: { [key: string]: number } = {};
const pendingWrites: PendingWrites = {};

const saveToStorage = async <T>(key: string, data: T[]): Promise<void> => {
  try {
    // Clear any pending save for this key
    if (saveTimeouts[key]) {
      window.clearTimeout(saveTimeouts[key]);
    }

    // Add to pending writes
    pendingWrites[key] = data;

    // Debounce saves to prevent rapid successive writes
    return new Promise((resolve) => {
      saveTimeouts[key] = window.setTimeout(() => {
        requestAnimationFrame(() => {
          // Process in batches if data is large
          if (data.length > BATCH_SIZE) {
            const chunks: T[][] = [];
            for (let i = 0; i < data.length; i += BATCH_SIZE) {
              chunks.push(data.slice(i, Math.min(i + BATCH_SIZE, data.length)));
            }
            
            // Save each chunk with a small delay to prevent blocking
            chunks.forEach((chunk, index) => {
              setTimeout(() => {
                const partialKey = `${key}_part_${index}`;
                localStorage.setItem(partialKey, JSON.stringify(chunk));
              }, index * 50);
            });

            // Save the chunk info
            localStorage.setItem(`${key}_chunks`, String(chunks.length));
          } else {
    localStorage.setItem(key, JSON.stringify(data));
          }

          // Update cache
          cache.set(key, data);
          
          // Clear pending writes
          delete pendingWrites[key];
          
          resolve();
        });
      }, 150); // Debounce time
    });
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    throw error;
  }
};

// Initialize arrays with data from localStorage or empty arrays
let projects: Project[] = [];
let samples: Sample[] = [];
let sessions: Session[] = [];
let notes: Note[] = [];
let beatActivities: BeatActivity[] = [];

// Initialize all data asynchronously
Promise.all([
  loadFromStorage<Project>('projects', []),
  loadFromStorage<Sample>('samples', []),
  loadFromStorage<Session>('sessions', []),
  loadFromStorage<Note>('notes', []),
  loadFromStorage<BeatActivity>('beatActivities', [])
]).then(([loadedProjects, loadedSamples, loadedSessions, loadedNotes, loadedActivities]) => {
  projects = loadedProjects;
  samples = loadedSamples;
  sessions = loadedSessions;
  notes = loadedNotes;
  beatActivities = loadedActivities;
});

export { projects, samples, sessions, notes, beatActivities };

// Status to completion percentage mapping
export const statusToCompletion = {
  'idea': 0,
  'in-progress': 25,
  'mixing': 50,
  'mastering': 75,
  'completed': 100
};

// Get projects with caching
export const getProjects = async (): Promise<Project[]> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No user found');
      return [];
    }

    // Fetch from Supabase
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .order('last_modified', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    // Transform the data to match our Project interface
    return data.map(project => {
      const now = new Date().toISOString();
      return {
        ...project,
        dateCreated: project.created_at || now,
        lastModified: project.last_modified || now,
        bpm: project.bpm ?? 120,
        key: project.key ?? 'C',
        genre: project.genre ?? '',
        tags: project.tags ?? [],
        completionPercentage: statusToCompletion[project.status]
      };
    });
  } catch (error) {
    console.error('Error in getProjects:', error);
    throw error; // Re-throw the error to be handled by React Query
  }
};

const calculateProductivityScore = (totalBeats: number, completedProjects: number, totalSessions: number): number => {
  // Base score from total beats (max 50 points)
  const beatsScore = Math.min(50, Math.round((totalBeats / 20) * 50));
  
  // Score from completed projects (max 30 points)
  const completionScore = Math.min(30, completedProjects * 5);
  
  // Score from active sessions (max 20 points)
  const sessionScore = Math.min(20, Math.round((totalSessions / 10) * 20));
  
  // Total score (max 100)
  return beatsScore + completionScore + sessionScore;
};

// Add project with optimistic updates
export const addProject = async (project: Project): Promise<Project> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No user found');
    }

    const now = new Date().toISOString();

    // Create the project object that matches the database schema
    const projectToInsert = {
      title: project.title,
      description: project.description,
      status: project.status,
      user_id: user.id,
      created_at: now,
      last_modified: now
    };

    // Insert into Supabase
    const { data, error } = await supabase
      .from('projects')
      .insert([projectToInsert])
      .select()
      .single();

    if (error) {
      console.error('Error adding project:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from insert');
    }

    // Get all projects to update profile stats
    const { data: allProjects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id);

    if (allProjects) {
      const totalProjects = allProjects.length;
      const completedProjects = allProjects.filter(p => p.status === 'completed').length;
      const completionRate = Math.round((completedProjects / totalProjects) * 100);

      // Get total beats from beat activities
      const { data: beatActivities } = await supabase
        .from('beat_activities')
        .select('count')
        .eq('user_id', user.id);

      // Add 1 to account for the initial beat that will be created
      const totalBeats = (beatActivities ? beatActivities.reduce((sum, activity) => sum + activity.count, 0) : 0) + 1;

      // Get total sessions
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', user.id);

      const totalSessions = sessions?.length || 0;

      // Calculate productivity score
      const productivityScore = calculateProductivityScore(totalBeats, completedProjects, totalSessions);

      // Update profile stats
      await supabase
        .from('profiles')
        .update({
          total_beats: totalBeats,
          completed_projects: completedProjects,
          completion_rate: completionRate,
          productivity_score: productivityScore,
          updated_at: now
        })
        .eq('id', user.id);
    }

    // Ensure we have valid dates
    const created_at = data.created_at || now;
    const last_modified = data.last_modified || now;

    // Transform the Supabase response to match our Project interface
    const newProject: Project = {
      ...data,
      dateCreated: created_at,
      lastModified: last_modified,
      bpm: 120,
      key: 'C',
      genre: '',
      tags: [],
      completionPercentage: statusToCompletion[data.status]
    };

    return newProject;
  } catch (error) {
    console.error('Error in addProject:', error);
    throw error;
  }
};

export const updateProject = async (updatedProject: Project): Promise<Project> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No user found');
    }

    const now = new Date().toISOString();

    // Only include fields that exist in the database
    const projectToUpdate = {
      title: updatedProject.title,
      description: updatedProject.description,
      status: updatedProject.status,
      last_modified: now
    };

    // Update in Supabase
    const { data, error } = await supabase
      .from('projects')
      .update(projectToUpdate)
      .eq('id', updatedProject.id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from update');
    }

    // Update profile stats if status changed to completed
    if (data.status === 'completed') {
      // Get all projects to calculate stats
      const { data: allProjects } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id);

      if (allProjects) {
        const totalProjects = allProjects.length;
        const completedProjects = allProjects.filter(p => p.status === 'completed').length;
        const completionRate = Math.round((completedProjects / totalProjects) * 100);

        // Get total beats from beat activities
        const { data: beatActivities } = await supabase
          .from('beat_activities')
          .select('count')
          .eq('user_id', user.id);

        const totalBeats = beatActivities ? beatActivities.reduce((sum, activity) => sum + activity.count, 0) : 0;

        // Get total sessions
        const { data: sessions } = await supabase
          .from('sessions')
          .select('id')
          .eq('user_id', user.id);

        const totalSessions = sessions?.length || 0;

        // Calculate productivity score
        const productivityScore = calculateProductivityScore(totalBeats, completedProjects, totalSessions);

        // Update profile stats
        await supabase
          .from('profiles')
          .update({
            total_beats: totalBeats,
            completed_projects: completedProjects,
            completion_rate: completionRate,
            productivity_score: productivityScore,
            updated_at: now
          })
          .eq('id', user.id);
      }
    }

    // Ensure we have valid dates
    const created_at = data.created_at || updatedProject.dateCreated;
    const last_modified = data.last_modified || now;

    // Transform the response to match our Project interface
    const updatedData: Project = {
      ...data,
      dateCreated: created_at,
      lastModified: last_modified,
      bpm: updatedProject.bpm ?? 120,
      key: updatedProject.key ?? 'C',
      genre: updatedProject.genre ?? '',
      tags: updatedProject.tags ?? [],
      completionPercentage: statusToCompletion[data.status]
    };

    return updatedData;
  } catch (error) {
    console.error('Error in updateProject:', error);
    throw error;
  }
};

export const deleteProject = async (projectId: string): Promise<void> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No user found');
    }

    // Delete the project
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      throw error;
    }

    // Get all remaining projects to calculate stats
    const { data: allProjects } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id);

    if (allProjects) {
      const totalProjects = allProjects.length;
      const completedProjects = allProjects.filter(p => p.status === 'completed').length;
      const completionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

      // Get total beats from beat activities
      const { data: beatActivities } = await supabase
        .from('beat_activities')
        .select('count')
        .eq('user_id', user.id);

      const totalBeats = beatActivities ? beatActivities.reduce((sum, activity) => sum + activity.count, 0) : 0;

      // Get total sessions
      const { data: sessions } = await supabase
        .from('sessions')
        .select('id')
        .eq('user_id', user.id);

      const totalSessions = sessions?.length || 0;

      // Calculate productivity score
      const productivityScore = calculateProductivityScore(totalBeats, completedProjects, totalSessions);

      // Update profile stats
      await supabase
        .from('profiles')
        .update({
          total_beats: totalBeats,
          completed_projects: completedProjects,
          completion_rate: completionRate,
          productivity_score: productivityScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
    }
  } catch (error) {
    console.error('Error in deleteProject:', error);
    throw error;
  }
};

export const clearAllProjects = async (): Promise<void> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('No user found');
    }

    // Delete all projects from Supabase
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error('Error clearing projects:', error);
      throw error;
    }

    // Clear all projects and beat activities from memory
    projects = [];
    beatActivities = [];
    
    // Clear cache
    cache.invalidateAll();
    
    // Save empty arrays to storage
    await Promise.all([
      saveToStorage<Project>('projects', []),
      saveToStorage<BeatActivity>('beatActivities', [])
    ]);
  } catch (error) {
    console.error('Error in clearAllProjects:', error);
    throw error;
  }
};

export const getProjectById = (id: string): Project | undefined => {
  return projects.find(project => project.id === id);
};

export const getSessionsByProjectId = (projectId: string): Session[] => {
  return sessions.filter(session => session.projectId === projectId);
};

export const getNotesByProjectId = (projectId: string): Note[] => {
  return notes.filter(note => note.projectId === projectId);
};

export const getTotalSessionTime = (): number => {
  return sessions.reduce((total, session) => total + session.duration, 0);
};

export const getCompletedProjects = (): Project[] => {
  return projects.filter(project => project.status === 'completed');
};

export const getProjectsByStatus = (status: Project['status']): Project[] => {
  return projects.filter(project => project.status === status);
};

// Beat activity tracking functions
export const recordBeatCreation = async (projectId: string, count: number = 1, customDate?: Date) => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.warn('No user found when recording beat creation');
    return;
  }
  
    console.log('Recording beat creation:', {
      projectId,
      count,
      userId: user.id,
      customDate
    });

    // Safely create date object
    let now: Date;
    try {
      now = customDate || new Date();
      if (isNaN(now.getTime())) {
        throw new Error('Invalid date');
      }
    } catch (error) {
      console.error('Invalid date provided:', error);
      now = new Date(); // Fallback to current date
    }

  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const timestamp = now.getTime();

    console.log('Preparing to insert beat activity:', {
      date,
      timestamp,
      count
    });

    // Only record if count is greater than 0 (ignore initial creation)
    if (count > 0) {
      const beatActivity = {
      id: crypto.randomUUID(),
        project_id: projectId,
        user_id: user.id,
      date,
      count,
        timestamp
      };

      console.log('Inserting beat activity:', beatActivity);

      const { data: insertedData, error: insertError } = await supabase
        .from('beat_activities')
        .insert([beatActivity])
        .select()
        .single();

      if (insertError) {
        // If the table doesn't exist, create it
        if (insertError.code === '42P01') { // undefined_table error code
          console.log('Beat activities table does not exist yet, skipping activity recording');
          return;
        }
        console.error('Error recording beat activity:', {
          error: insertError,
          beatActivity
        });
      } else {
        console.log('Successfully inserted beat activity:', insertedData);
        // Update the in-memory array
        beatActivities.push({
          id: insertedData.id,
          projectId: insertedData.project_id,
          date: insertedData.date,
          count: insertedData.count,
          timestamp: insertedData.timestamp
        });
      }
    }
  } catch (error) {
    console.error('Error in recordBeatCreation:', error);
  }
};

export const getBeatsCreatedByProject = async (projectId: string): Promise<number> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 0;
    }

    // Fetch beat activities from Supabase
    const { data, error } = await supabase
      .from('beat_activities')
      .select('count')
      .eq('project_id', projectId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching beat activities:', error);
      return 0;
    }

    // Sum up all the counts
    return data?.reduce((total, activity) => total + (activity.count || 0), 0) || 0;
  } catch (error) {
    console.error('Error in getBeatsCreatedByProject:', error);
    return 0;
  }
};

export const getBeatsCreatedInRange = async (
  startDate: Date, 
  endDate: Date
): Promise<BeatActivity[]> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

  // Convert dates to timestamps for accurate comparison
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();
  
  console.log('Searching for beats between:', {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    startTimestamp,
    endTimestamp
  });
  
    // Fetch beat activities from Supabase
    const { data: activities, error } = await supabase
      .from('beat_activities')
      .select('*')
      .eq('user_id', user.id)
      .gte('timestamp', startTimestamp)
      .lte('timestamp', endTimestamp)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching beat activities:', error);
      return [];
    }

    // Transform the data to match our BeatActivity interface
    return activities.map(activity => ({
      id: activity.id,
      projectId: activity.project_id,
      date: activity.date,
      count: activity.count,
      timestamp: activity.timestamp
    }));
  } catch (error) {
    console.error('Error in getBeatsCreatedInRange:', error);
    return [];
  }
};

export const getTotalBeatsInTimeRange = async (timeRange: 'day' | 'week' | 'month' | 'year', projectId?: string | null): Promise<number> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
    return 0;
  }
  
  const now = new Date();
    let startDate: Date;
  
  switch (timeRange) {
    case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      break;
    case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      break;
    case 'year':
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      break;
      default:
        startDate = new Date(0);
    }

    // Build the query
    let query = supabase
      .from('beat_activities')
      .select('count')
      .eq('user_id', user.id)
      .gte('date', startDate.toISOString().split('T')[0])
      .lte('date', now.toISOString().split('T')[0]);

    // Add project filter if specified
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    // Execute the query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching total beats:', error);
      return 0;
    }

    // Sum up all the counts
    return data?.reduce((sum, activity) => sum + (activity.count || 0), 0) || 0;
  } catch (error) {
    console.error('Error in getTotalBeatsInTimeRange:', error);
    return 0;
  }
};

export const getBeatsDataForChart = async (timeRange: 'day' | 'week' | 'month' | 'year', projectId?: string | null): Promise<ChartData[]> => {
  try {
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('No user found when fetching beat data');
    return [];
  }
  
    console.log('Fetching beat data for chart:', {
      timeRange,
      projectId,
      userId: user.id
    });
  
    const now = new Date();
    const data: ChartData[] = [];

    // Base query for beat activities
    let query = supabase
      .from('beat_activities')
      .select('*')  // Select all fields to ensure we have everything we need
      .eq('user_id', user.id);

    // Add project filter if specified
    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    console.log('Base query constructed:', {
      hasProjectFilter: !!projectId,
      projectId
    });

    switch (timeRange) {
      case 'month': {
        // Get the start of the current month
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        // Get the end of the current month
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        console.log('Fetching monthly data:', {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        });

        // Fetch all beat activities for the month
        const { data: activities, error } = await query
          .gte('date', startDate.toISOString().split('T')[0])
          .lte('date', endDate.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (error) {
          console.error('Error fetching monthly beat activities:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          return [];
        }

        console.log('Monthly activities fetched:', {
          count: activities?.length || 0,
          activities
        });

        // Generate data for each day of the month
        for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
          const dayStr = date.toISOString().split('T')[0];
          const dayActivities = activities.filter(activity => activity.date === dayStr);
          const value = dayActivities.reduce((sum, activity) => sum + (activity.count || 0), 0);

          data.push({
            label: formatDate(date, 'MMM d'),
            value: value
          });
        }
        break;
      }
      
      case 'week': {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);

        console.log('Fetching weekly data:', {
          weekStart: weekStart.toISOString(),
          now: now.toISOString()
        });

        // Fetch all beat activities for the week
        const { data: activities, error } = await query
          .gte('date', weekStart.toISOString().split('T')[0])
          .lte('date', now.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (error) {
          console.error('Error fetching weekly beat activities:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          return [];
        }

        console.log('Weekly activities fetched:', {
          count: activities?.length || 0,
          activities
        });

        // Get dates for the last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dayStr = date.toISOString().split('T')[0];
          
          const dayActivities = activities.filter(activity => activity.date === dayStr);
          const value = dayActivities.reduce((sum, activity) => sum + (activity.count || 0), 0);

          data.push({
            label: formatDate(date, 'EEE'),
            value: value
          });
        }
        break;
      }

      case 'year': {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        
        console.log('Fetching yearly data:', {
          yearStart: yearStart.toISOString(),
          now: now.toISOString()
        });

        // Fetch all beat activities for the year
        const { data: activities, error } = await query
          .gte('date', yearStart.toISOString().split('T')[0])
          .lte('date', now.toISOString().split('T')[0])
          .order('date', { ascending: true });

        if (error) {
          console.error('Error fetching yearly beat activities:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          return [];
        }

        console.log('Yearly activities fetched:', {
          count: activities?.length || 0,
          activities
        });

        // Get data for each month of the year
        for (let i = 11; i >= 0; i--) {
          const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
          
          const monthStr = monthStart.toISOString().split('T')[0].substring(0, 7); // YYYY-MM
          const monthActivities = activities.filter(activity => activity.date.startsWith(monthStr));
          const value = monthActivities.reduce((sum, activity) => sum + (activity.count || 0), 0);

          data.push({
            label: formatDate(monthStart, 'MMM'),
            value: value
          });
        }
        break;
      }

      default: { // day
        const dayStart = new Date(now);
        dayStart.setHours(0, 0, 0, 0);
        
        console.log('Fetching daily data:', {
          dayStart: dayStart.toISOString(),
          now: now.toISOString()
        });

        // Fetch all beat activities for today
        const { data: activities, error } = await query
          .gte('date', dayStart.toISOString().split('T')[0])
          .lte('date', now.toISOString().split('T')[0])
          .order('timestamp', { ascending: true });

        if (error) {
          console.error('Error fetching daily beat activities:', {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint
          });
          return [];
        }

        console.log('Daily activities fetched:', {
          count: activities?.length || 0,
          activities
        });

        // Create 8 intervals (24 hours / 3 hours per interval)
        for (let i = 0; i < 8; i++) {
          const intervalStart = new Date(dayStart);
          intervalStart.setHours(i * 3, 0, 0, 0);
          
          const intervalEnd = new Date(dayStart);
          intervalEnd.setHours((i * 3) + 2, 59, 59, 999);

          const intervalActivities = activities.filter(activity => {
            const activityTime = activity.timestamp;
            return activityTime >= intervalStart.getTime() && activityTime <= intervalEnd.getTime();
          });

          const value = intervalActivities.reduce((sum, activity) => sum + (activity.count || 0), 0);

          data.push({
            label: formatDate(intervalStart, 'HH:mm'),
            value: value
          });
        }
        break;
      }
    }

    console.log('Final chart data:', data);
    return data;
  } catch (error) {
    console.error('Error in getBeatsDataForChart:', error);
    return [];
  }
};

export function chunkData<T>(data: T[], size: number = BATCH_SIZE): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < data.length; i += size) {
    chunks.push(data.slice(i, Math.min(i + size, data.length)));
  }
  return chunks;
}

export async function processDataInBatches<T>(
  data: T[],
  processFn: (batch: T[]) => Promise<void>
): Promise<void> {
  const chunks = chunkData(data);
  
  try {
    for (const chunk of chunks) {
      await processFn(chunk);
    }
  } catch (error) {
    console.error('Error processing data chunks:', error);
    throw error;
  }
}
