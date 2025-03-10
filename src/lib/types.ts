export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'idea' | 'in-progress' | 'mixing' | 'mastering' | 'completed';
  dateCreated: string;
  lastModified: string;
  bpm: number;
  key: string;
  genre: string;
  tags: string[];
  completionPercentage: number;
  audioFile?: {
    name: string;
    size: number;
    type: string;
    url: string;
  } | null;
}

export interface Sample {
  id: string;
  name: string;
  type: 'drum' | 'bass' | 'melody' | 'vocal' | 'fx' | 'other';
  dateAdded: string;
  favorite: boolean;
  source: string;
}

export interface Session {
  id: string;
  projectId: string;
  duration: number; // in minutes
  date: string;
  notes: string;
}

export interface Note {
  id: string;
  projectId?: string;
  title: string;
  content: string;
  dateCreated: string;
  pinned: boolean;
}

export interface BeatActivity {
  id: string;
  projectId: string;
  date: string;
  count: number;
  timestamp?: number;
}

export interface AudioProcessingState {
  isProcessing: boolean;
  progress: number;
  result?: {
    vocals?: string;
    instrumental?: string;
    bass?: string;
    drums?: string;
  };
}

export type StemType = 'vocals' | 'instrumental' | 'bass' | 'drums';
