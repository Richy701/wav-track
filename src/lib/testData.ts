import { supabase } from './supabase'
import { Project } from './types'

// Function to generate random dates within the past month
const randomDate = (daysAgo: number): string => {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo))
  return date.toISOString()
}

// Array of realistic project data for music producers
const projectData: Partial<Project>[] = [
  {
    title: 'Late Night Vibes',
    description: 'Downtempo beat with atmospheric pads and lo-fi drums',
    status: 'completed',
    bpm: 85,
    key: 'Dm',
    genre: 'Lofi',
    tags: ['chill', 'night', 'instrumental'],
    completionPercentage: 100,
  },
  {
    title: 'Summer Bounce',
    description: 'Upbeat tropical house track with vocal chops',
    status: 'mastering',
    bpm: 128,
    key: 'G',
    genre: 'House',
    tags: ['summer', 'dance', 'tropical'],
    completionPercentage: 75,
  },
  {
    title: 'Dystopian Drill',
    description: 'Dark UK drill with cinematic elements',
    status: 'mixing',
    bpm: 140,
    key: 'C#m',
    genre: 'Drill',
    tags: ['dark', 'uk', 'trap'],
    completionPercentage: 50,
  },
  {
    title: 'Quantum Funk',
    description: 'Funky bassline with syncopated rhythm and retro synths',
    status: 'in-progress',
    bpm: 110,
    key: 'Eb',
    genre: 'Funk',
    tags: ['bass', 'retro', 'synth'],
    completionPercentage: 25,
  },
  {
    title: 'Neon Dreams',
    description: 'Synthwave track with arpeggiated melodies',
    status: 'idea',
    bpm: 96,
    key: 'Bm',
    genre: 'Synthwave',
    tags: ['retro', '80s', 'synth'],
    completionPercentage: 0,
  },
  {
    title: 'Urban Echo',
    description: 'Modern RnB with trap elements and vocal effects',
    status: 'in-progress',
    bpm: 92,
    key: 'F#m',
    genre: 'RnB',
    tags: ['urban', 'vocal', 'trap'],
    completionPercentage: 25,
  },
  {
    title: 'Celestial',
    description: 'Ambient soundscape with evolving textures',
    status: 'mixing',
    bpm: 75,
    key: 'C',
    genre: 'Ambient',
    tags: ['space', 'chill', 'texture'],
    completionPercentage: 50,
  },
  {
    title: 'Cyberpunk Riddim',
    description: 'Heavy dubstep with glitchy sound design',
    status: 'completed',
    bpm: 150,
    key: 'F',
    genre: 'Dubstep',
    tags: ['heavy', 'bass', 'glitch'],
    completionPercentage: 100,
  },
  {
    title: 'Analog Nostalgia',
    description: 'Boom bap beat with vinyl samples and warm bass',
    status: 'mastering',
    bpm: 90,
    key: 'Ab',
    genre: 'Hip Hop',
    tags: ['boombap', 'vinyl', 'samples'],
    completionPercentage: 75,
  },
  {
    title: 'Cloud Nine',
    description: 'Dreamy pop with vocal chops and airy synths',
    status: 'idea',
    bpm: 118,
    key: 'D',
    genre: 'Pop',
    tags: ['dreamy', 'vocals', 'synth'],
    completionPercentage: 0,
  },
  {
    title: 'Metro Pulse',
    description: 'Tech house with driving baseline and percussive elements',
    status: 'in-progress',
    bpm: 125,
    key: 'Am',
    genre: 'Tech House',
    tags: ['club', 'dance', 'percussion'],
    completionPercentage: 25,
  },
  {
    title: 'Jungle Therapy',
    description: 'Fast-paced breakbeat with atmospheric samples',
    status: 'mixing',
    bpm: 170,
    key: 'Gm',
    genre: 'Jungle',
    tags: ['breaks', 'fast', 'atmospheric'],
    completionPercentage: 50,
  },
  {
    title: 'Astral Projection',
    description: 'Psychedelic trance with hypnotic sequences',
    status: 'idea',
    bpm: 138,
    key: 'E',
    genre: 'Psytrance',
    tags: ['psychedelic', 'hypnotic', 'trance'],
    completionPercentage: 0,
  },
  {
    title: 'Dawn Chorus',
    description: 'Melodic techno with evolving arps and field recordings',
    status: 'completed',
    bpm: 122,
    key: 'Bb',
    genre: 'Techno',
    tags: ['melodic', 'arps', 'field-recording'],
    completionPercentage: 100,
  },
  {
    title: 'Sunset Vibes',
    description: 'Chillhop beat with jazzy samples and light percussion',
    status: 'mastering',
    bpm: 88,
    key: 'E',
    genre: 'Chillhop',
    tags: ['jazz', 'chill', 'samples'],
    completionPercentage: 75,
  },
]

