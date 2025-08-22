// Web Worker Manager for Audio Analysis
// Manages worker lifecycle and provides clean API for audio processing

interface EnhancedAudioAnalysis {
  // Basic analysis (backward compatibility)
  bpm: number
  key: string
  mood: string
  energy: number
  danceability: number
  
  // Enhanced AI features
  genre: {
    primary: string
    secondary: string
    confidence: number
    subgenres: string[]
  }
  harmony: {
    chordProgression: string[]
    harmonicComplexity: number
    keyChanges: { time: number; key: string }[]
    modalInterchange: boolean
  }
  rhythm: {
    timeSignature: string
    polyrhythm: boolean
    groovePattern: string
    rhythmComplexity: number
    onsets: number[]
  }
  audioFingerprint: {
    mfcc: number[]
    spectralCentroid: number
    spectralRolloff: number
    zeroCrossingRate: number
    chroma: number[]
  }
  emotional: {
    valence: number
    arousal: number
    dominance: number
    emotions: { emotion: string; intensity: number }[]
  }
  technical: {
    dynamicRange: number
    loudnessLUFS: number
    peakFrequency: number
    harmonicToNoiseRatio: number
    spectralCrest: number
  }
}

class AudioWorkerManager {
  private worker: Worker | null = null
  private processingQueue: Map<string, {
    resolve: (value: EnhancedAudioAnalysis) => void
    reject: (error: Error) => void
    timeout: number
  }> = new Map()

  private initWorker(): void {
    if (this.worker) return

    try {
      // Create worker from the worker file
      this.worker = new Worker(
        new URL('../workers/audio-analysis.worker.ts', import.meta.url),
        { type: 'module' }
      )

      this.worker.onmessage = (event) => {
        const { type, result, error } = event.data

        if (type === 'ANALYSIS_COMPLETE') {
          // Find and resolve the corresponding promise
          const firstPending = this.processingQueue.keys().next().value
          if (firstPending) {
            const { resolve, timeout } = this.processingQueue.get(firstPending)!
            clearTimeout(timeout)
            this.processingQueue.delete(firstPending)
            resolve(result)
          }
        } else if (type === 'ANALYSIS_ERROR') {
          // Find and reject the corresponding promise
          const firstPending = this.processingQueue.keys().next().value
          if (firstPending) {
            const { reject, timeout } = this.processingQueue.get(firstPending)!
            clearTimeout(timeout)
            this.processingQueue.delete(firstPending)
            reject(new Error(error))
          }
        }
      }

      this.worker.onerror = (error) => {
        console.error('Audio worker error:', error)
        // Reject all pending promises
        this.processingQueue.forEach(({ reject, timeout }) => {
          clearTimeout(timeout)
          reject(new Error('Worker error: ' + error.message))
        })
        this.processingQueue.clear()
        this.terminateWorker()
      }
    } catch (error) {
      console.error('Failed to create audio worker:', error)
      this.worker = null
    }
  }

  async analyzeAudioWithWorker(audioBuffer: AudioBuffer): Promise<EnhancedAudioAnalysis> {
    return new Promise((resolve, reject) => {
      // Fall back to main thread if worker initialization fails
      if (!this.supportsWorkers()) {
        reject(new Error('Web Workers not supported - falling back to main thread'))
        return
      }

      this.initWorker()

      if (!this.worker) {
        reject(new Error('Failed to initialize audio worker'))
        return
      }

      // Generate unique ID for this analysis
      const analysisId = `analysis_${Date.now()}_${Math.random()}`

      // Set up timeout (30 seconds)
      const timeout = window.setTimeout(() => {
        this.processingQueue.delete(analysisId)
        reject(new Error('Audio analysis timeout'))
      }, 30000)

      // Store promise handlers
      this.processingQueue.set(analysisId, { resolve, reject, timeout })

      // Send audio data to worker
      try {
        const channelData = audioBuffer.getChannelData(0)
        
        // Transfer the audio buffer to worker
        this.worker.postMessage({
          type: 'ANALYZE_AUDIO',
          audioBuffer: {
            channelData: channelData, // Will be transferred
            sampleRate: audioBuffer.sampleRate,
            length: audioBuffer.length
          }
        }, [channelData.buffer])
        
      } catch (error) {
        clearTimeout(timeout)
        this.processingQueue.delete(analysisId)
        reject(new Error('Failed to send data to worker: ' + error))
      }
    })
  }

