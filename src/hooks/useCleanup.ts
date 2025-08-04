// Custom hook for managing cleanup and preventing memory leaks
import { useEffect, useRef } from 'react'

/**
 * Hook to manage component cleanup and prevent memory leaks
 */
export const useCleanup = () => {
  const cleanupFunctions = useRef<(() => void)[]>([])
  const isMountedRef = useRef(true)

  // Add a cleanup function to be called on unmount
  const addCleanup = (fn: () => void) => {
    cleanupFunctions.current.push(fn)
  }

  // Check if component is still mounted
  const isMounted = () => isMountedRef.current

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      cleanupFunctions.current.forEach(fn => {
        try {
          fn()
        } catch (error) {
          console.error('Error during cleanup:', error)
        }
      })
      cleanupFunctions.current = []
    }
  }, [])

  return { addCleanup, isMounted }
}

/**
 * Hook for managing Supabase subscriptions with automatic cleanup
 */
export const useSupabaseSubscription = () => {
  const subscriptions = useRef<any[]>([])
  const { addCleanup } = useCleanup()

  const addSubscription = (subscription: any) => {
    subscriptions.current.push(subscription)
    
    // Add cleanup function
    addCleanup(() => {
      subscription.unsubscribe()
    })
    
    return subscription
  }

  const removeAllSubscriptions = () => {
    subscriptions.current.forEach(sub => {
      try {
        sub.unsubscribe()
      } catch (error) {
        console.error('Error unsubscribing:', error)
      }
    })
    subscriptions.current = []
  }

  // Cleanup all subscriptions on unmount
  addCleanup(removeAllSubscriptions)

  return { addSubscription, removeAllSubscriptions }
}