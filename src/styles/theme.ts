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
      'bg-white/95 dark:bg-zinc-800/60',
      'backdrop-blur-[2px] dark:backdrop-blur-xl',
      'border border-zinc-200/80 dark:border-zinc-800/50',
      'shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.2)]'
    ),
    hover: 'hover:shadow-[0_12px_36px_-8px_rgba(0,0,0,0.12)] dark:hover:shadow-primary/20 hover:border-zinc-300 dark:hover:border-zinc-700',
  },

  // Button styles
  button: {
    primary: cn(
      'bg-zinc-900 dark:bg-primary/90',
      'hover:bg-zinc-800 dark:hover:bg-primary/80',
      'text-white',
      'shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)] dark:shadow-primary/20',
      'transition-all duration-200',
      'rounded-full',
      'cursor-pointer',
      'hover:scale-[1.02] active:scale-[0.98]',
      'hover:shadow-[0_6px_16px_-2px_rgba(0,0,0,0.16)]'
    ),
    secondary: cn(
      'bg-white dark:bg-zinc-900/50',
      'hover:bg-zinc-50 dark:hover:bg-zinc-800/50',
      'border border-zinc-200 dark:border-zinc-800',
      'text-zinc-900 dark:text-zinc-200',
      'shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]',
      'transition-all duration-200',
      'rounded-md',
      'cursor-pointer',
      'hover:scale-[1.02] active:scale-[0.98]',
      'hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)]'
    ),
  },

  // Input styles
  input: {
    base: cn(
      'w-full px-4 py-2',
      'bg-white dark:bg-zinc-900/50',
      'border border-zinc-200 dark:border-zinc-800',
      'rounded-md',
      'focus:outline-none focus:ring-2',
      'focus:ring-zinc-900/10 dark:focus:ring-primary/20',
      'focus:border-zinc-400 dark:focus:border-zinc-700',
      'transition-all duration-200',
      // Input text color
      'text-zinc-900 dark:text-zinc-100',
      // Placeholder text color
      'placeholder:text-zinc-500 dark:placeholder:text-zinc-400',
      // Disabled state
      'disabled:bg-zinc-50 dark:disabled:bg-zinc-800',
      'disabled:text-zinc-400 dark:disabled:text-zinc-400',
      'disabled:cursor-not-allowed',
      // Read-only state
      'read-only:bg-zinc-50/50 dark:read-only:bg-zinc-800/50',
      'read-only:text-zinc-700 dark:read-only:text-zinc-300',
      'read-only:cursor-default',
      // Error state
      'border-red-300 dark:border-red-700',
      'focus:border-red-500 dark:focus:border-red-500',
      'focus:ring-red-200 dark:focus:ring-red-800'
    ),
    label: cn('block text-sm font-medium', 'text-zinc-800 dark:text-zinc-300', 'mb-1'),
    helper: cn('mt-1 text-sm', 'text-zinc-600 dark:text-zinc-400'),
    error: cn('mt-1 text-sm', 'text-red-600 dark:text-red-400'),
  },

  // Text styles
  text: {
    heading: cn('text-zinc-900 dark:text-zinc-100', 'font-semibold tracking-tight'),
    body: cn('text-zinc-800 dark:text-zinc-300', 'leading-relaxed'),
    muted: cn('text-zinc-600 dark:text-zinc-400'),
    link: cn(
      'text-zinc-900 dark:text-primary/80',
      'hover:text-zinc-700 dark:hover:text-primary',
      'underline-offset-4 hover:underline'
    ),
  },

  // Container styles
  container: {
    base: cn(
      'bg-white/95 dark:bg-zinc-900/80',
      'backdrop-blur-[2px] dark:backdrop-blur-xl',
      'border border-zinc-200/80 dark:border-zinc-800/50',
      'shadow-[0_16px_48px_-12px_rgba(0,0,0,0.08)]',
      'dark:shadow-none'
    ),
  },

  // Carousel styles
  carousel: {
    navigation: cn(
      'bg-white/80 dark:bg-black/60',
      'border border-zinc-200/80 dark:border-white/15',
      'hover:bg-white/90 dark:hover:bg-black/80',
      'hover:border-zinc-300 dark:hover:border-white/25',
      'backdrop-blur-[2px] dark:backdrop-blur-sm',
      'shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]',
      'transition-all duration-200'
    ),
    pagination: cn(
      'bg-zinc-900/10 dark:bg-white/30',
      'border border-zinc-200/80 dark:border-white/15',
      'backdrop-blur-[2px] dark:backdrop-blur-sm',
      'shadow-[0_2px_8px_-2px_rgba(0,0,0,0.08)]',
      'transition-all duration-200'
    ),
  },

  // Animation classes
  animation: {
    fadeUp: cn('opacity-0 translate-y-2', 'animate-fade-up', 'transition-transform duration-500'),
    fadeIn: cn('opacity-0', 'animate-fade-in', 'transition-none duration-500'),
  },
} as const
