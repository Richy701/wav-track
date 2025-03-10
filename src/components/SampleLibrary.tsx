
import { useState } from 'react';
import { Heart, Filter, Plus } from 'lucide-react';
import { Sample } from '@/lib/types';
import { cn } from '@/lib/utils';
import AudioWaveform from './AudioWaveform';

interface SampleLibraryProps {
  samples: Sample[];
}

export default function SampleLibrary({ samples }: SampleLibraryProps) {
  const [filter, setFilter] = useState<Sample['type'] | 'all'>('all');
  const [playing, setPlaying] = useState<string | null>(null);
  const [expandedSample, setExpandedSample] = useState<string | null>(null);
  
  const filteredSamples = filter === 'all' 
    ? samples 
    : samples.filter(sample => sample.type === filter);
  
  const togglePlay = (id: string) => {
    if (playing === id) {
      setPlaying(null);
    } else {
      setPlaying(id);
    }
  };
  
  const toggleExpandSample = (id: string) => {
    if (expandedSample === id) {
      setExpandedSample(null);
    } else {
      setExpandedSample(id);
    }
  };
  
  const types: { value: Sample['type'] | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'drum', label: 'Drums' },
    { value: 'bass', label: 'Bass' },
    { value: 'melody', label: 'Melody' },
    { value: 'vocal', label: 'Vocals' },
    { value: 'fx', label: 'FX' },
    { value: 'other', label: 'Other' }
  ];
  
  // Format the date to a more readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Generate a mock audio URL for demo purposes
  const getMockAudioUrl = (id: string, type: Sample['type']) => {
    // In a real app, this would be a real URL to an audio file
    return `https://example.com/audio/${id}-${type}.mp3`;
  };

  return (
    <section className="animate-fade-in theme-transition">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-medium">Sample Library</h2>
        
        <div className="flex items-center space-x-3">
          <div className="bg-card rounded-lg p-1 flex shadow-sm">
            {types.map(type => (
              <button
                key={type.value}
                onClick={() => setFilter(type.value)}
                className={cn(
                  "px-3 py-1 text-sm rounded-md transition-colors",
                  filter === type.value 
                    ? "bg-primary text-white" 
                    : "hover:bg-secondary"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
          
          <button className="bg-card hover:bg-secondary p-2 rounded-lg transition-colors">
            <Filter size={18} />
          </button>
          
          <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
            <Plus size={18} />
            <span>Add Sample</span>
          </button>
        </div>
      </div>
      
      <div className="bg-card rounded-xl overflow-hidden theme-transition">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date Added</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSamples.map(sample => (
                <>
                  <tr 
                    key={sample.id} 
                    className="hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => toggleExpandSample(sample.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            togglePlay(sample.id);
                          }}
                          className="mr-3 h-8 w-8 rounded-full bg-secondary hover:bg-primary/10 flex items-center justify-center transition-colors"
                        >
                          {playing === sample.id ? (
                            <span className="inline-block w-2 h-2 bg-primary rounded-sm"></span>
                          ) : (
                            <span className="inline-block w-0 h-0 border-t-[4px] border-b-[4px] border-l-[6px] border-transparent border-l-current ml-0.5"></span>
                          )}
                        </button>
                        <span className="font-medium">{sample.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary">
                        {sample.type.charAt(0).toUpperCase() + sample.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {sample.source}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {formatDate(sample.dateAdded)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle favorite toggle logic
                        }}
                        className={cn(
                          "transition-colors",
                          sample.favorite ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"
                        )}
                      >
                        <Heart size={18} fill={sample.favorite ? "currentColor" : "none"} />
                      </button>
                    </td>
                  </tr>
                  {expandedSample === sample.id && (
                    <tr className="bg-secondary/20">
                      <td colSpan={5} className="px-6 py-4">
                        <AudioWaveform 
                          audioUrl={getMockAudioUrl(sample.id, sample.type)}
                          id={sample.id}
                          isPlaying={playing === sample.id}
                          onPlayToggle={togglePlay}
                          className="mb-0"
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredSamples.length === 0 && (
          <div className="p-8 text-center">
            <h3 className="text-xl font-medium mb-2">No samples found</h3>
            <p className="text-muted-foreground mb-6">
              {filter === 'all' 
                ? "You haven't added any samples yet." 
                : `You don't have any ${filter} samples.`}
            </p>
            <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto transition-colors">
              <Plus size={18} />
              <span>Add your first sample</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
