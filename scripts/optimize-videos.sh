#!/bin/bash

# Enhanced Video optimization script for WavTrack
# Creates multiple quality versions for different devices
# Requires ffmpeg to be installed: brew install ffmpeg

echo "🎬 WavTrack Enhanced Video Optimizer"
echo "===================================="

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ ffmpeg is not installed. Install it with: brew install ffmpeg"
    exit 1
fi

# Create optimized directories
mkdir -p public/videos/optimized/mobile
mkdir -p public/videos/optimized/tablet
mkdir -p public/videos/optimized/desktop

# Function to optimize video for different qualities
optimize_video() {
    local input_file="$1"
    local output_file="$2"
    local quality="$3"
    local target_size="$4"
    
    echo "🔧 Optimizing: $input_file"
    echo "📁 Output: $output_file"
    echo "🎯 Quality: $quality"
    echo "📊 Target size: ${target_size}MB"
    
    case $quality in
        "mobile")
            # Mobile: 480p, low bitrate, small file
            ffmpeg -i "$input_file" \
                -vf "scale=854:480" \
                -c:v libx264 \
                -preset fast \
                -crf 28 \
                -maxrate 800k \
                -bufsize 1600k \
                -c:a aac \
                -b:a 96k \
                -movflags +faststart \
                -y "$output_file"
            ;;
        "tablet")
            # Tablet: 720p, medium bitrate
            ffmpeg -i "$input_file" \
                -vf "scale=1280:720" \
                -c:v libx264 \
                -preset medium \
                -crf 25 \
                -maxrate 1500k \
                -bufsize 3000k \
                -c:a aac \
                -b:a 128k \
                -movflags +faststart \
                -y "$output_file"
            ;;
        "desktop")
            # Desktop: 1080p, high quality
            ffmpeg -i "$input_file" \
                -vf "scale=1920:1080" \
                -c:v libx264 \
                -preset medium \
                -crf 23 \
                -maxrate 3000k \
                -bufsize 6000k \
                -c:a aac \
                -b:a 128k \
                -movflags +faststart \
                -y "$output_file"
            ;;
    esac
    
    # Get file size
    local file_size=$(du -m "$output_file" | cut -f1)
    echo "✅ Complete! Final size: ${file_size}MB"
    echo "---"
}

# Function to create WebM versions (better compression)
create_webm() {
    local input_file="$1"
    local output_file="$2"
    local quality="$3"
    
    echo "🌐 Creating WebM version: $output_file"
    
    case $quality in
        "mobile")
            ffmpeg -i "$input_file" \
                -vf "scale=854:480" \
                -c:v libvpx-vp9 \
                -crf 30 \
                -b:v 0 \
                -c:a libopus \
                -b:a 96k \
                -y "$output_file"
            ;;
        "tablet")
            ffmpeg -i "$input_file" \
                -vf "scale=1280:720" \
                -c:v libvpx-vp9 \
                -crf 28 \
                -b:v 0 \
                -c:a libopus \
                -b:a 128k \
                -y "$output_file"
            ;;
        "desktop")
            ffmpeg -i "$input_file" \
                -vf "scale=1920:1080" \
                -c:v libvpx-vp9 \
                -crf 25 \
                -b:v 0 \
                -c:a libopus \
                -b:a 128k \
                -y "$output_file"
            ;;
    esac
    
    local file_size=$(du -m "$output_file" | cut -f1)
    echo "✅ WebM Complete! Size: ${file_size}MB"
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

# Process each video
echo "🔧 Processing videos..."

# Wavtrack pro Analytic
if [ -f "public/videos/Wavtrack pro Analytic-raw.mp4" ]; then
    echo "📹 Processing: Wavtrack pro Analytic"
    optimize_video "public/videos/Wavtrack pro Analytic-raw.mp4" "public/videos/optimized/mobile/analytic-mobile.mp4" "mobile" 2
    optimize_video "public/videos/Wavtrack pro Analytic-raw.mp4" "public/videos/optimized/tablet/analytic-tablet.mp4" "tablet" 4
    optimize_video "public/videos/Wavtrack pro Analytic-raw.mp4" "public/videos/optimized/desktop/analytic-desktop.mp4" "desktop" 8
    
    # Create WebM versions
    create_webm "public/videos/Wavtrack pro Analytic-raw.mp4" "public/videos/optimized/mobile/analytic-mobile.webm" "mobile"
    create_webm "public/videos/Wavtrack pro Analytic-raw.mp4" "public/videos/optimized/tablet/analytic-tablet.webm" "tablet"
    create_webm "public/videos/Wavtrack pro Analytic-raw.mp4" "public/videos/optimized/desktop/analytic-desktop.webm" "desktop"
fi

# Wavtrack Pomodora timer
if [ -f "public/videos/Wavtrack Pomodora timer-raw.mp4" ]; then
    echo "📹 Processing: Wavtrack Pomodora timer"
    optimize_video "public/videos/Wavtrack Pomodora timer-raw.mp4" "public/videos/optimized/mobile/pomodoro-mobile.mp4" "mobile" 1.5
    optimize_video "public/videos/Wavtrack Pomodora timer-raw.mp4" "public/videos/optimized/tablet/pomodoro-tablet.mp4" "tablet" 3
    optimize_video "public/videos/Wavtrack Pomodora timer-raw.mp4" "public/videos/optimized/desktop/pomodoro-desktop.mp4" "desktop" 6
    
    # Create WebM versions
    create_webm "public/videos/Wavtrack Pomodora timer-raw.mp4" "public/videos/optimized/mobile/pomodoro-mobile.webm" "mobile"
    create_webm "public/videos/Wavtrack Pomodora timer-raw.mp4" "public/videos/optimized/tablet/pomodoro-tablet.webm" "tablet"
    create_webm "public/videos/Wavtrack Pomodora timer-raw.mp4" "public/videos/optimized/desktop/pomodoro-desktop.webm" "desktop"
fi

# Wavtrack pro recent project
if [ -f "public/videos/Wavtrack pro recent project -raw.mp4" ]; then
    echo "📹 Processing: Wavtrack pro recent project"
    optimize_video "public/videos/Wavtrack pro recent project -raw.mp4" "public/videos/optimized/mobile/project-mobile.mp4" "mobile" 2
    optimize_video "public/videos/Wavtrack pro recent project -raw.mp4" "public/videos/optimized/tablet/project-tablet.mp4" "tablet" 4
    optimize_video "public/videos/Wavtrack pro recent project -raw.mp4" "public/videos/optimized/desktop/project-desktop.mp4" "desktop" 8
    
    # Create WebM versions
    create_webm "public/videos/Wavtrack pro recent project -raw.mp4" "public/videos/optimized/mobile/project-mobile.webm" "mobile"
    create_webm "public/videos/Wavtrack pro recent project -raw.mp4" "public/videos/optimized/tablet/project-tablet.webm" "tablet"
    create_webm "public/videos/Wavtrack pro recent project -raw.mp4" "public/videos/optimized/desktop/project-desktop.webm" "desktop"
fi

echo "🎉 All videos optimized!"
echo "📁 Original files kept as *-raw.mp4"
echo "📁 Optimized files in public/videos/optimized/"
echo ""
echo "📊 File sizes:"
echo "Mobile: ~1.5-2MB each"
echo "Tablet: ~3-4MB each" 
echo "Desktop: ~6-8MB each"
echo ""
echo "🌐 WebM versions also created for better compression"