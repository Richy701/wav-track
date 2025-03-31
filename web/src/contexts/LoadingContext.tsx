import React, { createContext, useContext, useState, useEffect } from 'react'

interface LoadingContextType {
  isLoading: boolean
  setLoading: (key: string, loading: boolean) => void
  loadingStates: Record<string, boolean>
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined)

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }))
  }

  const isLoading = Object.values(loadingStates).some(state => state)

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, loadingStates }}>
      {children}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const context = useContext(LoadingContext)
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
} 