import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shared component styles
export const theme = {
  // Card styles
  card: {
    base: cn(
      'rounded-lg overflow-hidden',
      'bg-white/60 dark:bg-zinc-800/60',
      'backdrop-blur-xl',
      'border border-zinc-200/50 dark:border-zinc-800/50',
      'shadow-[0_4px_24px_-4px_rgba(0,0,0,0.07),0_1px_2px_-1px_rgba(0,0,0,0.04)]',
      'dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.2)]'
    ),
    hover: 'hover:shadow-lg dark:hover:shadow-primary/20',
  },

  // Button styles
  button: {
    primary: cn(
      'bg-primary dark:bg-primary/90',
      'hover:bg-primary/90 dark:hover:bg-primary/80',
      'text-white',
      'shadow-md dark:shadow-primary/20',
      'transition-all duration-200'
    ),
    secondary: cn(
      'bg-white/50 dark:bg-zinc-900/50',
      'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
      'border border-zinc-200 dark:border-zinc-800',
      'text-zinc-800 dark:text-zinc-200',
      'shadow-sm',
      'transition-all duration-200'
    ),
  },

  // Input styles
  input: {
    base: cn(
      'w-full px-4 py-2',
      'bg-white/50 dark:bg-zinc-900/50',
      'border border-zinc-200 dark:border-zinc-800',
      'rounded-md',
      'focus:outline-none focus:ring-2 focus:ring-primary/20',
      'transition-all duration-200',
      // Input text color
      'text-zinc-900 dark:text-zinc-100',
      // Placeholder text color
      'placeholder:text-zinc-500 dark:placeholder:text-zinc-400',
      // Disabled state
      'disabled:bg-zinc-100 dark:disabled:bg-zinc-800',
      'disabled:text-zinc-500 dark:disabled:text-zinc-400',
      'disabled:cursor-not-allowed',
      // Read-only state
      'read-only:bg-zinc-50 dark:read-only:bg-zinc-800/50',
      'read-only:text-zinc-700 dark:read-only:text-zinc-300',
      'read-only:cursor-default',
      // Error state
      'border-red-300 dark:border-red-700',
      'focus:border-red-500 dark:focus:border-red-500',
      'focus:ring-red-200 dark:focus:ring-red-800'
    ),
    label: cn('block text-sm font-medium', 'text-zinc-700 dark:text-zinc-300', 'mb-1'),
    helper: cn('mt-1 text-sm', 'text-zinc-500 dark:text-zinc-400'),
    error: cn('mt-1 text-sm', 'text-red-600 dark:text-red-400'),
  },

  // Text styles
  text: {
    heading: cn('text-zinc-900 dark:text-zinc-100', 'font-semibold'),
    body: cn('text-zinc-700 dark:text-zinc-300'),
    muted: cn('text-zinc-500 dark:text-zinc-400'),
    link: cn(
      'text-primary/90 dark:text-primary/80',
      'hover:text-primary dark:hover:text-primary',
      'transition-colors duration-200'
    ),
  },

  // Container styles
  container: {
    base: cn(
      'bg-white/80 dark:bg-zinc-900/80',
      'backdrop-blur-xl',
      'border border-zinc-200/50 dark:border-zinc-800/50',
      'shadow-[0_0_60px_-12px_rgba(0,0,0,0.08)]',
      'dark:shadow-none'
    ),
  },

  // Carousel styles
  carousel: {
    navigation: cn(
      'bg-black/40 dark:bg-black/60',
      'border border-white/10 dark:border-white/15',
      'hover:bg-black/60 dark:hover:bg-black/80',
      'hover:border-white/20 dark:hover:border-white/25',
      'backdrop-blur-sm',
      'transition-all duration-200'
    ),
    pagination: cn(
      'bg-white/40 dark:bg-white/30',
      'border border-white/10 dark:border-white/15',
      'backdrop-blur-sm',
      'transition-all duration-200'
    ),
  },

  // Animation classes
  animation: {
    fadeUp: cn('opacity-0 translate-y-2', 'animate-fade-up', 'transition-all duration-500'),
    fadeIn: cn('opacity-0', 'animate-fade-in', 'transition-opacity duration-500'),
  },
} as const
