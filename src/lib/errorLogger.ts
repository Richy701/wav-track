// Error logger utility for debugging Supabase issues

import { supabase } from './supabase';

// Error object type
interface ErrorLogItem {
  timestamp: number;
  type: string;
  message: string;
  details?: any;
}

// Store recent errors in memory
const recentErrors: ErrorLogItem[] = [];
const MAX_ERRORS = 20;

/**
 * Log an error with additional context.
 * This preserves the original console.error behavior while logging to our custom error logger
 */
export function logError(
  type: string,
  message: string,
  details?: any
) {
  // Log to console as normal
  console.error(`[${type}]`, message, details || '');
  
  // Add to our error log
  recentErrors.unshift({
    timestamp: Date.now(),
    type,
    message,
    details
  });
  
  // Trim the log if it gets too long
  if (recentErrors.length > MAX_ERRORS) {
    recentErrors.pop();
  }
}

/**
 * Get the list of recent errors for display in debug UI
 */
export function getRecentErrors(): ErrorLogItem[] {
  return [...recentErrors];
}

/**
 * Clear the error log
 */
export function clearErrorLog() {
  recentErrors.length = 0;
}

/**
 * Monitor Supabase-specific errors by adding listeners to network requests
 * Used to catch 400/401/403/404/500 errors from Supabase
 */
export function monitorSupabaseErrors() {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') return;

  const originalFetch = window.fetch;
  
  // Override fetch to monitor for Supabase API calls
  window.fetch = async function(input, init) {
    const url = typeof input === 'string' ? input : input.url;
    const isSupabaseRequest = url.includes('supabase.co');
    
    try {
      const response = await originalFetch(input, init);
      
      // Only check Supabase requests
      if (isSupabaseRequest && !response.ok) {
        try {
          // Clone the response to read it
          const cloned = response.clone();
          const text = await cloned.text();
          let data = { error: 'Unknown error' };
          
          try {
            data = JSON.parse(text);
          } catch (e) {
            // If not valid JSON, use the text directly
          }

          logError(
            'Supabase API Error', 
            `${response.status}: ${response.statusText}`,
            {
              endpoint: url.split('supabase.co')[1] || url,
              data: data,
              status: response.status
            }
          );
        } catch (parseError) {
          // If we can't parse the response, just log the basic error
          logError(
            'Supabase API Error',
            `${response.status}: ${response.statusText}`,
            { endpoint: url.split('supabase.co')[1] || url }
          );
        }
      }
      
      return response;
    } catch (error) {
      // Network errors or other fetch failures
      if (isSupabaseRequest) {
        logError(
          'Supabase Network Error',
          error instanceof Error ? error.message : String(error),
          { url }
        );
      }
      throw error;
    }
  };
}

/**
 * Setup global error handlers to catch unhandled errors
 */
export function setupGlobalErrorHandlers() {
  if (typeof window === 'undefined') return;
  
  // Set up global error handler
  window.addEventListener('error', (event) => {
    logError('Unhandled Error', event.message, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  });
  
  // Set up unhandled promise rejection handler
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason;
    logError('Unhandled Promise Rejection', 
      error instanceof Error ? error.message : String(error),
      { stack: error instanceof Error ? error.stack : undefined }
    );
  });
  
  // Set up monitoring for Supabase errors
  monitorSupabaseErrors();
  
  console.log('[ErrorLogger] Global error handlers set up successfully');
} 