import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  componentName: string
  renderTime: number
  renderCount: number
  memoryUsage?: number
  longTasks?: number
}

const usePerformanceMonitor = (componentName: string) => {
  const startTimeRef = useRef<number>(0)
  const renderCountRef = useRef<number>(0)
  const longTasksRef = useRef<number>(0)

  useEffect(() => {
    startTimeRef.current = performance.now()
    renderCountRef.current += 1

    // Monitor long tasks
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          // Tasks longer than 50ms
          longTasksRef.current += 1
        }
      }
    })

    observer.observe({ entryTypes: ['longtask'] })

    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTimeRef.current

      // Get memory usage if available
      let memoryUsage
      if (performance.memory) {
        memoryUsage = performance.memory.usedJSHeapSize
      }

      const metrics: PerformanceMetrics = {
        componentName,
        renderTime,
        renderCount: renderCountRef.current,
        memoryUsage,
        longTasks: longTasksRef.current,
      }

      // Log performance metrics
      if (process.env.NODE_ENV === 'development') {
        console.log('Performance Metrics:', {
          ...metrics,
          renderTime: `${renderTime.toFixed(2)}ms`,
          memoryUsage: memoryUsage ? `${(memoryUsage / 1048576).toFixed(2)}MB` : 'Not available',
        })
      }

      // You could send these metrics to your analytics service
      // sendMetricsToAnalytics(metrics);

      observer.disconnect()
    }
  })

  return {
    getRenderCount: () => renderCountRef.current,
    getLongTasks: () => longTasksRef.current,
  }
}

export default usePerformanceMonitor
