import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2, Music2, Sparkles } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { analyzeAudioWithSpotify } from '@/lib/services/spotifyAnalysis'
import { FileUpload } from '@/components/ui/file-upload'

interface AudioUploaderProps {
  onUploadComplete: (url: string, fileName: string) => void
  projectId?: string
  className?: string
}

export function AudioUploader({ onUploadComplete, projectId, className }: AudioUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentFile, setCurrentFile] = useState<string | null>(null)

  const handleFileChange = async (files: File[]) => {
    // If files is empty, it means the file was deleted
    if (files.length === 0) {
      if (currentFile && projectId) {
        try {
          // Delete from Supabase storage
          const { error: deleteError } = await supabase.storage
            .from('project-audio')
            .remove([currentFile])

          if (deleteError) {
            console.error('Error deleting file:', deleteError)
            toast.error('Failed to delete file', {
              description: 'The file could not be deleted from storage.'
            })
            return
          }

          // Update project to remove audio URL
          if (projectId) {
            const { error: updateError } = await supabase
              .from('projects')
              .update({
                audio_url: null,
                audio_filename: null,
                audio_analyzed: false,
                audio_duration: null,
                audio_loudness: null,
                last_modified: new Date().toISOString(),
              })
              .eq('id', projectId)

            if (updateError) {
              console.error('Failed to update project:', updateError)
              toast.error('Failed to update project', {
                description: 'The project could not be updated.'
              })
              return
            }
          }

          setCurrentFile(null)
          onUploadComplete('', '')
          toast.success('File deleted successfully')
        } catch (error) {
          console.error('Error during file deletion:', error)
          toast.error('Failed to delete file', {
            description: 'An unexpected error occurred.'
          })
        }
      }
      return
    }

    const file = files[0]
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
      toast.error('Invalid file type', {
        description: 'Please select an audio file'
      })
      return
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      console.error('File too large:', file.size)
      setError('File size must be less than 50MB')
      toast.error('File too large', {
        description: 'File size must be less than 50MB'
      })
      return
    }

    try {
      setIsUploading(true)
      setError(null)

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

      // Delete old file if it exists
      if (currentFile) {
        const { error: deleteError } = await supabase.storage
          .from('project-audio')
          .remove([currentFile])

        if (deleteError) {
          console.error('Error deleting old file:', deleteError)
        }
      }

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

      setCurrentFile(fileName)
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
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col gap-2">
        {(isUploading || isAnalyzing) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isUploading && (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading...</span>
              </>
            )}
            {isAnalyzing && (
              <>
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>Analyzing audio...</span>
              </>
            )}
          </div>
        )}
        
        <FileUpload onChange={handleFileChange} />
      </div>
    </div>
  )
} 