import { useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'
import { Button } from '../ui/button'
import { analyzeAudio } from '@/lib/audio-analysis'
import { FadeIn } from '../ui/fade-in'
import { cn } from '@/lib/utils'

interface AudioAnalyzerProps {
  onAnalysisComplete: (analysis: {
    bpm: number
    key: string
    mood: string
    energy: number
    danceability: number
  }) => void
  className?: string
}

export function AudioAnalyzer({ onAnalysisComplete, className }: AudioAnalyzerProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const analysis = await analyzeAudio(file)
      onAnalysisComplete(analysis)
    } catch (err) {
      setError('Failed to analyze audio file')
      console.error('Audio analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-center w-full">
        <label
          htmlFor="audio-upload"
          className={cn(
            'flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer',
            'bg-background hover:bg-accent/50 transition-colors',
            'border-border hover:border-primary/50',
            isAnalyzing && 'opacity-50 cursor-not-allowed'
          )}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isAnalyzing ? (
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            ) : (
              <Upload className="w-8 h-8 mb-2 text-muted-foreground" />
            )}
            <p className="mb-1 text-sm text-muted-foreground">
              {isAnalyzing ? 'Analyzing...' : 'Click to upload audio file'}
            </p>
            <p className="text-xs text-muted-foreground">
              MP3, WAV, or OGG (MAX. 10MB)
            </p>
          </div>
          <input
            id="audio-upload"
            type="file"
            className="hidden"
            accept="audio/*"
            onChange={handleFileUpload}
            disabled={isAnalyzing}
          />
        </label>
      </div>

      {error && (
        <FadeIn>
          <p className="text-sm text-red-500 text-center">{error}</p>
        </FadeIn>
      )}
    </div>
  )
} 