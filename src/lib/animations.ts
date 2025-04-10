import { Variants } from 'framer-motion'

// Shared animation variants
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.3,
      ease: 'easeOut'
    }
  }
}

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      duration: 0.5,
      ease: 'easeOut'
    } 
  }
}

export const slideIn: Variants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  }
}

export const listItem: Variants = {
  hidden: { 
    opacity: 0,
    x: -20
  },
  visible: { 
    opacity: 1,
    x: 0,
    transition: { 
      duration: 0.3,
      ease: 'easeOut'
    }
  }
}

// Performance optimization utilities
export const performanceStyles = {
  // Hardware acceleration
  hardwareAccelerated: {
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    perspective: 1000,
    willChange: 'transform'
  },
  // Smooth scrolling
  smoothScroll: {
    scrollBehavior: 'smooth',
    WebkitOverflowScrolling: 'touch'
  },
  // Prevent layout shifts
  preventLayoutShift: {
    contain: 'layout paint',
    willChange: 'transform'
  },
  // Optimize animations
  optimizeAnimation: {
    willChange: 'transform, opacity',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden'
  }
}

// Animation presets
export const animationPresets = {
  // Fade in with scale
  fadeScale: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  },
  // Slide in from side
  slideIn: {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      x: 20,
      transition: { duration: 0.2 }
    }
  },
  // List item animation
  listItem: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.2 }
    }
  }
}

// Lazy loading configuration
export const lazyLoadConfig = {
  // Threshold for when to start loading
  threshold: 0.1,
  // Root margin for intersection observer
  rootMargin: '50px',
  // Delay before loading
  delay: 100
}

// Image optimization
export const imageOptimization = {
  // Default image sizes
  sizes: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 1200
  },
  // Quality settings
  quality: 80,
  // Format settings
  format: 'webp',
  // Loading strategy
  loading: 'lazy'
} 