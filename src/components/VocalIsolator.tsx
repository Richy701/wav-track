
import { useState, useRef, ChangeEvent } from 'react';
import { Upload, Play, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AudioProcessingState, StemType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function VocalIsolator() {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState<AudioProcessingState>({
    isProcessing: false,
    progress: 0,
  });
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle file selection
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type.startsWith('audio/')) {
        setFile(selectedFile);
        // Reset processing state
        setProcessing({
          isProcessing: false,
          progress: 0,
          result: undefined
        });
        toast({
          title: "File selected",
          description: `Selected ${selectedFile.name}`,
        });
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select an audio file (mp3, wav, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Simulate processing (in a real app, this would call an API)
  const processAudio = () => {
    if (!file) return;
    
    setProcessing({
      isProcessing: true,
      progress: 0
    });

    // Simulate processing with progress updates
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      setProcessing(prev => ({
        ...prev,
        progress: progress
      }));

      if (progress >= 100) {
        clearInterval(interval);
        // Simulate finished processing with results
        setProcessing({
          isProcessing: false,
          progress: 100,
          result: {
            vocals: URL.createObjectURL(file),
            instrumental: URL.createObjectURL(file),
            bass: URL.createObjectURL(file),
            drums: URL.createObjectURL(file)
          }
        });
        toast({
          title: "Processing complete",
          description: "All stems extracted successfully",
        });
      }
    }, 300);
  };

  // Handle playing a stem
  const playStem = (type: StemType) => {
    if (!processing.result || !processing.result[type]) return;
    
    if (audioRef.current) {
      audioRef.current.src = processing.result[type] as string;
      audioRef.current.play();
    }
  };

  // Handle downloading a stem
  const downloadStem = (type: StemType) => {
    if (!processing.result || !processing.result[type]) return;
    
    const link = document.createElement('a');
    link.href = processing.result[type] as string;
    link.download = `${file?.name.split('.')[0]}_${type}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-card rounded-xl overflow-hidden h-full animate-fade-in">
      <div className="p-5 border-b border-border">
        <h3 className="font-medium">Vocal Isolator</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Separate vocals, instrumentals, bass, and drums from your audio files
        </p>
      </div>
      
      <div className="p-6 h-[calc(100%-4rem)] flex flex-col">
        {!file ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div 
              className="border-2 border-dashed border-border rounded-lg p-10 w-full max-w-md text-center cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={handleUploadClick}
            >
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              <h4 className="font-medium mb-2">Upload an audio file</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop or click to select an MP3, WAV, or FLAC file
              </p>
              <Button variant="outline">Select File</Button>
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept="audio/*" 
                onChange={handleFileChange}
              />
            </div>
          </div>
        ) : processing.isProcessing ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin mb-4" />
            <h4 className="font-medium mb-2">Processing your audio...</h4>
            <div className="w-full max-w-md bg-secondary h-2 rounded-full overflow-hidden mb-2">
              <div 
                className="bg-primary h-full transition-all duration-300 ease-out" 
                style={{ width: `${processing.progress}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">{processing.progress}% complete</p>
          </div>
        ) : processing.result ? (
          <div className="flex-1 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-medium">{file.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <Button variant="outline" onClick={handleUploadClick}>
                Change File
              </Button>
            </div>

            <Tabs defaultValue="vocals" className="flex-1 flex flex-col">
              <TabsList className="mx-auto mb-6">
                <TabsTrigger value="vocals">Vocals</TabsTrigger>
                <TabsTrigger value="instrumental">Instrumental</TabsTrigger>
                <TabsTrigger value="bass">Bass</TabsTrigger>
                <TabsTrigger value="drums">Drums</TabsTrigger>
              </TabsList>
              
              {['vocals', 'instrumental', 'bass', 'drums'].map((stem) => (
                <TabsContent key={stem} value={stem} className="flex-1 flex flex-col space-y-6 data-[state=active]:flex data-[state=inactive]:hidden">
                  <div className="bg-secondary/50 rounded-lg p-6 flex-1 flex flex-col items-center justify-center">
                    <div className="w-full max-w-md">
                      <div className="bg-background rounded-lg p-4 mb-6">
                        <div className="h-24 w-full bg-secondary/50 rounded mb-2">
                          {/* This would be a waveform in a real implementation */}
                          <div className="h-full w-full flex items-center justify-center">
                            <span className="text-muted-foreground">Waveform visualization</span>
                          </div>
                        </div>
                        <div className="flex justify-center">
                          <Button 
                            className="mx-auto flex items-center gap-2"
                            onClick={() => playStem(stem as StemType)}
                          >
                            <Play size={16} />
                            <span>Play {stem}</span>
                          </Button>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center justify-center gap-2"
                        onClick={() => downloadStem(stem as StemType)}
                      >
                        <Download size={16} />
                        <span>Download {stem} track</span>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            
            {/* Hidden audio element for playback */}
            <audio ref={audioRef} className="hidden" controls />
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="font-medium">{file.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {(file.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <Button variant="outline" onClick={handleUploadClick}>
                Change File
              </Button>
            </div>
            
            <div className="bg-secondary/50 rounded-lg p-6 mb-6 flex-1 flex items-center justify-center">
              <div className="text-center">
                <h4 className="font-medium mb-2">Ready to process</h4>
                <p className="text-sm text-muted-foreground mb-6">
                  Clicking process will extract the vocals, instrumental, bass, and drums from your audio file
                </p>
                <Button onClick={processAudio}>Process Audio</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
