# WavTrack Footer Component

A modern, responsive footer component for the WavTrack application with scroll-to-top functionality.

## Features

- **Social Media Links**: Twitter, Instagram, YouTube, and Discord links with smooth hover animations
- **Feedback Button**: Allows users to provide feedback
- **Scroll-to-Top Button**: Appears when scrolling down 100px or more
- **Responsive Design**: Adapts to different screen sizes
- **Animations**: Smooth transitions and hover effects using Framer Motion

## Integration

The Footer component is already integrated into the `BaseLayout` component, which is used throughout the application. The layout structure ensures the footer is positioned at the bottom of the page using a flex column layout.

```tsx
// BaseLayout.tsx
<div className="min-h-screen bg-white dark:bg-black flex flex-col overflow-x-hidden touch-manipulation overscroll-none">
  <Header />
  <main className="flex-1 w-full mx-auto overflow-x-hidden">
    {children}
  </main>
  <Footer />
</div>
```

## Scroll-to-Top Functionality

The scroll-to-top button appears when the user scrolls down 100px or more and fades in/out using Framer Motion animations. It's positioned at the bottom right of the screen to avoid overlapping with other UI elements.

## Customization

You can customize the Footer component by:

1. Adding more social media links
2. Changing the animation durations and effects
3. Adjusting the spacing and padding
4. Adding additional sections like a newsletter signup form
5. Adding links to Privacy Policy, Terms of Service, etc.

## Dependencies

- React
- Framer Motion
- Lucide React
- Phosphor Icons

## Best Practices

- Keep the Footer component lightweight to avoid performance issues
- Ensure the scroll-to-top button doesn't overlap with other UI elements
- Maintain consistent spacing between Footer sections
- Use semantic HTML elements for accessibility
- Ensure all interactive elements have appropriate hover/focus states 