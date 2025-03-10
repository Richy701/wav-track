import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  renderCount: number;
}

const usePerformanceMonitor = (componentName: string) => {
  const startTimeRef = useRef<number>(0);
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    startTimeRef.current = performance.now();
    renderCountRef.current += 1;

    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTimeRef.current;

      const metrics: PerformanceMetrics = {
        componentName,
        renderTime,
        renderCount: renderCountRef.current
      };

      // Log performance metrics
      console.log('Performance Metrics:', metrics);

      // You could send these metrics to your analytics service
      // sendMetricsToAnalytics(metrics);
    };
  });

  return {
    getRenderCount: () => renderCountRef.current
  };
};

export default usePerformanceMonitor; 