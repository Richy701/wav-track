import { supabase } from '@/lib/supabase'

interface AudioAnalysisResult {
  bpm: number
  key: string
  genre?: string
  loudness: number
  duration: number
  analyzed: boolean
}

// Update how we access the environment variable
const AUDD_API_TOKEN = import.meta.env.VITE_AUDD_API_TOKEN

export async function analyzeAudio(audioUrl: string): Promise<AudioAnalysisResult> {
  if (!AUDD_API_TOKEN) {
    throw new Error('Audd.io API token not configured')
  }

  try {
    const response = await fetch(audioUrl)
    const audioBlob = await response.blob()

    const formData = new FormData()
    formData.append('file', audioBlob)
    formData.append('return', 'spotify')
    formData.append('api_token', AUDD_API_TOKEN)

    const auddResponse = await fetch('https://api.audd.io/', {
      method: 'POST',
      body: formData,
    })

    if (!auddResponse.ok) {
      throw new Error(`Audd.io API error: ${auddResponse.statusText}`)
    }

    const data = await auddResponse.json()

    if (!data.status || data.status !== 'success') {
      throw new Error('Audio analysis failed: ' + (data.error?.error_message || 'Unknown error'))
    }

    const result = processAnalysisResult(data)
    return result
  } catch (error) {
    console.error('Audio analysis error:', error)
    throw error
  }
}

export async function updateProjectWithAnalysis(
  projectId: string,
  analysis: AudioAnalysisResult
): Promise<void> {
  try {
    console.log('Updating project with analysis:', { projectId, analysis })
    const { error } = await supabase
      .from('projects')
      .update({
        bpm: analysis.bpm,
        key: analysis.key,
        genre: analysis.genre,
        audio_analyzed: analysis.analyzed,
        audio_duration: analysis.duration,
        audio_loudness: analysis.loudness,
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