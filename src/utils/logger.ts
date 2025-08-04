// Performance-optimized logging utility
const isDevelopment = process.env.NODE_ENV === 'development'

export const logger = {
  log: isDevelopment ? console.log : () => {},
  error: console.error, // Always log errors
  warn: isDevelopment ? console.warn : () => {},
  info: isDevelopment ? console.info : () => {},
  debug: isDevelopment ? console.debug : () => {},
  
  // Performance logging for production monitoring
  performance: (label: string, data?: any) => {
    if (isDevelopment) {
      console.log(`[PERF] ${label}:`, data)
    }
    // Could integrate with analytics in production
  }
}