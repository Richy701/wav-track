import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { MusicalNoteIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { analyzeAudio, AudioAnalysisResult } from '@/lib/audioAnalysis'
import { getAudioContext } from '@/lib/audioContext'

interface AudioUploadProps {
  onAudioUpload: (file: File) => void
  onAudioRemove: () => void
  onAnalysisComplete?: (result: AudioAnalysisResult) => void
  className?: string
  currentFile?: File | null
}

export function AudioUpload({
  onAudioUpload,
  onAudioRemove,
  onAnalysisComplete,
  className,
  currentFile,
}: AudioUploadProps) {
  const [audioFile, setAudioFile] = useState<File | null>(currentFile || null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const analyzeAudioFile = async (file: File) => {
    try {
      setIsAnalyzing(true)
      const ctx = getAudioContext()
      if (!ctx) {
        throw new Error('Web Audio API is not supported')
      }

      const arrayBuffer = await file.arrayBuffer()
      const buffer = await ctx.decodeAudioData(arrayBuffer)

      const result = await analyzeAudio(buffer)
      onAnalysisComplete?.(result)
    } catch (error) {
      console.error('Failed to analyze audio:', error)
      toast.error('Failed to analyze audio file', {
        description: 'The file may be corrupted or in an unsupported format',
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]

      // Validate file type
      const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/aac', 'audio/ogg']
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type', {
          description: 'Please upload an audio file (MP3, WAV, AAC, OGG)',
        })
        return
      }

      // Validate file size (max 50MB)
      const maxSize = 50 * 1024 * 1024 // 50MB in bytes
      if (file.size > maxSize) {
        toast.error('File too large', {
          description: 'Maximum file size is 50MB',
        })
        return
      }

      setAudioFile(file)
      onAudioUpload(file)
      analyzeAudioFile(file)
    },
    [onAudioUpload, onAnalysisComplete]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.aac', '.ogg'],
    },
    maxFiles: 1,
  })

  const handleRemove = () => {
    setAudioFile(null)
    onAudioRemove()
  }

  return (
    <div className={cn('w-full', className)}>
      {!audioFile ? (
        <div
          {...getRootProps()}
          className={cn(
            'border border-dashed rounded-lg p-2 transition-colors cursor-pointer',
            'hover:border-primary/50 hover:bg-primary/5',
            isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex items-center gap-2 text-center">
            <ArrowUpTrayIcon
              className={cn(
                'h-3 w-3 transition-colors',
                isDragActive ? 'text-primary' : 'text-muted-foreground'
              )}
            />
            <div className="flex-1">
              <p className="text-[10px] font-medium">
                {isDragActive ? 'Drop your audio file here' : 'Upload your audio file'}
              </p>
              <p className="text-[8px] text-muted-foreground">MP3, WAV, AAC or OGG (max 50MB)</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
          <div className="p-1 rounded-md bg-primary/10">
            <MusicalNoteIcon className="h-3 w-3 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-medium truncate">{audioFile.name}</p>
            <p className="text-[8px] text-muted-foreground">
              {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
              {isAnalyzing && ' • Analyzing...'}
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="p-1 rounded-md hover:bg-primary/10 transition-colors"
            aria-label="Remove audio file"
          >
            <XMarkIcon className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  )
}
