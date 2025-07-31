# Video Assets Directory

Place your video files here for use in WavTrack feature highlights.

## Recommended Video Specifications

### General Guidelines
- **Format**: MP4 (H.264 codec recommended)
- **Resolution**: 1920x1080 (1080p) or 1280x720 (720p)
- **Aspect Ratio**: 16:9 for hero videos, 16:9 or 4:3 for feature demos
- **Frame Rate**: 30fps or 60fps
- **Duration**: 30-90 seconds for feature demos
- **File Size**: Under 10MB for optimal loading performance

### Compression Settings
- **Video Bitrate**: 2-5 Mbps for 1080p, 1-3 Mbps for 720p
- **Audio**: AAC codec, 128kbps (if audio is needed, though most will be muted)

## Expected Video Files

Based on the current implementation, place your videos with these names:

### Main Feature Showcase
- `wavtrack-feature-demo.mp4` - Main hero video for the feature showcase

### Individual Feature Demos (for VideoFeatureHighlights component)
- `workflow-demo.mp4` - Demonstrates workflow organization features
- `goals-demo.mp4` - Shows goal setting and tracking features  
- `achievements-demo.mp4` - Showcases achievement system

## Video Optimization Tips

1. **Use a poster image**: Always provide a poster image (thumbnail) for better loading experience
2. **Keep file sizes small**: Compress videos appropriately for web delivery
3. **Test on mobile**: Ensure videos play well on mobile devices
4. **Consider autoplay policies**: Videos are set to muted and will autoplay when in view

## Poster Images

Corresponding poster images should be placed in:
`/public/images/features/wavtrack-screengrabs/`

- `app-overview.png` - Poster for main demo video
- `workflow-preview.png` - Poster for workflow demo
- `goals-preview.png` - Poster for goals demo  
- `achievements-preview.png` - Poster for achievements demo

## Usage in Components

Videos are automatically loaded using the `LazyVideo` component which provides:
- Lazy loading (only loads when in viewport)
- Poster image fallback
- Responsive sizing
- Performance optimization