  // Enhanced analysis with progressive loading and caching
  async analyzeAudioEnhancedWithCache(
    file: File,
    options: {
      useCache?: boolean
      progressCallback?: (progress: number) => void
    } = {}
  ): Promise<EnhancedAudioAnalysis> {
    const { useCache = true, progressCallback } = options

    // Check cache first
    if (useCache) {
      const cached = await this.getCachedAnalysis(file)
      if (cached) {
        progressCallback?.(100)
        return cached
      }
    }

    progressCallback?.(10)

    try {
      // Load and decode audio
      const audioBuffer = await this.loadAudioFile(file, (progress) => {
        progressCallback?.(10 + progress * 0.3) // 10-40%
      })

      progressCallback?.(40)

      // Perform analysis
      let analysis: EnhancedAudioAnalysis

      try {
        // Try worker-based analysis first
        analysis = await this.analyzeAudioWithWorker(audioBuffer)
        progressCallback?.(90)
      } catch (workerError) {
        console.warn('Worker analysis failed, falling back to main thread:', workerError)
        
        // Fall back to main thread analysis
        const { analyzeAudioEnhanced } = await import('./audio-analysis')
        const blob = new Blob([await file.arrayBuffer()], { type: file.type })
        const fallbackFile = new File([blob], file.name, { type: file.type })
        analysis = await analyzeAudioEnhanced(fallbackFile)
        progressCallback?.(90)
      }

      // Cache the result
      if (useCache) {
        await this.cacheAnalysis(file, analysis)
      }

      progressCallback?.(100)
      return analysis

    } catch (error) {
      throw new Error(`Audio analysis failed: ${error}`)
    }
  }

  private async loadAudioFile(
    file: File,
    progressCallback?: (progress: number) => void
  ): Promise<AudioBuffer> {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          progressCallback?.(Math.round((event.loaded / event.total) * 100))
        }
      }

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          resolve(audioBuffer)
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('Failed to read audio file'))
      reader.readAsArrayBuffer(file)
    })
  }

  private async getCachedAnalysis(file: File): Promise<EnhancedAudioAnalysis | null> {
    try {
      if (!('indexedDB' in window)) return null

      const fileHash = await this.calculateFileHash(file)
      const cached = localStorage.getItem(`audio_analysis_${fileHash}`)
      
      if (cached) {
        const parsed = JSON.parse(cached)
        // Check if cache is still valid (24 hours)
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          return parsed.analysis
        } else {
          localStorage.removeItem(`audio_analysis_${fileHash}`)
        }
      }
    } catch (error) {
      console.warn('Cache retrieval failed:', error)
    }

    return null
  }

  private async cacheAnalysis(file: File, analysis: EnhancedAudioAnalysis): Promise<void> {
    try {
      if (!('indexedDB' in window)) return

      const fileHash = await this.calculateFileHash(file)
      const cacheData = {
        analysis,
        timestamp: Date.now()
      }

      localStorage.setItem(`audio_analysis_${fileHash}`, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('Cache storage failed:', error)
    }
  }

  private async calculateFileHash(file: File): Promise<string> {
    // Simple hash based on file properties
    const data = `${file.name}_${file.size}_${file.lastModified}`
    
    if ('crypto' in window && 'subtle' in window.crypto) {
      const encoder = new TextEncoder()
      const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data))
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } else {
      // Fallback simple hash
      let hash = 0
      for (let i = 0; i < data.length; i++) {
        const char = data.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
      }
      return hash.toString(16)
    }
  }

  private supportsWorkers(): boolean {
    return typeof Worker !== 'undefined'
  }

  terminateWorker(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    
    // Clear pending operations
    this.processingQueue.forEach(({ reject, timeout }) => {
      clearTimeout(timeout)
      reject(new Error('Worker terminated'))
    })
    this.processingQueue.clear()
  }

  // Get worker status for debugging
  getWorkerStatus(): {
    isActive: boolean
    pendingAnalyses: number
    supportsBrowserWorkers: boolean
  } {
    return {
      isActive: this.worker !== null,
      pendingAnalyses: this.processingQueue.size,
      supportsBrowserWorkers: this.supportsWorkers()
    }
  }

  // Batch analysis for multiple files
  async analyzeMultipleFiles(
    files: File[],
    progressCallback?: (fileIndex: number, fileProgress: number, overallProgress: number) => void
  ): Promise<{ file: File; analysis: EnhancedAudioAnalysis; error?: Error }[]> {
    const results: { file: File; analysis: EnhancedAudioAnalysis; error?: Error }[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      try {
        const analysis = await this.analyzeAudioEnhancedWithCache(file, {
          useCache: true,
          progressCallback: (fileProgress) => {
            const overallProgress = ((i / files.length) * 100) + ((fileProgress / 100) * (100 / files.length))
            progressCallback?.(i, fileProgress, overallProgress)
          }
        })

        results.push({ file, analysis })
      } catch (error) {
        results.push({ 
          file, 
          analysis: {} as EnhancedAudioAnalysis, 
          error: error instanceof Error ? error : new Error(String(error))
        })
      }
    }

    return results
  }
}

// Export singleton instance
export const audioWorkerManager = new AudioWorkerManager()

// Clean up worker on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    audioWorkerManager.terminateWorker()
  })
}

export type { EnhancedAudioAnalysis }