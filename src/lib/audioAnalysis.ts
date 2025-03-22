export interface AudioAnalysisResult {
  bpm: number;
  energy: number;
  loudness: number;
  duration: number;
  key: string;
  scale: 'major' | 'minor';
}

// Musical key mapping
const KEY_MAPPING = {
  'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5, 
  'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
};

const KEY_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Helper function to convert frequency to MIDI note number
const freqToMidi = (freq: number): number => {
  return 12 * Math.log2(freq / 440) + 69;
};

// Helper function to convert MIDI note number to frequency
const midiToFreq = (midi: number): number => {
  return 440 * Math.pow(2, (midi - 69) / 12);
};

const detectKey = async (audioBuffer: AudioBuffer): Promise<{ key: string; scale: 'major' | 'minor' }> => {
  const sampleRate = audioBuffer.sampleRate;
  const data = audioBuffer.getChannelData(0);
  
  // Create an offline audio context for analysis
  const offlineCtx = new OfflineAudioContext(1, data.length, sampleRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  
  // Create an analyzer node
  const analyzer = offlineCtx.createAnalyser();
  analyzer.fftSize = 2048;
  
  // Connect nodes
  source.connect(analyzer);
  analyzer.connect(offlineCtx.destination);
  
  // Start playback
  source.start();
  
  try {
    // Process the audio
    const renderedBuffer = await offlineCtx.startRendering();
    
    // Get frequency data
    const frequencyData = new Float32Array(analyzer.frequencyBinCount);
    analyzer.getFloatFrequencyData(frequencyData);
    
    // Find the most prominent frequencies
    const prominentFreqs: number[] = [];
    for (let i = 0; i < frequencyData.length; i++) {
      if (frequencyData[i] > -50) { // Threshold for significant frequencies
        const freq = i * sampleRate / analyzer.fftSize;
        if (freq >= 20 && freq <= 2000) { // Focus on fundamental frequencies
          prominentFreqs.push(freq);
        }
      }
    }
    
    // Convert frequencies to MIDI note numbers
    const midiNotes = prominentFreqs.map(freqToMidi);
    
    // Count occurrences of each pitch class (0-11)
    const pitchClassCounts = new Array(12).fill(0);
    midiNotes.forEach(note => {
      const pitchClass = Math.round(note) % 12;
      pitchClassCounts[pitchClass]++;
    });
    
    // Find the most common pitch class
    let maxCount = 0;
    let dominantPitchClass = 0;
    for (let i = 0; i < 12; i++) {
      if (pitchClassCounts[i] > maxCount) {
        maxCount = pitchClassCounts[i];
        dominantPitchClass = i;
      }
    }
    
    // Determine if major or minor based on the third interval
    const thirdInterval = (dominantPitchClass + 4) % 12; // Major third
    const minorThirdInterval = (dominantPitchClass + 3) % 12; // Minor third
    
    const majorThirdCount = pitchClassCounts[thirdInterval];
    const minorThirdCount = pitchClassCounts[minorThirdInterval];
    
    return {
      key: KEY_NAMES[dominantPitchClass],
      scale: majorThirdCount > minorThirdCount ? 'major' : 'minor'
    };
  } catch (error) {
    console.error('Key detection failed:', error);
    return { key: 'C', scale: 'major' };
  }
};

// Preprocessing functions
const normalizeAudio = (data: Float32Array): Float32Array => {
  // Find maximum amplitude using a loop instead of spread operator
  let max = 0;
  for (let i = 0; i < data.length; i++) {
    max = Math.max(max, Math.abs(data[i]));
  }
  
  // Avoid division by zero
  if (max === 0) return data;
  
  // Normalize the audio
  const normalized = new Float32Array(data.length);
  for (let i = 0; i < data.length; i++) {
    normalized[i] = data[i] / max;
  }
  
  return normalized;
};

const applyLowPassFilter = (data: Float32Array, sampleRate: number, cutoffFreq: number): Float32Array => {
  const RC = 1.0 / (cutoffFreq * 2 * Math.PI);
  const dt = 1.0 / sampleRate;
  const alpha = dt / (RC + dt);
  
  const filtered = new Float32Array(data.length);
  filtered[0] = data[0];
  
  for (let i = 1; i < data.length; i++) {
    filtered[i] = filtered[i - 1] + alpha * (data[i] - filtered[i - 1]);
  }
  
  return filtered;
};

const calculateRMS = (data: Float32Array): number => {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i];
  }
  return Math.sqrt(sum / data.length);
};

