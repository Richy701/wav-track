import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Loader2, CheckCircle2, Music2, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { analyzeAudioWithSpotify, updateProjectWithAnalysis } from '@/lib/services/spotifyAnalysis'

interface AudioUploaderProps {
  onUploadComplete: (url: string, fileName: string) => void
  projectId?: string
  className?: string
}

export function AudioUploader({ onUploadComplete, projectId, className }: AudioUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
      lastModified: file.lastModified
    })

    // Validate file type
    if (!file.type.startsWith('audio/')) {
      console.error('Invalid file type:', file.type)
      setError('Please select an audio file')
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      console.error('File too large:', file.size)
      setError('File size must be less than 50MB')
      return
    }

    try {
      setIsUploading(true)
      setError(null)
      setProgress(0)
      setUploadedFile(null)

      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Generate a unique filename with user ID and timestamp
      const fileExt = file.name.split('.').pop()
      const timestamp = Date.now()
      const randomString = Math.random().toString(36).substring(2, 8)
      const fileName = `${user.id}/${timestamp}-${randomString}.${fileExt}`

      console.log('Starting upload to Supabase storage...')

      // Upload to Supabase Storage with progress tracking
      const { error: uploadError, data } = await supabase.storage
        .from('project-audio')
        .upload(fileName, file, {
          contentType: 'audio/mpeg',
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Supabase upload error:', uploadError)
        throw uploadError
      }

      console.log('Upload successful:', data)

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-audio')
        .getPublicUrl(fileName)

      console.log('Public URL generated:', publicUrl)

      if (!publicUrl) {
        throw new Error('Failed to get public URL')
      }

      setUploadedFile(file.name)
      onUploadComplete(publicUrl, file.name)

      // If we have a project ID, trigger audio analysis
      if (projectId) {
        setIsAnalyzing(true)
        try {
          console.log('Starting audio analysis...')
          const analysis = await analyzeAudioWithSpotify(publicUrl)
          console.log('Analysis complete:', analysis)
          
          // Update the project with both the audio URL and analysis results
          const { error: updateError } = await supabase
            .from('projects')
            .update({
              audio_url: publicUrl,
              audio_filename: file.name,
              bpm: analysis.bpm,
              key: `${analysis.key} ${analysis.mode}`,
              audio_analyzed: analysis.analyzed,
              audio_duration: analysis.duration,
              audio_loudness: analysis.loudness,
              last_modified: new Date().toISOString(),
            })
            .eq('id', projectId)

          if (updateError) {
            console.error('Failed to update project with audio URL:', updateError)
            throw updateError
          }
          
          if (analysis.analyzed) {
            toast.success('Audio analysis complete', {
              description: `BPM: ${analysis.bpm} • Key: ${analysis.key} ${analysis.mode} • Time: ${analysis.timeSignature}/4`,
            })
          } else {
            toast.warning('Audio analysis not available', {
              description: 'The audio file could not be analyzed at this time.',
            })
          }
        } catch (error) {
          console.error('Analysis error:', error)
          const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
          toast.error('Audio analysis failed', {
            description: `Error: ${errorMessage}`,
          })
        } finally {
          setIsAnalyzing(false)
        }
      }

      toast.success('Audio file uploaded successfully', {
        description: 'Your audio file has been uploaded and is ready for analysis.',
      })
    } catch (err) {
      console.error('Upload error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file'
      setError(errorMessage)
      toast.error('Upload failed', {
        description: `Error: ${errorMessage}`,
      })
    } finally {
      setIsUploading(false)
      setProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <Label htmlFor="audio-upload" className="text-sm font-medium">
        Upload Audio File
      </Label>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-4">
          <Input
            id="audio-upload"
            type="file"
            accept="audio/mpeg"
            onChange={handleFileChange}
            disabled={isUploading || isAnalyzing}
            ref={fileInputRef}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isAnalyzing}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : isAnalyzing ? (
              <>
                <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Choose MP3 File
              </>
            )}
          </Button>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  )
} 