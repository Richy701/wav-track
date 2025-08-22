// Enhanced Audio Analysis Hook
// Integrates ML-powered audio analysis with existing WavTrack architecture

import { useState, useCallback, useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { audioWorkerManager, EnhancedAudioAnalysis } from '@/lib/audio-worker-manager'
import { analyzeAudio } from '@/lib/audio-analysis' // Fallback to original
import { useAuth } from '@/contexts/AuthContext'

interface UseEnhancedAudioAnalysisOptions {
  enableMLFeatures?: boolean
  useWebWorkers?: boolean
  cacheResults?: boolean
  progressCallback?: (progress: number) => void
}

interface AnalysisState {
  isAnalyzing: boolean
  progress: number
  error: string | null
  hasMLFeatures: boolean
  usingWebWorker: boolean
}

export function useEnhancedAudioAnalysis(options: UseEnhancedAudioAnalysisOptions = {}) {
  const {
    enableMLFeatures = true,
    useWebWorkers = true,
    cacheResults = true,
    progressCallback
  } = options

  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isAnalyzing: false,
    progress: 0,
    error: null,
    hasMLFeatures: false,
    usingWebWorker: false
  })

  const abortControllerRef = useRef<AbortController | null>(null)

  // Query for analysis results with caching
  const useAnalysisQuery = useCallback((file: File | null, queryKey: string[]) => {
    return useQuery({
      queryKey,
      queryFn: async () => {
        if (!file) return null
        return await performEnhancedAnalysis(file)
      },
      enabled: !!file,
      staleTime: cacheResults ? 1000 * 60 * 30 : 0, // Cache for 30 minutes
      gcTime: cacheResults ? 1000 * 60 * 60 : 1000 * 60, // Keep in memory for 1 hour vs 1 minute
      refetchOnWindowFocus: false,
      retry: 1
    })
  }, [cacheResults])

  const performEnhancedAnalysis = useCallback(async (file: File): Promise<EnhancedAudioAnalysis | any> => {
    // Create new abort controller for this analysis
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()

    setAnalysisState(prev => ({
      ...prev,
      isAnalyzing: true,
      progress: 0,
      error: null,
      hasMLFeatures: enableMLFeatures,
      usingWebWorker: useWebWorkers && audioWorkerManager.getWorkerStatus().supportsBrowserWorkers
    }))

    const handleProgress = (progress: number) => {
      setAnalysisState(prev => ({ ...prev, progress }))
      progressCallback?.(progress)
    }

    try {
      let result: EnhancedAudioAnalysis | any

      if (enableMLFeatures) {
        try {
          // Try enhanced analysis with ML features
          handleProgress(10)
          
          if (useWebWorkers && audioWorkerManager.getWorkerStatus().supportsBrowserWorkers) {
            // Use Web Worker for heavy ML computations
            result = await audioWorkerManager.analyzeAudioEnhancedWithCache(file, {
              useCache: cacheResults,
              progressCallback: (progress) => handleProgress(10 + progress * 0.8)
            })
          } else {
            // Fall back to main thread
            console.log('Web Workers not available, using main thread')
            const { analyzeAudioEnhanced } = await import('@/lib/audio-analysis')
            result = await analyzeAudioEnhanced(file)
            handleProgress(90)
          }
          
        } catch (mlError) {
          console.warn('Enhanced analysis failed, falling back to basic analysis:', mlError)
          
          // Fall back to basic analysis
          result = await analyzeAudio(file)
          handleProgress(90)
          
          setAnalysisState(prev => ({
            ...prev,
            hasMLFeatures: false,
            usingWebWorker: false
          }))
        }
      } else {
        // Use basic analysis only
        result = await analyzeAudio(file)
        handleProgress(90)
      }

      // Check if operation was aborted
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Analysis aborted')
      }

      handleProgress(100)
      
      setAnalysisState(prev => ({
        ...prev,
        isAnalyzing: false,
        progress: 100,
        error: null
      }))

      return result

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed'
      
      if (errorMessage !== 'Analysis aborted') {
        setAnalysisState(prev => ({
          ...prev,
          isAnalyzing: false,
          error: errorMessage,
          hasMLFeatures: false
        }))
      }
      
      throw error
    }
  }, [enableMLFeatures, useWebWorkers, cacheResults, progressCallback])

  // Analyze single audio file
  const analyzeFile = useCallback(async (file: File) => {
    const queryKey = ['audio-analysis', user?.id || 'guest', file.name, file.size, file.lastModified]
    
    // Check if we already have this analysis cached
    const cachedResult = queryClient.getQueryData(queryKey)
    if (cachedResult && cacheResults) {
      return cachedResult
    }

    // Perform analysis
    try {
      const result = await performEnhancedAnalysis(file)
      
      // Cache the result
      if (cacheResults) {
        queryClient.setQueryData(queryKey, result)
      }
      
      return result
    } catch (error) {
      console.error('File analysis failed:', error)
      throw error
    }
  }, [user?.id, performEnhancedAnalysis, cacheResults, queryClient])

  // Batch analyze multiple files
  const analyzeMultipleFiles = useCallback(async (
    files: File[],
    batchProgressCallback?: (fileIndex: number, fileProgress: number, overallProgress: number) => void
  ) => {
    setAnalysisState(prev => ({
      ...prev,
      isAnalyzing: true,
      progress: 0,
      error: null
    }))

    try {
      const results = await audioWorkerManager.analyzeMultipleFiles(
        files,
        batchProgressCallback
      )

      setAnalysisState(prev => ({
        ...prev,
        isAnalyzing: false,
        progress: 100,
        error: null
      }))

      return results
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Batch analysis failed'
      setAnalysisState(prev => ({
        ...prev,
        isAnalyzing: false,
        error: errorMessage
      }))
      throw error
    }
  }, [])

  // Cancel ongoing analysis
  const cancelAnalysis = useCallback(() => {
    abortControllerRef.current?.abort()
    setAnalysisState(prev => ({
      ...prev,
      isAnalyzing: false,
      progress: 0,
      error: 'Analysis cancelled'
    }))
  }, [])

  // Clear analysis cache
  const clearCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['audio-analysis'] })
    
    // Clear localStorage cache as well
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('audio_analysis_')) {
        localStorage.removeItem(key)
      }
    })
  }, [queryClient])

  // Get cached analysis for a file
  const getCachedAnalysis = useCallback((file: File) => {
    const queryKey = ['audio-analysis', user?.id || 'guest', file.name, file.size, file.lastModified]
    return queryClient.getQueryData(queryKey)
  }, [user?.id, queryClient])

  // Prefetch analysis for a file
  const prefetchAnalysis = useCallback(async (file: File) => {
    const queryKey = ['audio-analysis', user?.id || 'guest', file.name, file.size, file.lastModified]
    
    await queryClient.prefetchQuery({
      queryKey,
      queryFn: () => performEnhancedAnalysis(file),
      staleTime: cacheResults ? 1000 * 60 * 30 : 0
    })
  }, [user?.id, queryClient, performEnhancedAnalysis, cacheResults])

  // Get analysis capabilities info
  const getCapabilities = useCallback(() => {
    const workerStatus = audioWorkerManager.getWorkerStatus()
    
    return {
      hasMLFeatures: enableMLFeatures,
      supportsWebWorkers: workerStatus.supportsBrowserWorkers,
      workerActive: workerStatus.isActive,
      cacheEnabled: cacheResults,
      pendingAnalyses: workerStatus.pendingAnalyses
    }
  }, [enableMLFeatures, cacheResults])

  // React Query hook for single file analysis
  const useFileAnalysis = useCallback((file: File | null) => {
    const queryKey = file 
      ? ['audio-analysis', user?.id || 'guest', file.name, file.size, file.lastModified]
      : ['audio-analysis', 'empty']
    
    return useAnalysisQuery(file, queryKey)
  }, [user?.id, useAnalysisQuery])

  return {
    // Analysis functions
    analyzeFile,
    analyzeMultipleFiles,
    cancelAnalysis,
    
    // Cache management
    clearCache,
    getCachedAnalysis,
    prefetchAnalysis,
    
    // React Query hook
    useFileAnalysis,
    
    // State and capabilities
    analysisState,
    getCapabilities,
    
    // Worker management
    terminateWorker: () => audioWorkerManager.terminateWorker(),
    getWorkerStatus: () => audioWorkerManager.getWorkerStatus()
  }
}

