import { lazy, ComponentType } from 'react'

// Enhanced lazy loading with preload support
export function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
): React.LazyExoticComponent<T> & { preload: () => Promise<{ default: T }> } {
  const Component = lazy(factory) as React.LazyExoticComponent<T> & { 
    preload?: () => Promise<{ default: T }> 
  }
  Component.preload = factory
  return Component as React.LazyExoticComponent<T> & { preload: () => Promise<{ default: T }> }
}

// Preload a component on hover or intersection
export const preloadComponent = (
  component: React.LazyExoticComponent<ComponentType<any>> & { 
    preload: () => Promise<{ default: ComponentType<any> }> 
  }
) => {
  return () => {
    component.preload()
  }
}

// Intersection observer for preloading components when they're about to enter the viewport
export const useIntersectionPreload = (
  component: React.LazyExoticComponent<ComponentType<any>> & { 
    preload: () => Promise<{ default: ComponentType<any> }> 
  },
  rootMargin = '200px'
) => {
  return (element: HTMLElement | null) => {
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            component.preload()
            observer.unobserve(entry.target)
          }
        })
      },
      { rootMargin }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }
}

// Media query based preloading
export const preloadOnConnection = (
  component: React.LazyExoticComponent<ComponentType<any>> & { 
    preload: () => Promise<{ default: ComponentType<any> }> 
  }
) => {
  // Only preload on fast connections
  if ('connection' in navigator) {
    const connection = (navigator as any).connection
    if (connection.effectiveType === '4g' || connection.downlink > 1.5) {
      component.preload()
    }
  }
}

// Route-based preloading
export const preloadRouteComponents = (routes: string[]) => {
  routes.forEach(route => {
    // Implement route-specific preloading logic
    // This would be used with the router to preload next likely routes
  })
}