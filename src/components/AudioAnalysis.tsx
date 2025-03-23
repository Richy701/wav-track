import { useState } from 'react'
import { Waveform, Music, Activity } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from './ui/button'
import { Card } from './ui/card'
import { Progress } from './ui/progress'
import { analyzeAudio, AudioAnalysisResult } from '@/lib/audioAnalysis'
import { cn } from '@/lib/utils'

interface AudioAnalysisProps {
  audioBuffer?: AudioBuffer
  className?: string
}

export function AudioAnalysis({ audioBuffer, className }: AudioAnalysisProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AudioAnalysisResult | null>(null)

  const handleAnalyze = async () => {
    if (!audioBuffer) {
      toast.error('No audio file loaded')
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await analyzeAudio(audioBuffer)
      setAnalysisResult(result)
      toast.success('Audio analysis complete')
    } catch (error) {
      console.error('Analysis failed:', error)
      toast.error('Failed to analyze audio', {
        description: 'Please try again or use a different file',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          <h3 className="text-sm font-medium">Audio Analysis</h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleAnalyze}
          disabled={!audioBuffer || isAnalyzing}
        >
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>

      {isAnalyzing && (
        <div className="space-y-2 mb-4">
          <p className="text-sm text-muted-foreground">Analyzing audio features...</p>
          <Progress value={100} className="animate-progress" />
        </div>
      )}

      {analysisResult && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Waveform className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">BPM</span>
              </div>
              <p className="text-2xl font-bold">{analysisResult.bpm}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Key</span>
              </div>
              <p className="text-2xl font-bold">
                {analysisResult.key}
                {analysisResult.scale === 'minor' ? 'm' : ''}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Danceability</label>
              <Progress value={analysisResult.danceability * 100} />
              <p className="text-xs text-muted-foreground text-right">
                {Math.round(analysisResult.danceability * 100)}%
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Energy</label>
              <Progress value={analysisResult.energy * 100} />
              <p className="text-xs text-muted-foreground text-right">
                {Math.round(analysisResult.energy * 100)}%
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Loudness</label>
              <Progress value={Math.min(100, Math.max(0, (analysisResult.loudness + 60) * 1.67))} />
              <p className="text-xs text-muted-foreground text-right">
                {analysisResult.loudness.toFixed(1)} dB
              </p>
            </div>
          </div>
        </div>
      )}

      {!analysisResult && !isAnalyzing && (
        <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
          <Activity className="h-8 w-8 mb-4 animate-pulse" />
          <p className="text-sm">Click analyze to extract audio features</p>
        </div>
      )}
    </Card>
  )
}
