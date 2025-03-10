import { Project, Sample, Session, Note, BeatActivity } from './types';
import { cache } from './cache';
import { format as formatDate } from 'date-fns';

// Batch size for storage operations
const BATCH_SIZE = 50;

// Type for pending writes
interface PendingWrites {
  [key: string]: unknown[];
}

interface ChartData {
  label: string;
  value: number;
  cumulative?: number;
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
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        const storedData = localStorage.getItem(key);
        const data = storedData ? JSON.parse(storedData) : defaultValue;
        
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
            const chunks = [];
            for (let i = 0; i < data.length; i += BATCH_SIZE) {
              chunks.push(data.slice(i, i + BATCH_SIZE));
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
export const getProjects = (): Project[] => {
  const cachedProjects = cache.get<Project[]>('projects');
  if (cachedProjects) {
    return [...cachedProjects];
  }
  return [...projects];
};

// Add project with optimistic updates
export const addProject = async (project: Project): Promise<Project> => {
  // Ensure the completion percentage matches the status
  if (project.status in statusToCompletion) {
    project.completionPercentage = statusToCompletion[project.status];
  }
  
  // Update memory state
  projects = [project, ...projects];
  
  // Update cache immediately
  cache.set('projects', projects);
  
  // Record initial beat activity for the new project
  recordBeatCreation(project.id, 0);
  
  // Save to storage asynchronously
  await saveToStorage('projects', projects);
  
  return project;
};

export const updateProject = async (updatedProject: Project): Promise<void> => {
  // Find the existing project to check for status change
  const existingProject = projects.find(p => p.id === updatedProject.id);
  const statusChanged = existingProject && existingProject.status !== updatedProject.status;
  
  // Create a new array with the updated project
  projects = projects.map(p => 
    p.id === updatedProject.id 
      ? { ...updatedProject, status: updatedProject.status as Project['status'] }
      : p
  );
  
  // If status changed, record a new beat activity
  if (statusChanged) {
    // Record beat activity with count 1 to show progress
    recordBeatCreation(updatedProject.id, 1);
  }
  
  // Update cache
  cache.set('projects', projects);
  
  // Save the updated projects to localStorage
  await saveToStorage('projects', projects);
};

export const deleteProject = async (projectId: string): Promise<void> => {
  // Create a new array without the deleted project
  projects = projects.filter(p => p.id !== projectId);
  
  // Save to storage
  await saveToStorage('projects', projects);
};

export const clearAllProjects = async (): Promise<void> => {
  // Clear all projects
  projects = [];
  
  // Save empty array to storage
  await saveToStorage('projects', projects);
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
export const recordBeatCreation = (projectId: string, count: number = 1, customDate?: Date) => {
  // Prevent recording if project doesn't exist
  const project = projects.find(p => p.id === projectId);
  if (!project) {
    console.warn(`Attempted to record beats for non-existent project: ${projectId}`);
    return;
  }
  
  // Use the provided date or current date with time
  const now = customDate || new Date();
  const date = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  
  // Check if there's already an entry for this date and project
  const existingEntry = beatActivities.find(
    entry => entry.date === date && entry.projectId === projectId
  );
  
  if (existingEntry) {
    // Only update count if it's greater than 0 (ignore initial creation)
    if (count > 0) {
      existingEntry.count += count;
      existingEntry.timestamp = now.getTime(); // Update timestamp when updating count
      console.log('Updated existing beat entry:', existingEntry);
    }
  } else {
    // Create new entry with at least count 1 for status changes
    const newEntry: BeatActivity = {
      id: crypto.randomUUID(),
      projectId,
      date,
      count: Math.max(1, count), // Ensure at least 1 count for new entries
      timestamp: now.getTime()
    };
    beatActivities.push(newEntry);
    console.log('Created new beat entry:', newEntry);
  }
  
  // Update cache
  cache.set('beatActivities', beatActivities);
  
  // Save updated beat activities to localStorage
  saveToStorage('beatActivities', beatActivities);
  console.log('Current beat activities:', beatActivities);
};

export const getBeatsCreatedByProject = (projectId: string): number => {
  // Check if the project exists first
  if (!projects.some(p => p.id === projectId)) {
    return 0;
  }
  
  return beatActivities
    .filter(activity => activity.projectId === projectId)
    .reduce((total, activity) => total + activity.count, 0);
};

export const getBeatsCreatedInRange = (
  startDate: Date, 
  endDate: Date
): BeatActivity[] => {
  // Convert dates to timestamps for accurate comparison
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();
  
  console.log('Searching for beats between:', {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
    startTimestamp,
    endTimestamp
  });
  
  const filteredActivities = beatActivities.filter(activity => {
    // Make sure the project still exists
    if (!projects.some(p => p.id === activity.projectId)) {
      return false;
    }
    
    // Get the timestamp, either from the activity or from the date
    const activityTimestamp = activity.timestamp || new Date(activity.date).getTime();
    
    const isInRange = activityTimestamp >= startTimestamp && activityTimestamp <= endTimestamp;
    console.log('Activity check:', {
      activity,
      activityTimestamp,
      isInRange
    });
    
    return isInRange;
  });
  
  console.log('Found activities in range:', filteredActivities);
  return filteredActivities;
};

export const getTotalBeatsInTimeRange = (timeRange: 'day' | 'week' | 'month' | 'year', projectId?: string | null): number => {
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

  return beatActivities
    .filter(activity => {
      const activityDate = new Date(activity.date);
      const isInRange = activityDate >= startDate && activityDate <= now;
      if (projectId) {
        return isInRange && activity.projectId === projectId;
      }
      return isInRange;
    })
    .length;
};

export const getBeatsDataForChart = (timeRange: 'day' | 'week' | 'month' | 'year', projectId?: string | null): ChartData[] => {
  const now = new Date();
  const data: ChartData[] = [];
  let formatPattern: string;
  const intervals: number = timeRange === 'day' ? 24 
    : timeRange === 'week' ? 7 
    : timeRange === 'month' ? 30 
    : 12;

  switch (timeRange) {
    case 'day':
      formatPattern = 'ha';
      break;
    case 'week':
      formatPattern = 'EEE';
      break;
    case 'month':
      formatPattern = 'MMM d';
      break;
    case 'year':
      formatPattern = 'MMM';
      break;
    default:
      formatPattern = 'MMM d';
  }

  // Generate intervals
  for (let i = intervals - 1; i >= 0; i--) {
    const date = new Date();
    switch (timeRange) {
      case 'day':
        date.setHours(date.getHours() - i);
        break;
      case 'week':
        date.setDate(date.getDate() - i);
        break;
      case 'month':
        date.setDate(date.getDate() - i);
        break;
      case 'year':
        date.setMonth(date.getMonth() - i);
        break;
    }

    const label = formatDate(date, formatPattern);
    const startOfInterval = new Date(date);
    const endOfInterval = new Date(date);

    switch (timeRange) {
      case 'day':
        startOfInterval.setMinutes(0, 0, 0);
        endOfInterval.setMinutes(59, 59, 999);
        break;
      case 'week':
      case 'month':
        startOfInterval.setHours(0, 0, 0, 0);
        endOfInterval.setHours(23, 59, 59, 999);
        break;
      case 'year':
        startOfInterval.setDate(1);
        startOfInterval.setHours(0, 0, 0, 0);
        endOfInterval.setMonth(endOfInterval.getMonth() + 1, 0);
        endOfInterval.setHours(23, 59, 59, 999);
        break;
    }

    const value = beatActivities.filter(activity => {
      const activityDate = new Date(activity.date);
      const isInRange = activityDate >= startOfInterval && activityDate <= endOfInterval;
      if (projectId) {
        return isInRange && activity.projectId === projectId;
      }
      return isInRange;
    }).length;

    data.push({ label, value });
  }

  return data;
};
