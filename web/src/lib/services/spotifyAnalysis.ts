import { supabase } from '@/lib/supabase'

interface AudioAnalysis {
  analyzed: boolean
  bpm: number
  key: string
  mode: string
  timeSignature: number
  duration: number
  energy: number
  danceability: number
  valence: number
  acousticness: number
  instrumentalness: number
  liveness: number
  speechiness: number
  loudness: number
  tempo: number
  keyConfidence: number
  modeConfidence: number
  timeSignatureConfidence: number
  tempoConfidence: number
}

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET

let accessToken: string | null = null

async function getSpotifyToken(): Promise<string> {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    throw new Error('Spotify credentials not configured')
  }

  if (accessToken) return accessToken

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      console.error('Failed to get Spotify token:', {
        status: response.status,
        statusText: response.statusText,
      })
      throw new Error(`Failed to get Spotify token: ${response.statusText}`)
    }

    const data = await response.json()
    accessToken = data.access_token
    return accessToken
  } catch (error) {
    console.error('Error getting Spotify token:', error)
    throw error
  }
}

function getKeyFromPitchClass(pitchClass: number): string {
  const keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  return keys[pitchClass] || 'Unknown'
}

export async function analyzeAudioWithSpotify(audioUrl: string): Promise<AudioAnalysis> {
  console.log('Starting audio analysis for URL:', audioUrl)
  
  try {
    // Download the audio file
    console.log('Downloading audio file...')
    const response = await fetch(audioUrl)
    if (!response.ok) {
      console.error('Failed to download audio file:', response.status, response.statusText)
      throw new Error('Failed to download audio file')
    }
    const audioBlob = await response.blob()
    console.log('Audio file downloaded, size:', audioBlob.size)

    // Create a temporary audio element to get duration
    const audio = new Audio(URL.createObjectURL(audioBlob))
    const duration = await new Promise<number>((resolve) => {
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration)
      })
    })

    // Analyze the audio using Web Audio API
    const audioContext = new AudioContext()
    const arrayBuffer = await audioBlob.arrayBuffer()
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
    
    // Calculate basic audio features
    const channelData = audioBuffer.getChannelData(0)
    const rms = Math.sqrt(channelData.reduce((acc, val) => acc + val * val, 0) / channelData.length)
    const loudness = 20 * Math.log10(rms)

    // Calculate energy peaks for BPM detection
    const sampleRate = audioBuffer.sampleRate
    const blockSize = Math.floor(sampleRate * 0.1) // 100ms blocks
    const blocks = Math.floor(channelData.length / blockSize)
    const energyBlocks = new Float32Array(blocks)

    // Calculate energy for each block
    for (let i = 0; i < blocks; i++) {
      let blockEnergy = 0
      for (let j = 0; j < blockSize; j++) {
        const sample = channelData[i * blockSize + j]
        blockEnergy += sample * sample
      }
      energyBlocks[i] = blockEnergy
    }

    // Find peaks in energy blocks
    const peaks: number[] = []
    for (let i = 1; i < blocks - 1; i++) {
      if (energyBlocks[i] > energyBlocks[i - 1] && energyBlocks[i] > energyBlocks[i + 1]) {
        peaks.push(i)
      }
    }

    // Calculate average time between peaks
    let totalInterval = 0
    let intervalCount = 0
    for (let i = 1; i < peaks.length; i++) {
      const interval = peaks[i] - peaks[i - 1]
      if (interval > 0) {
        totalInterval += interval
        intervalCount++
      }
    }

    // Calculate BPM from peak intervals
    let estimatedBPM = 120 // Default BPM
    if (intervalCount > 0) {
      const averageInterval = totalInterval / intervalCount
      const secondsPerBeat = (averageInterval * blockSize) / sampleRate
      estimatedBPM = Math.round(60 / secondsPerBeat)
    }

    // Clamp BPM to reasonable range
    estimatedBPM = Math.max(60, Math.min(180, estimatedBPM))

    // Calculate energy based on RMS
    const energy = rms

    // Return the analysis results
    const processedAnalysis: AudioAnalysis = {
      analyzed: true,
      bpm: estimatedBPM,
      key: 'C', // Default key since we can't detect it without more complex analysis
      mode: 'Major', // Default mode
      timeSignature: 4, // Default time signature
      duration: duration,
      energy: energy,
      danceability: 0.5, // Default value
      valence: 0.5, // Default value
      acousticness: 0.5, // Default value
      instrumentalness: 0.5, // Default value
      liveness: 0.5, // Default value
      speechiness: 0.5, // Default value
      loudness: loudness,
      tempo: estimatedBPM,
      keyConfidence: 0.5, // Default value
      modeConfidence: 0.5, // Default value
      timeSignatureConfidence: 0.5, // Default value
      tempoConfidence: 0.5, // Default value
    }

    console.log('Processed analysis:', processedAnalysis)
    return processedAnalysis

  } catch (error) {
    console.error('Audio analysis error:', error)
    throw error
  }
}

export async function updateProjectWithAnalysis(
  projectId: string,
  analysis: AudioAnalysis
): Promise<void> {
  try {
    console.log('Updating project with analysis:', { projectId, analysis })
    const { error } = await supabase
      .from('projects')
      .update({
        bpm: analysis.bpm,
        key: `${analysis.key} ${analysis.mode}`,
        audio_analyzed: analysis.analyzed,
        audio_duration: analysis.duration,
        audio_loudness: analysis.loudness,
        danceability: analysis.danceability,
        energy: analysis.energy,
        valence: analysis.valence,
        acousticness: analysis.acousticness,
        instrumentalness: analysis.instrumentalness,
        speechiness: analysis.speechiness,
        liveness: analysis.liveness,
        last_modified: new Date().toISOString(),
      })
      .eq('id', projectId)

    if (error) {
      console.error('Supabase update error:', error)
      throw error
    }
  } catch (error) {
    console.error('Failed to update project with analysis:', error)
    throw error
  }
} 