// Hook for project-specific enhanced analysis
export function useProjectAudioAnalysis(projectId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  return useQuery({
    queryKey: ['project-audio-analysis', user?.id, projectId],
    queryFn: async () => {
      // This would integrate with your existing project system
      // to get audio analysis for a specific project
      return null
    },
    enabled: !!user && !!projectId,
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false
  })
}

// Hook for audio similarity matching
export function useAudioSimilarity() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const findSimilarAudio = useCallback(async (
    targetAnalysis: EnhancedAudioAnalysis,
    candidateFiles: File[]
  ) => {
    const similarities: Array<{
      file: File
      similarity: number
      analysis: EnhancedAudioAnalysis
      matchingFeatures: string[]
    }> = []

    for (const file of candidateFiles) {
      try {
        const analysis = await audioWorkerManager.analyzeAudioEnhancedWithCache(file, {
          useCache: true
        })
        
        // Calculate similarity based on audio fingerprint
        const similarity = calculateAudioSimilarity(targetAnalysis, analysis)
        const matchingFeatures = getMatchingFeatures(targetAnalysis, analysis)
        
        similarities.push({
          file,
          similarity,
          analysis,
          matchingFeatures
        })
      } catch (error) {
        console.warn(`Failed to analyze ${file.name} for similarity:`, error)
      }
    }

    // Sort by similarity (highest first)
    return similarities.sort((a, b) => b.similarity - a.similarity)
  }, [])

  return { findSimilarAudio }
}

