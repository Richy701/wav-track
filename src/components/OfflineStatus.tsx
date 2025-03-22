import { useState, useEffect } from 'react'
import { Wifi, WifiOff, CloudOff, RefreshCw } from 'lucide-react'
import { getDB } from '@/lib/indexedDB'
import { cn } from '@/lib/utils'

export default function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [hasPendingSync, setHasPendingSync] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const checkSyncQueue = async () => {
      const db = await getDB()
      const queue = await db.getAll('syncQueue')
      setHasPendingSync(queue.length > 0)
    }

    const handleOnline = () => {
      setIsOnline(true)
      checkSyncQueue()
    }

    const handleOffline = () => {
      setIsOnline(false)
      checkSyncQueue()
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Check initial sync state
    checkSyncQueue()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Update sync status when changes occur
  useEffect(() => {
    const interval = setInterval(async () => {
      const db = await getDB()
      const queue = await db.getAll('syncQueue')
      setHasPendingSync(queue.length > 0)
    }, 5000) // Check every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed bottom-4 right-4 flex items-center gap-2 rounded-lg bg-background/80 p-2 shadow-lg backdrop-blur">
      {isOnline ? (
        <Wifi className="h-4 w-4 text-green-500" />
      ) : (
        <WifiOff className="h-4 w-4 text-yellow-500" />
      )}
      
      {hasPendingSync && (
        <div className="flex items-center gap-1">
          <RefreshCw 
            className={cn(
              "h-4 w-4 text-blue-500",
              isSyncing && "animate-spin"
            )} 
          />
          <span className="text-xs text-muted-foreground">
            {isSyncing ? 'Syncing...' : 'Changes pending'}
          </span>
        </div>
      )}

      {!isOnline && !hasPendingSync && (
        <div className="flex items-center gap-1">
          <CloudOff className="h-4 w-4 text-yellow-500" />
          <span className="text-xs text-muted-foreground">
            Working offline
          </span>
        </div>
      )}
    </div>
  )
} 