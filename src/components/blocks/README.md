# Gallery4Demo Component

A professional carousel gallery component for showcasing WavTrack app features with smooth animations and responsive design.

## Features

- **Responsive Carousel**: Built with Embla Carousel for smooth scrolling
- **Category-based Styling**: Different color schemes for different feature categories
- **Smooth Animations**: Framer Motion animations for enhanced UX
- **Fallback Images**: Automatic fallback to Unsplash images if local images fail to load
- **Accessible**: Proper ARIA labels and keyboard navigation
- **Dark Mode Support**: Fully compatible with light/dark themes

## Usage

### Basic Usage

```tsx
import { Gallery4Demo } from '@/components/blocks/gallery4'

export default function MyPage() {
  return (
    <div>
      <Gallery4Demo />
    </div>
  )
}
```

### Customization

The component uses a `galleryItems` array that you can modify to showcase different features:

```tsx
const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Your Feature Title',
    description: 'Description of your feature',
    image: '/path/to/your/image.png',
    category: 'production', // 'production' | 'analytics' | 'collaboration' | 'goals'
    features: ['Feature 1', 'Feature 2', 'Feature 3'],
    icon: <YourIcon className="h-6 w-6" />
  }
]
```

### Category Colors

The component automatically applies different color schemes based on the category:

- **Production**: Violet gradient (`from-violet-500 to-violet-600`)
- **Analytics**: Blue gradient (`from-blue-500 to-blue-600`)
- **Goals**: Emerald gradient (`from-emerald-500 to-emerald-600`)
- **Collaboration**: Orange gradient (`from-orange-500 to-orange-600`)

## Image Requirements

### Recommended Image Specifications

- **Aspect Ratio**: 4:3 (the component uses `aspect-[4/3]`)
- **Resolution**: 800x600px minimum, 1200x900px recommended
- **Format**: PNG, JPG, or WebP
- **File Size**: Under 200KB for optimal performance

### Image Fallback

If your images fail to load, the component automatically falls back to a professional music studio image from Unsplash.

## Testing

You can test the component by visiting `/gallery-test` in your application.

## Dependencies

This component requires the following dependencies (already included in your project):

- `embla-carousel-react`
- `framer-motion`
- `lucide-react`
- `@radix-ui/react-slot`
- `class-variance-authority`

## File Structure

```
src/components/blocks/
├── gallery4.tsx          # Main component
├── gallery4-demo.tsx     # Demo wrapper
└── README.md            # This documentation
```

## Integration with Landing Page

The component is already integrated into your landing page at `src/pages/LandingPage.tsx`. It replaces the previous `GalleryDemo` component.

## Customization Tips

1. **Replace Images**: Update the `image` paths in `galleryItems` to use your actual screenshots
2. **Add Categories**: Extend the `categoryColors` object to add new color schemes
3. **Modify Content**: Update titles, descriptions, and features to match your app's functionality
4. **Adjust Animations**: Modify the Framer Motion variants for different animation effects

## Performance Notes

- Images are loaded with `object-cover` for optimal display
- Animations use `willChange` and `transform: translateZ(0)` for hardware acceleration
- The carousel is optimized for smooth scrolling on all devices 