// Helper functions
function calculateAudioSimilarity(
  analysis1: EnhancedAudioAnalysis,
  analysis2: EnhancedAudioAnalysis
): number {
  let similarity = 0
  let features = 0

  // Compare basic features
  if (Math.abs(analysis1.bpm - analysis2.bpm) < 10) {
    similarity += 0.2
  }
  features += 0.2

  if (analysis1.key === analysis2.key) {
    similarity += 0.15
  }
  features += 0.15

  // Compare genre
  if (analysis1.genre && analysis2.genre) {
    if (analysis1.genre.primary === analysis2.genre.primary) {
      similarity += 0.25
    }
    features += 0.25
  }

  // Compare energy and danceability
  const energyDiff = Math.abs(analysis1.energy - analysis2.energy) / 100
  similarity += (1 - energyDiff) * 0.2
  features += 0.2

  const danceabilityDiff = Math.abs(analysis1.danceability - analysis2.danceability) / 100
  similarity += (1 - danceabilityDiff) * 0.2
  features += 0.2

  return features > 0 ? similarity / features : 0
}

function getMatchingFeatures(
  analysis1: EnhancedAudioAnalysis,
  analysis2: EnhancedAudioAnalysis
): string[] {
  const matches: string[] = []

  if (Math.abs(analysis1.bpm - analysis2.bpm) < 5) {
    matches.push('BPM')
  }
  
  if (analysis1.key === analysis2.key) {
    matches.push('Key')
  }

  if (analysis1.genre?.primary === analysis2.genre?.primary) {
    matches.push('Genre')
  }

  if (Math.abs(analysis1.energy - analysis2.energy) < 20) {
    matches.push('Energy')
  }

  if (Math.abs(analysis1.danceability - analysis2.danceability) < 20) {
    matches.push('Danceability')
  }

  return matches
}