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

/**
 * Performance-optimized styles for hardware acceleration
 */
export const performanceStyles = {
  hardwareAccelerated: {
    willChange: 'transform',
    transform: 'translateZ(0)',
    backfaceVisibility: 'hidden',
    perspective: '1000px'
  },
  smoothScroll: 'scroll-smooth',
  reducedMotion: 'motion-reduce:transition-none motion-reduce:transform-none',
  optimizedAnimations: {
    transform: 'translateZ(0)',
    willChange: 'auto',
    backfaceVisibility: 'hidden',
  }
} as const

/**
 * Optimized fade animation variants with reduced motion support
 */
export const fadeAnimation: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1,
    transition: { 
      duration: 0.15,
      ease: 'easeOut'
    }
  },
  exit: { 
    opacity: 0,
    transition: { 
      duration: 0.1,
      ease: 'easeIn'
    }
  }
}

/**
 * Optimized slide animation variants
 */
export const slideAnimation: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  }
}

/**
 * Optimized scale animation variants
 */
export const scaleAnimation: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { 
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 }
  }
}

/**
 * Optimized list item animation variants
 */
export const listItemAnimation: Variants = {
  initial: { opacity: 0, y: 10 },
  animate: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  }
}

/**
 * Creates staggered animation variants for lists
 */
export function createStaggeredAnimation(
  staggerChildren = 0.1,
  delayChildren = 0
): Variants {
  return {
    initial: { opacity: 1 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren
      }
    },
    exit: { opacity: 1 }
  }
}

/**
 * Creates spring animation variants with optimized settings
 */
export function createSpringAnimation(
  customConfig = {}
): Variants {
  const defaultConfig = {
    stiffness: 150,
    damping: 20,
    mass: 0.8,
    restDelta: 0.001
  }

  const config = { ...defaultConfig, ...customConfig }

  return {
    initial: { opacity: 0, scale: 0.98 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        ...config
      }
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: {
        type: 'spring',
        ...config
      }
    }
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
  threshold: 0.05,
  rootMargin: '100px',
  delay: 50
}

// Image optimization
export const imageOptimization = {
  sizes: {
    thumbnail: 150,
    small: 300,
    medium: 600,
    large: 1200
  },
  quality: {
    thumbnail: 70,
    small: 75,
    medium: 80,
    large: 85
  },
  format: 'webp',
  loading: 'lazy',
  placeholder: 'blur'
} 