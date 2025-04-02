import { openDB, DBSchema, IDBPDatabase } from 'idb'
import { Project, Sample, Session, Note, BeatActivity } from './types'

interface WavTrackDB extends DBSchema {
  projects: {
    key: string
    value: Project
    indexes: { 'by-date': Date }
  }
  samples: {
    key: string
    value: Sample
  }
  sessions: {
    key: string
    value: Session
    indexes: { 'by-project': string }
  }
  notes: {
    key: string
    value: Note
    indexes: { 'by-project': string }
  }
  beatActivities: {
    key: string
    value: BeatActivity
    indexes: { 'by-project': string; 'by-date': Date }
  }
  syncQueue: {
    key: string
    value: {
      timestamp: number
      operation: 'create' | 'update' | 'delete'
      storeName: keyof WavTrackDB
      data: any
    }
  }
}

const DB_NAME = 'wavtrack-db'
const DB_VERSION = 1

export async function initDB(): Promise<IDBPDatabase<WavTrackDB>> {
  return openDB<WavTrackDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create stores
      if (!db.objectStoreNames.contains('projects')) {
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' })
        projectStore.createIndex('by-date', 'lastModified')
      }

      if (!db.objectStoreNames.contains('samples')) {
        db.createObjectStore('samples', { keyPath: 'id' })
      }

      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' })
        sessionStore.createIndex('by-project', 'projectId')
      }

      if (!db.objectStoreNames.contains('notes')) {
        const noteStore = db.createObjectStore('notes', { keyPath: 'id' })
        noteStore.createIndex('by-project', 'projectId')
      }

      if (!db.objectStoreNames.contains('beatActivities')) {
        const beatStore = db.createObjectStore('beatActivities', { keyPath: 'id' })
        beatStore.createIndex('by-project', 'projectId')
        beatStore.createIndex('by-date', 'date')
      }

      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
      }
    },
  })
}

let db: IDBPDatabase<WavTrackDB>

export async function getDB() {
  if (!db) {
    db = await initDB()
  }
  return db
}

// Generic CRUD operations
export async function add<T extends keyof WavTrackDB>(storeName: T, item: WavTrackDB[T]['value']) {
  const db = await getDB()
  await db.add(storeName, item)
  await addToSyncQueue('create', storeName, item)
}

export async function update<T extends keyof WavTrackDB>(
  storeName: T,
  item: WavTrackDB[T]['value']
) {
  const db = await getDB()
  await db.put(storeName, item)
  await addToSyncQueue('update', storeName, item)
}

export async function remove<T extends keyof WavTrackDB>(storeName: T, id: string) {
  const db = await getDB()
  await db.delete(storeName, id)
  await addToSyncQueue('delete', storeName, { id })
}

export async function getAll<T extends keyof WavTrackDB>(
  storeName: T
): Promise<WavTrackDB[T]['value'][]> {
  const db = await getDB()
  return db.getAll(storeName)
}

export async function getById<T extends keyof WavTrackDB>(
  storeName: T,
  id: string
): Promise<WavTrackDB[T]['value'] | undefined> {
  const db = await getDB()
  return db.get(storeName, id)
}

// Sync queue operations
async function addToSyncQueue<T extends keyof WavTrackDB>(
  operation: 'create' | 'update' | 'delete',
  storeName: T,
  data: any
) {
  const db = await getDB()
  await db.add('syncQueue', {
    timestamp: Date.now(),
    operation,
    storeName,
    data,
  })
}

export async function processSyncQueue() {
  const db = await getDB()
  const queue = await db.getAll('syncQueue')

  for (const item of queue) {
    try {
      // Attempt to sync with the server
      const response = await fetch(`/api/${item.storeName}`, {
        method:
          item.operation === 'create' ? 'POST' : item.operation === 'update' ? 'PUT' : 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item.data),
      })

      if (response.ok) {
        // Remove from queue if successful
        await db.delete('syncQueue', item.id!)
      }
    } catch (error) {
      console.error('Failed to process sync item:', error)
      // Leave in queue to retry later
    }
  }
}

// Initialize sync on page load
if (navigator.onLine) {
  processSyncQueue().catch(console.error)
}

// Listen for online status changes
window.addEventListener('online', () => {
  processSyncQueue().catch(console.error)
})
