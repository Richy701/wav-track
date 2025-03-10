import { Project, Sample, Session, Note, BeatActivity } from './types';

// Load data from localStorage or use empty arrays if not found
const loadFromStorage = <T>(key: string, defaultValue: T[]): T[] => {
  try {
    const storedData = localStorage.getItem(key);
    return storedData ? JSON.parse(storedData) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

// Save data to localStorage
const saveToStorage = <T>(key: string, data: T[]): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

// Status to completion percentage mapping
export const statusToCompletion = {
  'idea': 0,
  'in-progress': 25,
  'mixing': 50,
  'mastering': 75,
  'completed': 100
};

// Initialize arrays with data from localStorage or empty arrays
let projects: Project[] = loadFromStorage('projects', []);
export { projects };
export const samples: Sample[] = loadFromStorage('samples', []);
export const sessions: Session[] = loadFromStorage('sessions', []);
export const notes: Note[] = loadFromStorage('notes', []);
export const beatActivities: BeatActivity[] = loadFromStorage('beatActivities', []);

// Wrapper functions to modify arrays and update localStorage
export const addProject = (project: Project): void => {
  // Ensure the completion percentage matches the status
  if (project.status in statusToCompletion) {
    project.completionPercentage = statusToCompletion[project.status];
  }
  
  // Create a new array with the new project
  projects = [project, ...projects];
  
  // Save to storage
  saveToStorage('projects', projects);
};

export const updateProject = (updatedProject: Project): void => {
  // Create a new array with the updated project
  projects = projects.map(p => 
    p.id === updatedProject.id 
      ? { ...updatedProject, status: updatedProject.status as Project['status'] }
      : p
  );
  
  // Save the updated projects to localStorage
  saveToStorage('projects', projects);
};

export const deleteProject = (projectId: string): void => {
  // Create a new array without the deleted project
  projects = projects.filter(p => p.id !== projectId);
  
  // Save to storage
  saveToStorage('projects', projects);
};

export const clearAllProjects = (): void => {
  // Clear all projects
  projects = [];
  
  // Save empty array to storage
  saveToStorage('projects', projects);
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
  if (!projects.some(p => p.id === projectId)) {
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
    // Update existing entry
    existingEntry.count += count;
    existingEntry.timestamp = now.getTime(); // Update timestamp when updating count
    console.log('Updated existing beat entry:', existingEntry);
  } else {
    // Create new entry
    const newEntry: BeatActivity = {
      id: crypto.randomUUID(),
      projectId,
      date,
      count,
      timestamp: now.getTime()
    };
    beatActivities.push(newEntry);
    console.log('Created new beat entry:', newEntry);
  }
  
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

export const getTotalBeatsInTimeRange = (
  timeRange: 'day' | 'week' | 'month' | 'year'
): number => {
  // Return 0 if no projects exist
  if (projects.length === 0) {
    return 0;
  }
  
  const now = new Date();
  const startDate = new Date(now);
  
  switch (timeRange) {
    case 'day':
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'week':
      startDate.setDate(now.getDate() - now.getDay());
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'month':
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      break;
    case 'year':
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
  }
  
  const activities = getBeatsCreatedInRange(startDate, now);
  return activities.reduce((total, activity) => total + activity.count, 0);
};

export const getBeatsDataForChart = (
  timeRange: 'day' | 'week' | 'month' | 'year'
): { label: string; value: number }[] => {
  // Return empty data if no projects exist
  if (projects.length === 0) {
    return [];
  }
  
  const now = new Date();
  const result = [];
  
  if (timeRange === 'day') {
    // Start from the beginning of the current day (midnight)
    const dayStart = new Date(now);
    dayStart.setHours(0, 0, 0, 0);
    
    console.log('Generating daily chart data:', {
      now: now.toISOString(),
      dayStart: dayStart.toISOString()
    });
    
    // Create 6 four-hour blocks
    for (let i = 0; i < 6; i++) {
      const blockStart = new Date(dayStart);
      blockStart.setHours(i * 4, 0, 0, 0);
      
      const blockEnd = new Date(blockStart);
      blockEnd.setHours(blockStart.getHours() + 4, 0, 0, 0);
      
      // Format the time label
      let hours = blockStart.getHours();
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // Convert 0 to 12
      const timeLabel = `${hours}${ampm}`;
      
      // Count beats created in this 4-hour block
      const activities = getBeatsCreatedInRange(blockStart, blockEnd);
      const count = activities.reduce((total, activity) => total + activity.count, 0);
      
      console.log('Block data:', {
        timeLabel,
        blockStart: blockStart.toISOString(),
        blockEnd: blockEnd.toISOString(),
        activities,
        count
      });
      
      result.push({
        label: timeLabel,
        value: count
      });
    }
  } else if (timeRange === 'week') {
    // Last 7 days
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(now.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);
      
      const dayName = days[dayStart.getDay()];
      
      // Count beats created on this day
      const activities = getBeatsCreatedInRange(dayStart, dayEnd);
      const count = activities.reduce((total, activity) => total + activity.count, 0);
      
      result.push({
        label: dayName,
        value: count
      });
    }
  } else if (timeRange === 'month') {
    // Last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - 6);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(now);
      weekEnd.setDate(now.getDate() - (i * 7));
      weekEnd.setHours(23, 59, 59, 999);
      
      const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;
      
      // Count beats created in this week
      const activities = getBeatsCreatedInRange(weekStart, weekEnd);
      const count = activities.reduce((total, activity) => total + activity.count, 0);
      
      result.push({
        label,
        value: count
      });
    }
  } else if (timeRange === 'year') {
    // Last 12 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now);
      monthStart.setMonth(now.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthStart.getMonth() + 1, 0);
      monthEnd.setHours(23, 59, 59, 999);
      
      const monthName = months[monthStart.getMonth()];
      
      // Count beats created in this month
      const activities = getBeatsCreatedInRange(monthStart, monthEnd);
      const count = activities.reduce((total, activity) => total + activity.count, 0);
      
      result.push({
        label: monthName,
        value: count
      });
    }
  }
  
  return result;
};

export const getProjects = (): Project[] => {
  return [...projects];
};
