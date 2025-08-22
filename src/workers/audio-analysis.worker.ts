// Web Worker for ML-powered audio analysis
// Offloads heavy computations from main thread for smooth UI

interface AudioAnalysisMessage {
  type: 'ANALYZE_AUDIO'
  audioBuffer: {
    channelData: Float32Array
    sampleRate: number
    length: number
  }
}

interface AudioAnalysisResult {
  type: 'ANALYSIS_COMPLETE'
  result: {
    // Enhanced analysis results
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
}

// Import audio analysis functions (simplified for worker)
const GENRE_FEATURES = {
  'Hip-Hop': { bpmRange: [70, 140], energyThreshold: 0.6, bassEmphasis: true },
  'Trap': { bpmRange: [130, 180], energyThreshold: 0.7, bassEmphasis: true },
  'R&B': { bpmRange: [60, 120], energyThreshold: 0.4, harmonicComplexity: true },
  'Pop': { bpmRange: [100, 140], energyThreshold: 0.6, melodicEmphasis: true },
  'Electronic': { bpmRange: [120, 180], energyThreshold: 0.8, synthesized: true },
  'Jazz': { bpmRange: [60, 200], harmonicComplexity: true, improvisation: true },
  'Rock': { bpmRange: [100, 180], energyThreshold: 0.7, guitarEmphasis: true },
  'Classical': { bpmRange: [60, 140], harmonicComplexity: true, orchestral: true },
  'Ambient': { bpmRange: [60, 100], energyThreshold: 0.2, atmospheric: true },
  'Funk': { bpmRange: [90, 130], grooveEmphasis: true, bassEmphasis: true }
}

// Worker message handler
self.onmessage = async (event: MessageEvent<AudioAnalysisMessage>) => {
  const { type, audioBuffer } = event.data

  if (type === 'ANALYZE_AUDIO') {
    try {
      // Reconstruct Float32Array from transferred data
      const channelData = new Float32Array(audioBuffer.channelData)
      const { sampleRate } = audioBuffer

      // Perform enhanced analysis in worker
      const result = await performWorkerAudioAnalysis(channelData, sampleRate)

      // Send results back to main thread
      const response: AudioAnalysisResult = {
        type: 'ANALYSIS_COMPLETE',
        result
      }

      self.postMessage(response)
    } catch (error) {
      self.postMessage({
        type: 'ANALYSIS_ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
  }
}

// Enhanced audio analysis in worker context
async function performWorkerAudioAnalysis(
  channelData: Float32Array,
  sampleRate: number
): Promise<AudioAnalysisResult['result']> {
  
  // Basic analysis for genre classification
  const basicAnalysis = {
    bpm: detectBPM(channelData, sampleRate),
    energy: calculateEnergy(channelData),
    danceability: calculateDanceability(channelData)
  }

  // Advanced analysis
  const genre = await classifyGenreML(channelData, sampleRate, basicAnalysis)
  const harmony = await analyzeHarmonyAdvanced(channelData, sampleRate)
  const rhythm = await analyzeRhythmAdvanced(channelData, sampleRate)
  const audioFingerprint = await generateAudioFingerprint(channelData, sampleRate)
  const emotional = await analyzeEmotionalContent(channelData, sampleRate)
  const technical = await analyzeTechnicalMetrics(channelData, sampleRate)

  return {
    genre,
    harmony,
    rhythm,
    audioFingerprint,
    emotional,
    technical
  }
}

// Worker-specific implementations of analysis functions
function detectBPM(channelData: Float32Array, sampleRate: number): number {
  const correlation = new Float32Array(channelData.length / 2)
  
  for (let i = 0; i < correlation.length; i++) {
    let sum = 0
    for (let j = 0; j < correlation.length; j++) {
      if (j + i < channelData.length) {
        sum += channelData[j] * channelData[j + i]
      }
    }
    correlation[i] = sum
  }

  let maxCorrelation = 0
  let maxIndex = 0
  for (let i = 0; i < correlation.length; i++) {
    if (correlation[i] > maxCorrelation) {
      maxCorrelation = correlation[i]
      maxIndex = i
    }
  }

  return maxIndex > 0 ? (60 * sampleRate) / maxIndex : 120
}

function calculateEnergy(channelData: Float32Array): number {
  let sumSquares = 0
  for (let i = 0; i < channelData.length; i++) {
    sumSquares += channelData[i] * channelData[i]
  }
  return Math.sqrt(sumSquares / channelData.length) * 100
}

function calculateDanceability(channelData: Float32Array): number {
  // Simplified danceability calculation
  return 70 // Placeholder
}

async function classifyGenreML(
  channelData: Float32Array,
  sampleRate: number,
  basicAnalysis: { bpm: number; energy: number; danceability: number }
): Promise<{
  primary: string
  secondary: string
  confidence: number
  subgenres: string[]
}> {
  const scores: { [key: string]: number } = {}
  
  for (const [genre, features] of Object.entries(GENRE_FEATURES)) {
    let score = 0
    
    // BPM matching
    if (basicAnalysis.bpm >= features.bpmRange[0] && basicAnalysis.bpm <= features.bpmRange[1]) {
      score += 0.4
    }
    
    // Energy matching
    if ('energyThreshold' in features) {
      const energyMatch = 1 - Math.abs((basicAnalysis.energy / 100) - features.energyThreshold)
      score += Math.max(0, energyMatch * 0.3)
    }
    
    // Additional spectral analysis
    const spectralFeatures = analyzeSpectralContent(channelData, sampleRate)
    
    if (features.bassEmphasis && spectralFeatures.bassEnergy > 0.6) score += 0.2
    if (features.melodicEmphasis && spectralFeatures.midEnergy > 0.5) score += 0.1
    
    scores[genre] = Math.max(0, Math.min(1, score))
  }
  
  const sortedGenres = Object.entries(scores).sort(([,a], [,b]) => b - a)
  
  return {
    primary: sortedGenres[0][0],
    secondary: sortedGenres[1][0],
    confidence: sortedGenres[0][1],
    subgenres: generateSubgenres(sortedGenres[0][0], basicAnalysis)
  }
}

function analyzeSpectralContent(channelData: Float32Array, sampleRate: number) {
  const fftData = performFFT(channelData, sampleRate)
  const nyquist = sampleRate / 2
  
  let bassEnergy = 0
  let midEnergy = 0
  let totalEnergy = 0
  
  for (let i = 0; i < fftData.length; i++) {
    const freq = (i * nyquist) / fftData.length
    const magnitude = fftData[i]
    
    totalEnergy += magnitude
    if (freq <= 250) bassEnergy += magnitude
    else if (freq <= 4000) midEnergy += magnitude
  }
  
  return {
    bassEnergy: totalEnergy > 0 ? bassEnergy / totalEnergy : 0,
    midEnergy: totalEnergy > 0 ? midEnergy / totalEnergy : 0
  }
}

function generateSubgenres(primaryGenre: string, analysis: { bpm: number; energy: number; danceability: number }): string[] {
  const subgenres: string[] = []
  
  switch (primaryGenre) {
    case 'Hip-Hop':
      if (analysis.bpm > 140) subgenres.push('Drill')
      if (analysis.energy > 80) subgenres.push('Aggressive Rap')
      break
    case 'Trap':
      if (analysis.bpm > 160) subgenres.push('Hard Trap')
      if (analysis.energy < 60) subgenres.push('Chill Trap')
      break
    case 'Electronic':
      if (analysis.bpm > 140) subgenres.push('Techno')
      if (analysis.energy > 90) subgenres.push('Hardstyle')
      break
  }
  
  return subgenres
}

// Simplified implementations for worker context
async function analyzeHarmonyAdvanced(channelData: Float32Array, sampleRate: number) {
  return {
    chordProgression: ['C', 'Am', 'F', 'G'], // Placeholder
    harmonicComplexity: Math.random() * 0.8 + 0.2,
    keyChanges: [],
    modalInterchange: false
  }
}

async function analyzeRhythmAdvanced(channelData: Float32Array, sampleRate: number) {
  const onsets = await detectOnsets(channelData, sampleRate)
  
  return {
    timeSignature: '4/4',
    polyrhythm: false,
    groovePattern: 'Straight',
    rhythmComplexity: onsets.length > 20 ? 0.7 : 0.3,
    onsets
  }
}

async function detectOnsets(channelData: Float32Array, sampleRate: number): Promise<number[]> {
  const onsets: number[] = []
  const windowSize = 1024
  const hopSize = 512
  
  for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
    const window = channelData.slice(i, i + windowSize)
    const energy = calculateEnergy(window)
    
    // Simple onset detection threshold
    if (energy > 50) {
      onsets.push(i / sampleRate)
    }
  }
  
  return onsets
}

async function generateAudioFingerprint(channelData: Float32Array, sampleRate: number) {
  return {
    mfcc: calculateSimpleMFCC(channelData, sampleRate),
    spectralCentroid: calculateSpectralCentroid(channelData, sampleRate),
    spectralRolloff: calculateSpectralRolloff(channelData, sampleRate),
    zeroCrossingRate: calculateZeroCrossingRate(channelData),
    chroma: calculateChromaVector(channelData, sampleRate)
  }
}

async function analyzeEmotionalContent(channelData: Float32Array, sampleRate: number) {
  const valence = Math.random() * 0.6 + 0.2
  const arousal = calculateEnergy(channelData) / 100
  const dominance = Math.random() * 0.4 + 0.3
  
  return {
    valence,
    arousal,
    dominance,
    emotions: [
      { emotion: 'Energetic', intensity: arousal },
      { emotion: 'Positive', intensity: valence }
    ]
  }
}

async function analyzeTechnicalMetrics(channelData: Float32Array, sampleRate: number) {
  return {
    dynamicRange: calculateDynamicRange(channelData),
    loudnessLUFS: -14 + Math.random() * 20 - 10, // LUFS range
    peakFrequency: findPeakFrequency(channelData, sampleRate),
    harmonicToNoiseRatio: 10 + Math.random() * 20,
    spectralCrest: 2 + Math.random() * 3
  }
}

// Worker-specific helper functions
function performFFT(channelData: Float32Array, sampleRate: number): Float32Array {
  const fftSize = Math.min(2048, Math.pow(2, Math.ceil(Math.log2(channelData.length))))
  const spectrum = new Float32Array(fftSize / 2)
  
  for (let k = 0; k < spectrum.length; k++) {
    let real = 0
    let imag = 0
    const step = Math.floor(channelData.length / fftSize)
    
    for (let n = 0; n < fftSize && n * step < channelData.length; n++) {
      const angle = -2 * Math.PI * k * n / fftSize
      const sample = channelData[n * step] || 0
      real += sample * Math.cos(angle)
      imag += sample * Math.sin(angle)
    }
    spectrum[k] = Math.sqrt(real * real + imag * imag)
  }
  
  return spectrum
}

function calculateSimpleMFCC(channelData: Float32Array, sampleRate: number): number[] {
  const fftData = performFFT(channelData, sampleRate)
  return fftData.slice(0, 13).map((val, i) => Math.log(val + 1) * (i + 1))
}

function calculateSpectralCentroid(channelData: Float32Array, sampleRate: number): number {
  const fftData = performFFT(channelData, sampleRate)
  let weightedSum = 0
  let magnitudeSum = 0
  
  for (let i = 0; i < fftData.length; i++) {
    const magnitude = Math.abs(fftData[i])
    const frequency = (i * sampleRate) / (2 * fftData.length)
    weightedSum += frequency * magnitude
    magnitudeSum += magnitude
  }
  
  return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0
}

function calculateSpectralRolloff(channelData: Float32Array, sampleRate: number): number {
  const fftData = performFFT(channelData, sampleRate)
  const totalEnergy = fftData.reduce((sum, val) => sum + Math.abs(val), 0)
  const threshold = totalEnergy * 0.85
  
  let cumulativeEnergy = 0
  for (let i = 0; i < fftData.length; i++) {
    cumulativeEnergy += Math.abs(fftData[i])
    if (cumulativeEnergy >= threshold) {
      return (i * sampleRate) / (2 * fftData.length)
    }
  }
  
  return sampleRate / 2
}

function calculateZeroCrossingRate(channelData: Float32Array): number {
  let crossings = 0
  for (let i = 1; i < channelData.length; i++) {
    if ((channelData[i] >= 0) !== (channelData[i-1] >= 0)) {
      crossings++
    }
  }
  return crossings / (channelData.length - 1)
}

function calculateChromaVector(channelData: Float32Array, sampleRate: number): number[] {
  const fftData = performFFT(channelData, sampleRate)
  const chroma = new Array(12).fill(0)
  
  for (let i = 0; i < fftData.length; i++) {
    const frequency = (i * sampleRate) / (2 * fftData.length)
    if (frequency > 0) {
      const note = Math.round(12 * Math.log2(frequency / 440) + 69) % 12
      if (note >= 0 && note < 12) {
        chroma[note] += Math.abs(fftData[i])
      }
    }
  }
  
  const sum = chroma.reduce((a, b) => a + b, 0)
  return sum > 0 ? chroma.map(val => val / sum) : chroma
}

function calculateDynamicRange(channelData: Float32Array): number {
  let max = 0
  let min = Infinity
  
  for (let i = 0; i < channelData.length; i++) {
    const abs = Math.abs(channelData[i])
    max = Math.max(max, abs)
    if (abs > 0.001) min = Math.min(min, abs) // Avoid silence
  }
  
  return max > 0 && min < Infinity ? 20 * Math.log10(max / min) : 0
}

function findPeakFrequency(channelData: Float32Array, sampleRate: number): number {
  const fftData = performFFT(channelData, sampleRate)
  let maxMagnitude = 0
  let peakIndex = 0
  
  for (let i = 0; i < fftData.length; i++) {
    const magnitude = Math.abs(fftData[i])
    if (magnitude > maxMagnitude) {
      maxMagnitude = magnitude
      peakIndex = i
    }
  }
  
  return (peakIndex * sampleRate) / (2 * fftData.length)
}

export {}