const calculateEnergy = (data: Float32Array): number => {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += Math.abs(data[i]);
  }
  return sum / data.length;
};

const detectBPM = (audioBuffer: AudioBuffer): number => {
  const data = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  
  // Preprocess audio
  const normalizedData = normalizeAudio(data);
  const filteredData = applyLowPassFilter(normalizedData, sampleRate, 200); // Low-pass filter at 200Hz
  
  // Create overlapping windows with larger size for better beat detection
  const windowSize = Math.floor(sampleRate * 0.2); // 200ms windows
  const hopSize = Math.floor(windowSize / 2);
  const windows = [];
  
  for (let i = 0; i < filteredData.length - windowSize; i += hopSize) {
    const window = filteredData.slice(i, i + windowSize);
    const energy = calculateRMS(window);
    windows.push(energy);
  }
  
  // Find peaks in energy with dynamic thresholding
  const peaks = [];
  let meanEnergy = 0;
  for (let i = 0; i < windows.length; i++) {
    meanEnergy += windows[i];
  }
  meanEnergy /= windows.length;
  
  let sumSquaredDiff = 0;
  for (let i = 0; i < windows.length; i++) {
    sumSquaredDiff += Math.pow(windows[i] - meanEnergy, 2);
  }
  const stdDev = Math.sqrt(sumSquaredDiff / windows.length);
  const threshold = meanEnergy + stdDev * 0.5;
  
  for (let i = 1; i < windows.length - 1; i++) {
    if (windows[i] > windows[i - 1] && 
        windows[i] > windows[i + 1] && 
        windows[i] > threshold) {
      peaks.push(i);
    }
  }
  
  // Calculate average time between peaks with outlier removal
  if (peaks.length < 2) return 120; // Default BPM if not enough peaks
  
  const intervals = [];
  for (let i = 1; i < peaks.length; i++) {
    intervals.push(peaks[i] - peaks[i - 1]);
  }
  
  // Remove outliers (intervals that are too different from the median)
  const sortedIntervals = [...intervals].sort((a, b) => a - b);
  const median = sortedIntervals[Math.floor(sortedIntervals.length / 2)];
  const filteredIntervals = intervals.filter(interval => 
    Math.abs(interval - median) <= median * 0.5
  );
  
  if (filteredIntervals.length === 0) return 120;
  
  let sumIntervals = 0;
  for (let i = 0; i < filteredIntervals.length; i++) {
    sumIntervals += filteredIntervals[i];
  }
  const averageInterval = sumIntervals / filteredIntervals.length;
  const bpm = Math.round(60 / (averageInterval * hopSize / sampleRate));
  
  // Constrain BPM to reasonable range and round to nearest common tempo
  const commonTempos = [60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200];
  const constrainedBPM = Math.max(60, Math.min(200, bpm));
  return commonTempos.reduce((prev, curr) => 
    Math.abs(curr - constrainedBPM) < Math.abs(prev - constrainedBPM) ? curr : prev
  );
};

export const analyzeAudio = async (audioBuffer: AudioBuffer): Promise<AudioAnalysisResult> => {
  try {
    const data = audioBuffer.getChannelData(0);
    
    // Preprocess audio for analysis
    const normalizedData = normalizeAudio(data);
    const filteredData = applyLowPassFilter(normalizedData, audioBuffer.sampleRate, 200);
    
    // Calculate BPM with preprocessed audio
    const bpm = detectBPM(audioBuffer);
    
    // Calculate energy (0-1) using preprocessed audio
    const energy = calculateEnergy(filteredData);
    
    // Calculate loudness (RMS) using preprocessed audio
    const loudness = calculateRMS(filteredData);
    
    // Detect key and scale
    const { key, scale } = await detectKey(audioBuffer);
    
    return {
      bpm,
      energy: Math.round(energy * 100) / 100,
      loudness: Math.round(20 * Math.log10(loudness) * 100) / 100, // Convert to dB
      duration: audioBuffer.duration,
      key,
      scale
    };
  } catch (error) {
    console.error('Failed to analyze audio:', error);
    throw new Error('Failed to analyze audio file');
  }
};

export const formatAnalysisResult = (result: AudioAnalysisResult): string => {
  return `
    BPM: ${result.bpm}
    Key: ${result.key} ${result.scale}
    Energy: ${result.energy * 100}%
    Loudness: ${result.loudness} dB
    Duration: ${Math.floor(result.duration / 60)}:${Math.floor(result.duration % 60).toString().padStart(2, '0')}
  `.trim();
};