// Function to insert test data into Supabase
export const insertTestData = async (): Promise<void> => {
  try {
    console.log('Starting to insert test data...')

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('No authenticated user found')
    }

    // Prepare projects with user ID and timestamps
    const projects = projectData.map(project => {
      // Generate random dates for created_at and last_modified
      const created_at = randomDate(45) // Random date up to 45 days ago
      const last_modified = new Date(
        new Date(created_at).getTime() + Math.random() * 1000 * 60 * 60 * 24 * 14
      ).toISOString() // 0-14 days after creation

      return {
        ...project,
        user_id: user.id,
        created_at,
        last_modified,
        // Add client-side fields that are required by the Project interface
        dateCreated: created_at,
        lastModified: last_modified,
        // Ensure coverArt is null (not undefined)
        coverArt: null,
      }
    })

    // Clear existing data if needed (optional, uncomment if you want to start fresh)
    // await supabase.from('projects').delete().eq('user_id', user.id);

    // Insert projects in batches to avoid rate limits
    const batchSize = 5
    let successCount = 0

    for (let i = 0; i < projects.length; i += batchSize) {
      try {
        const batch = projects.slice(i, i + batchSize)

        console.log(
          `Inserting batch ${i / batchSize + 1} of ${Math.ceil(projects.length / batchSize)}`
        )

        const { data, error } = await supabase.from('projects').insert(batch).select()

        if (error) {
          console.error(`Error inserting batch ${i / batchSize + 1}:`, error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          console.error('Data that caused the error:', JSON.stringify(batch[0], null, 2))
        } else {
          console.log(`Successfully inserted batch ${i / batchSize + 1}:`, data?.length, 'projects')
          successCount += data?.length || 0
        }
      } catch (batchError) {
        console.error(`Exception in batch ${i / batchSize + 1}:`, batchError)
      }

      // Add a small delay between batches to ensure realtime events are processed
      if (i + batchSize < projects.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    console.log(`Test data insertion complete! Successfully inserted ${successCount} projects`)
  } catch (error) {
    console.error('Error inserting test data:', error)
    throw error
  }
}

// Function to generate beat activity data
export const insertTestBeatActivities = async (): Promise<void> => {
  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('No authenticated user found')
    }

    // Get user's projects
    const { data: projects } = await supabase.from('projects').select('id').eq('user_id', user.id)

    if (!projects || projects.length === 0) {
      throw new Error('No projects found for user')
    }

    // Generate 30-50 random beat activities
    const activities = []
    const activityCount = 30 + Math.floor(Math.random() * 20)

    for (let i = 0; i < activityCount; i++) {
      const projectIndex = Math.floor(Math.random() * projects.length)
      const date = randomDate(30)
      const count = 1 + Math.floor(Math.random() * 10) // 1-10 beat count

      activities.push({
        projectId: projects[projectIndex].id,
        date: date.split('T')[0], // Just the date part
        count,
        timestamp: new Date(date).getTime(),
      })
    }

    // Insert beat activities in batches
    const batchSize = 10
    let successCount = 0

    for (let i = 0; i < activities.length; i += batchSize) {
      try {
        const batch = activities.slice(i, i + batchSize)

        console.log(
          `Inserting beat activities batch ${i / batchSize + 1} of ${Math.ceil(activities.length / batchSize)}`
        )

        const { data, error } = await supabase.from('beat_activities').insert(batch).select()

        if (error) {
          console.error(`Error inserting beat activities batch ${i / batchSize + 1}:`, error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          console.error('Sample data that caused the error:', JSON.stringify(batch[0], null, 2))
        } else {
          console.log(
            `Successfully inserted beat activities batch ${i / batchSize + 1}:`,
            data?.length,
            'activities'
          )
          successCount += data?.length || 0
        }
      } catch (batchError) {
        console.error(`Exception in beat activities batch ${i / batchSize + 1}:`, batchError)
      }

      // Add a small delay between batches
      if (i + batchSize < activities.length) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    console.log(
      `Test beat activities insertion complete! Successfully inserted ${successCount} activities`
    )
  } catch (error) {
    console.error('Error inserting test beat activities:', error)
    throw error
  }
}

// Function to generate sessions data
export const insertTestSessions = async (): Promise<void> => {
  try {
    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('No authenticated user found')
    }

    // Get user's projects
    const { data: projects } = await supabase
      .from('projects')
      .select('id, title, status')
      .eq('user_id', user.id)

    if (!projects || projects.length === 0) {
      throw new Error('No projects found for user')
    }

    // Common session notes templates
    const sessionNotes = [
      'Worked on the main melody and chord progression',
      'Added new drums and percussion elements',
      'Recorded vocals and processed with effects',
      'Arranged the structure of the track',
      'Mixed down all channels and balanced levels',
      'Created new bassline and synth parts',
      'Added automation to create more movement',
      'Recorded new samples to use in the beat',
      'Finalized the mix and prepared for mastering',
      'Brainstormed ideas for the arrangement',
    ]

    // Generate 15-25 random sessions
    const sessions = []
    const sessionCount = 15 + Math.floor(Math.random() * 10)

    for (let i = 0; i < sessionCount; i++) {
      const projectIndex = Math.floor(Math.random() * projects.length)
      const date = randomDate(45)
      const duration = 15 + Math.floor(Math.random() * 120) // 15-135 minutes
      const noteIndex = Math.floor(Math.random() * sessionNotes.length)

      sessions.push({
        projectId: projects[projectIndex].id,
        date: date,
        duration,
        notes: sessionNotes[noteIndex] + ' for ' + projects[projectIndex].title,
      })
    }

    // Insert sessions in batches
    const batchSize = 5
    let successCount = 0

    for (let i = 0; i < sessions.length; i += batchSize) {
      try {
        const batch = sessions.slice(i, i + batchSize)

        console.log(
          `Inserting sessions batch ${i / batchSize + 1} of ${Math.ceil(sessions.length / batchSize)}`
        )

        const { data, error } = await supabase.from('sessions').insert(batch).select()

        if (error) {
          console.error(`Error inserting sessions batch ${i / batchSize + 1}:`, error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          console.error('Sample data that caused the error:', JSON.stringify(batch[0], null, 2))
        } else {
          console.log(
            `Successfully inserted sessions batch ${i / batchSize + 1}:`,
            data?.length,
            'sessions'
          )
          successCount += data?.length || 0
        }
      } catch (batchError) {
        console.error(`Exception in sessions batch ${i / batchSize + 1}:`, batchError)
      }

      // Add a small delay between batches
      if (i + batchSize < sessions.length) {
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    console.log(`Test sessions insertion complete! Successfully inserted ${successCount} sessions`)
  } catch (error) {
    console.error('Error inserting test sessions:', error)
    throw error
  }
}

// Main function to insert all test data
export const insertAllTestData = async (): Promise<void> => {
  try {
    await insertTestData()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await insertTestBeatActivities()
    await new Promise(resolve => setTimeout(resolve, 1000))
    await insertTestSessions()
    console.log('All test data successfully inserted!')
  } catch (error) {
    console.error('Error inserting all test data:', error)
  }
}
