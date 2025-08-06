/**
 * CSS Loading Optimization Utilities
 * Provides functions to defer non-critical CSS loading and improve LCP
 */

interface CSSLoadOptions {
  href: string
  media?: string
  onload?: () => void
  onerror?: (error: ErrorEvent) => void
}

/**
 * Loads CSS asynchronously to prevent render blocking
 */
export function loadCSSAsync(options: CSSLoadOptions): HTMLLinkElement {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'style'
  link.href = options.href
  
  if (options.media) {
    link.media = options.media
  }

  link.onload = () => {
    // Convert preload to stylesheet after loading
    link.rel = 'stylesheet'
    link.media = 'all'
    options.onload?.()
  }

  link.onerror = (error) => {
    console.warn(`Failed to load CSS: ${options.href}`)
    options.onerror?.(error as ErrorEvent)
  }

  document.head.appendChild(link)
  return link
}

/**
 * Loads CSS with media query to prevent blocking critical rendering
 */
export function loadNonCriticalCSS(href: string, media = 'print'): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.media = media

    link.onload = () => {
      // Change media to 'all' after loading
      link.media = 'all'
      resolve()
    }

    link.onerror = () => {
      reject(new Error(`Failed to load CSS: ${href}`))
    }

    document.head.appendChild(link)
  })
}

/**
 * Preloads critical CSS resources
 */
export function preloadCriticalCSS(href: string): void {
  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'style'
  link.href = href
  
  // Add crossorigin for external stylesheets
  if (href.includes('http') && !href.includes(window.location.hostname)) {
    link.crossOrigin = 'anonymous'
  }

  document.head.appendChild(link)
}

/**
 * Injects critical CSS directly into the document
 */
export function injectCriticalCSS(css: string): HTMLStyleElement {
  const style = document.createElement('style')
  style.textContent = css
  style.setAttribute('data-critical', 'true')
  document.head.appendChild(style)
  return style
}

/**
 * Removes critical CSS after main stylesheet loads
 */
export function removeCriticalCSS(): void {
  const criticalStyles = document.querySelectorAll('style[data-critical]')
  criticalStyles.forEach(style => style.remove())
}

/**
 * Defers CSS loading until after page load
 */
export function deferCSS(href: string): void {
  if (document.readyState === 'complete') {
    loadCSSAsync({ href })
  } else {
    window.addEventListener('load', () => {
      loadCSSAsync({ href })
    })
  }
}

/**
 * Critical CSS content that should be inlined
 */
export const CRITICAL_CSS = `
  /* Critical styles for immediate render */
  * {
    box-sizing: border-box;
  }
  
  .loading-spinner {
    display: inline-block;
    width: 20px;
    height: 20px;
    border: 2px solid rgba(0,0,0,0.1);
    border-radius: 50%;
    border-top: 2px solid #000;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`