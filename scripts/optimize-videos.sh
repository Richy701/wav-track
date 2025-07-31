#!/bin/bash

# Video optimization script for WavTrack
# Requires ffmpeg to be installed: brew install ffmpeg

echo "🎬 WavTrack Video Optimizer"
echo "=========================="

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg is not installed. Install it with: brew install ffmpeg"
    exit 1
fi

# Create optimized directory
mkdir -p public/videos/optimized

# Function to optimize video
optimize_video() {
    local input_file="$1"
    local output_file="$2"
    local target_size="$3"
    
    echo "🔧 Optimizing: $input_file"
    echo "📁 Output: $output_file"
    echo "📊 Target size: ${target_size}MB"
    
    # Calculate target bitrate (80% of target to leave room for audio)
    local target_bitrate=$(echo "scale=0; $target_size * 8192 * 0.8 / 60" | bc)
    
    ffmpeg -i "$input_file" \
        -c:v libx264 \
        -preset medium \
        -crf 23 \
        -maxrate "${target_bitrate}k" \
        -bufsize "$((target_bitrate * 2))k" \
        -c:a aac \
        -b:a 128k \
        -movflags +faststart \
        -y "$output_file"
    
    # Get file size
    local file_size=$(du -m "$output_file" | cut -f1)
    echo "✅ Complete! Final size: ${file_size}MB"
    echo "---"
}

# First, rename your originals to -raw.mp4 (backup)
echo "📁 Creating backups..."
if [ -f "public/videos/Wavtrack pro Analytic.mp4" ] && [ ! -f "public/videos/Wavtrack pro Analytic-raw.mp4" ]; then
    cp "public/videos/Wavtrack pro Analytic.mp4" "public/videos/Wavtrack pro Analytic-raw.mp4"
fi
if [ -f "public/videos/Wavtrack Pomodora timer.mp4" ] && [ ! -f "public/videos/Wavtrack Pomodora timer-raw.mp4" ]; then
    cp "public/videos/Wavtrack Pomodora timer.mp4" "public/videos/Wavtrack Pomodora timer-raw.mp4"
fi
if [ -f "public/videos/Wavtrack pro recent project .mp4" ] && [ ! -f "public/videos/Wavtrack pro recent project -raw.mp4" ]; then
    cp "public/videos/Wavtrack pro recent project .mp4" "public/videos/Wavtrack pro recent project -raw.mp4"
fi

# Optimize each video (target: 4-5MB each)
echo "🔧 Optimizing videos..."
if [ -f "public/videos/Wavtrack pro Analytic-raw.mp4" ]; then
    optimize_video "public/videos/Wavtrack pro Analytic-raw.mp4" "public/videos/Wavtrack pro Analytic.mp4" 5
fi

if [ -f "public/videos/Wavtrack Pomodora timer-raw.mp4" ]; then
    optimize_video "public/videos/Wavtrack Pomodora timer-raw.mp4" "public/videos/Wavtrack Pomodora timer.mp4" 4
fi

if [ -f "public/videos/Wavtrack pro recent project -raw.mp4" ]; then
    optimize_video "public/videos/Wavtrack pro recent project -raw.mp4" "public/videos/Wavtrack pro recent project .mp4" 5
fi

echo "🎉 All videos optimized!"
echo "📁 Original files kept as *-raw.mp4"
echo "📁 Optimized files ready for web use"