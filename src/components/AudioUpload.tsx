import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Music, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AudioUploadProps {
  onAudioUpload: (file: File) => void;
  onAudioRemove: () => void;
  className?: string;
  currentFile?: File | null;
}

export function AudioUpload({ onAudioUpload, onAudioRemove, className, currentFile }: AudioUploadProps) {
  const [audioFile, setAudioFile] = useState<File | null>(currentFile || null);
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    
    // Validate file type
    const validTypes = ['audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/aac', 'audio/ogg'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload an audio file (MP3, WAV, AAC, OGG)'
      });
      return;
    }
    
    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      toast.error('File too large', {
        description: 'Maximum file size is 50MB'
      });
      return;
    }
    
    setAudioFile(file);
    onAudioUpload(file);
  }, [onAudioUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.aac', '.ogg']
    },
    maxFiles: 1
  });

  const handleRemove = () => {
    setAudioFile(null);
    onAudioRemove();
  };

  return (
    <div className={cn("w-full", className)}>
      {!audioFile ? (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer",
            "hover:border-primary/50 hover:bg-primary/5",
            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Upload className={cn(
              "h-8 w-8 transition-colors",
              isDragActive ? "text-primary" : "text-muted-foreground"
            )} />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isDragActive ? "Drop your audio file here" : "Upload your audio file"}
              </p>
              <p className="text-xs text-muted-foreground">
                MP3, WAV, AAC or OGG (max 50MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/10">
          <div className="p-2 rounded-md bg-primary/10">
            <Music className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{audioFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(audioFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
          <button
            onClick={handleRemove}
            className="p-1 rounded-md hover:bg-primary/10 transition-colors"
            aria-label="Remove audio file"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      )}
    </div>
  );
} 