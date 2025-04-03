import { useState, useEffect } from 'react'

interface UseLoadingStateOptions {
  timeout?: number
  onTimeout?: () => void
}

export function useLoadingState(isLoading: boolean, options: UseLoadingStateOptions = {}) {
  const { timeout = 10000, onTimeout } = options
  const [showTimeout, setShowTimeout] = useState(false)

  useEffect(() => {
    let timeoutId: number

    if (isLoading) {
      timeoutId = window.setTimeout(() => {
        setShowTimeout(true)
        onTimeout?.()
      }, timeout)
    } else {
      setShowTimeout(false)
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId)
      }
    }
  }, [isLoading, timeout, onTimeout])

  return {
    isLoading,
    showTimeout,
  }
}
