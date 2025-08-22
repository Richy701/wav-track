// Enhanced Audio Visualizer with ML-powered insights
// Real-time visualization of audio analysis results using existing design system

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Play, 
  Pause, 
  Music, 
  Activity, 
  BarChart3, 
  Heart,
  Zap,
  Waves,
  Brain,
  Palette
} from 'lucide-react'
import { EnhancedAudioAnalysis } from '@/lib/audio-worker-manager'

interface EnhancedAudioVisualizerProps {
  audioFile?: File
  analysis?: EnhancedAudioAnalysis
  isPlaying?: boolean
  currentTime?: number
  duration?: number
  onPlayPause?: () => void
  onSeek?: (time: number) => void
  className?: string
}

export function EnhancedAudioVisualizer({
  audioFile,
  analysis,
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  onPlayPause,
  onSeek,
  className = ''
}: EnhancedAudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const audioContextRef = useRef<AudioContext>()
  const analyserRef = useRef<AnalyserNode>()
  const [visualizerType, setVisualizerType] = useState<'waveform' | 'spectrum' | 'spectrogram' | 'emotion'>('waveform')
  const [dimensions, setDimensions] = useState({ width: 800, height: 400 })

  // Initialize audio context and analyser
  useEffect(() => {
    if (!audioFile || typeof window === 'undefined') return

    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 2048
        
        // Load audio for real-time analysis
        const arrayBuffer = await audioFile.arrayBuffer()
        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
        
        // Start visualization
        startVisualization()
      } catch (error) {
        console.error('Failed to initialize audio context:', error)
      }
    }

    initAudio()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (audioContextRef.current) {
        audioContextRef.current.close()
      }
    }
  }, [audioFile])

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      setDimensions({
        width: rect.width || 800,
        height: rect.height || 400
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const startVisualization = useCallback(() => {
    if (!canvasRef.current || !analyserRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = dimensions.width
    canvas.height = dimensions.height

    const draw = () => {
      if (!analyserRef.current || !ctx) return

      const bufferLength = analyserRef.current.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      
      analyserRef.current.getByteFrequencyData(dataArray)

      // Clear canvas
      ctx.fillStyle = 'rgb(15, 15, 15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw based on visualizer type
      switch (visualizerType) {
        case 'waveform':
          drawWaveform(ctx, dataArray, canvas.width, canvas.height)
          break
        case 'spectrum':
          drawSpectrum(ctx, dataArray, canvas.width, canvas.height)
          break
        case 'spectrogram':
          drawSpectrogram(ctx, dataArray, canvas.width, canvas.height)
          break
        case 'emotion':
          drawEmotionalVisualization(ctx, analysis, canvas.width, canvas.height)
          break
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()
  }, [visualizerType, dimensions, analysis])

  // Visualization drawing functions
  const drawWaveform = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    ctx.lineWidth = 2
    ctx.strokeStyle = '#3b82f6'
    ctx.beginPath()

    const sliceWidth = width / dataArray.length
    let x = 0

    for (let i = 0; i < dataArray.length; i++) {
      const v = dataArray[i] / 128.0
      const y = (v * height) / 2

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      x += sliceWidth
    }

    ctx.stroke()

    // Add AI insights overlay
    if (analysis) {
      drawInsightsOverlay(ctx, analysis, width, height)
    }
  }

  const drawSpectrum = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    const barWidth = width / dataArray.length
    let x = 0

    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * height

      // Color based on frequency
      const hue = (i / dataArray.length) * 360
      ctx.fillStyle = `hsl(${hue}, 70%, 50%)`
      ctx.fillRect(x, height - barHeight, barWidth, barHeight)

      x += barWidth
    }

    // Overlay genre classification
    if (analysis?.genre) {
      drawGenreOverlay(ctx, analysis.genre, width, height)
    }
  }

  const drawSpectrogram = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array, width: number, height: number) => {
    // Shift previous data
    const imageData = ctx.getImageData(1, 0, width - 1, height)
    ctx.putImageData(imageData, 0, 0)

    // Draw new column
    for (let i = 0; i < dataArray.length; i++) {
      const value = dataArray[i]
      const y = (i / dataArray.length) * height
      const intensity = value / 255

      ctx.fillStyle = `hsl(${240 - intensity * 240}, 100%, ${50 + intensity * 50}%)`
      ctx.fillRect(width - 1, y, 1, height / dataArray.length)
    }
  }

  const drawEmotionalVisualization = (
    ctx: CanvasRenderingContext2D, 
    analysis: EnhancedAudioAnalysis | undefined, 
    width: number, 
    height: number
  ) => {
    if (!analysis?.emotional) return

    const { valence, arousal, emotions } = analysis.emotional
    const centerX = width / 2
    const centerY = height / 2

    // Draw valence-arousal space
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(width, centerY)
    ctx.moveTo(centerX, 0)
    ctx.lineTo(centerX, height)
    ctx.stroke()

    // Draw emotional point
    const x = centerX + (valence - 0.5) * width * 0.8
    const y = centerY - (arousal - 0.5) * height * 0.8

    ctx.fillStyle = '#3b82f6'
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, 2 * Math.PI)
    ctx.fill()

    // Draw emotion labels
    emotions.forEach((emotion, index) => {
      const angle = (index / emotions.length) * 2 * Math.PI
      const labelX = centerX + Math.cos(angle) * 100
      const labelY = centerY + Math.sin(angle) * 100

      ctx.fillStyle = `hsl(${index * 60}, 70%, 50%)`
      ctx.font = '12px sans-serif'
      ctx.fillText(`${emotion.emotion} (${Math.round(emotion.intensity * 100)}%)`, labelX, labelY)
    })
  }

  const drawInsightsOverlay = (ctx: CanvasRenderingContext2D, analysis: EnhancedAudioAnalysis, width: number, height: number) => {
    // Draw key and BPM
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.font = '16px sans-serif'
    ctx.fillText(`Key: ${analysis.key}`, 10, 30)
    ctx.fillText(`BPM: ${analysis.bpm}`, 10, 50)
    
    if (analysis.genre) {
      ctx.fillText(`Genre: ${analysis.genre.primary}`, 10, 70)
      ctx.fillText(`Confidence: ${Math.round(analysis.genre.confidence * 100)}%`, 10, 90)
    }
  }

  const drawGenreOverlay = (ctx: CanvasRenderingContext2D, genre: EnhancedAudioAnalysis['genre'], width: number, height: number) => {
    // Draw genre classification with confidence
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
    ctx.fillRect(width - 200, 10, 180, 60)
    
    ctx.fillStyle = '#fff'
    ctx.font = '14px sans-serif'
    ctx.fillText(`Primary: ${genre.primary}`, width - 190, 30)
    ctx.fillText(`Secondary: ${genre.secondary}`, width - 190, 45)
    ctx.fillText(`Confidence: ${Math.round(genre.confidence * 100)}%`, width - 190, 60)
  }

  const handleSeek = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek || !duration) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const percentage = x / rect.width
    const seekTime = percentage * duration

    onSeek(seekTime)
  }

  // Restart visualization when type changes
  useEffect(() => {
    if (canvasRef.current) {
      startVisualization()
    }
  }, [startVisualization])

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Control Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPlayPause}
            disabled={!audioFile}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          
          <div className="text-sm text-muted-foreground">
            {duration > 0 && (
              <>
                {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
              </>
            )}
          </div>
        </div>

        <Tabs value={visualizerType} onValueChange={(value) => setVisualizerType(value as typeof visualizerType)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="waveform" className="flex items-center space-x-1">
              <Waves className="h-3 w-3" />
              <span className="hidden sm:inline">Wave</span>
            </TabsTrigger>
            <TabsTrigger value="spectrum" className="flex items-center space-x-1">
              <BarChart3 className="h-3 w-3" />
              <span className="hidden sm:inline">Spectrum</span>
            </TabsTrigger>
            <TabsTrigger value="spectrogram" className="flex items-center space-x-1">
              <Activity className="h-3 w-3" />
              <span className="hidden sm:inline">Spectro</span>
            </TabsTrigger>
            <TabsTrigger value="emotion" className="flex items-center space-x-1">
              <Heart className="h-3 w-3" />
              <span className="hidden sm:inline">Emotion</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Visualization Canvas */}
      <Card>
        <CardContent className="p-0">
          <canvas
            ref={canvasRef}
            className="w-full h-64 cursor-pointer bg-black rounded-lg"
            onClick={handleSeek}
          />
          
          {/* Progress Bar Overlay */}
          {duration > 0 && (
            <div className="absolute bottom-2 left-2 right-2">
              <Progress 
                value={(currentTime / duration) * 100} 
                className="h-1 bg-opacity-50"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Analysis Results */}
      <AnimatePresence>
        {analysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {/* Genre Analysis */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Music className="h-4 w-4" />
                  <span>Genre Classification</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="default">{analysis.genre.primary}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {Math.round(analysis.genre.confidence * 100)}%
                  </span>
                </div>
                <div className="text-xs text-muted-foreground">
                  Secondary: {analysis.genre.secondary}
                </div>
                {analysis.genre.subgenres.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {analysis.genre.subgenres.map((subgenre, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {subgenre}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Emotional Analysis */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Heart className="h-4 w-4" />
                  <span>Emotional Content</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Valence</span>
                    <span>{Math.round(analysis.emotional.valence * 100)}%</span>
                  </div>
                  <Progress value={analysis.emotional.valence * 100} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Arousal</span>
                    <span>{Math.round(analysis.emotional.arousal * 100)}%</span>
                  </div>
                  <Progress value={analysis.emotional.arousal * 100} className="h-2" />
                </div>
                {analysis.emotional.emotions.length > 0 && (
                  <div className="text-xs">
                    <span className="font-medium">Top emotion:</span>{' '}
                    {analysis.emotional.emotions[0].emotion}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Technical Metrics */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Zap className="h-4 w-4" />
                  <span>Technical Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">BPM:</span>{' '}
                    <span className="font-medium">{analysis.bpm}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Key:</span>{' '}
                    <span className="font-medium">{analysis.key}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Energy:</span>{' '}
                    <span className="font-medium">{analysis.energy}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dance:</span>{' '}
                    <span className="font-medium">{analysis.danceability}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">LUFS:</span>{' '}
                    <span className="font-medium">{Math.round(analysis.technical.loudnessLUFS)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Peak:</span>{' '}
                    <span className="font-medium">{Math.round(analysis.technical.peakFrequency)}Hz</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Harmonic Analysis */}
            {analysis.harmony.chordProgression.length > 0 && (
              <Card className="md:col-span-2 lg:col-span-1">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    <Palette className="h-4 w-4" />
                    <span>Harmonic Analysis</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="text-xs">
                    <span className="text-muted-foreground">Chords:</span>{' '}
                    <span className="font-medium">
                      {analysis.harmony.chordProgression.slice(0, 4).join(' - ')}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-muted-foreground">Complexity:</span>{' '}
                    <span className="font-medium">
                      {Math.round(analysis.harmony.harmonicComplexity * 100)}%
                    </span>
                  </div>
                  {analysis.harmony.keyChanges.length > 0 && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Key changes:</span>{' '}
                      <span className="font-medium">{analysis.harmony.keyChanges.length}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Rhythm Analysis */}
            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Activity className="h-4 w-4" />
                  <span>Rhythm Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Time:</span>{' '}
                    <span className="font-medium">{analysis.rhythm.timeSignature}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Groove:</span>{' '}
                    <span className="font-medium">{analysis.rhythm.groovePattern}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Complexity:</span>{' '}
                    <span className="font-medium">{Math.round(analysis.rhythm.rhythmComplexity * 100)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Onsets:</span>{' '}
                    <span className="font-medium">{analysis.rhythm.onsets.length}</span>
                  </div>
                </div>
                {analysis.rhythm.polyrhythm && (
                  <Badge variant="secondary" className="text-xs">
                    Polyrhythmic
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Audio Fingerprint */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-sm">
                  <Brain className="h-4 w-4" />
                  <span>Audio Fingerprint</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-xs space-y-1">
                  <div>
                    <span className="text-muted-foreground">Spectral Centroid:</span>{' '}
                    <span className="font-medium">{Math.round(analysis.audioFingerprint.spectralCentroid)}Hz</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Zero Crossing Rate:</span>{' '}
                    <span className="font-medium">{Math.round(analysis.audioFingerprint.zeroCrossingRate * 1000)}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">MFCC Features:</span>{' '}
                    <span className="font-medium">{analysis.audioFingerprint.mfcc.length} coefficients</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}