// Performance monitoring and optimization service
export class PerformanceService {
  private static instance: PerformanceService;
  private metrics: Map<string, number> = new Map();
  private observers: Map<string, PerformanceObserver> = new Map();

  private constructor() {
    this.initializeObservers();
  }

  public static getInstance(): PerformanceService {
    if (!PerformanceService.instance) {
      PerformanceService.instance = new PerformanceService();
    }
    return PerformanceService.instance;
  }

  // Initialize performance observers
  private initializeObservers(): void {
    if (typeof window === 'undefined') return;

    // Observe navigation timing
    if ('PerformanceObserver' in window) {
      try {
        const navigationObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming;
              this.metrics.set('domContentLoaded', navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart);
              this.metrics.set('loadComplete', navEntry.loadEventEnd - navEntry.loadEventStart);
              this.metrics.set('firstPaint', navEntry.responseStart - navEntry.requestStart);
            }
          });
        });
        navigationObserver.observe({ entryTypes: ['navigation'] });
        this.observers.set('navigation', navigationObserver);
      } catch (error) {
        console.warn('Navigation timing observer not supported:', error);
      }

      // Observe paint timing
      try {
        const paintObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-paint') {
              this.metrics.set('firstPaint', entry.startTime);
            } else if (entry.name === 'first-contentful-paint') {
              this.metrics.set('firstContentfulPaint', entry.startTime);
            }
          });
        });
        paintObserver.observe({ entryTypes: ['paint'] });
        this.observers.set('paint', paintObserver);
      } catch (error) {
        console.warn('Paint timing observer not supported:', error);
      }
    }
  }

  // Mark a performance point
  public mark(name: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(name);
    }
  }

  // Measure between two marks
  public measure(name: string, startMark: string, endMark: string): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      try {
        const measure = performance.measure(name, startMark, endMark);
        this.metrics.set(name, measure.duration);
      } catch (error) {
        console.warn('Performance measure failed:', error);
      }
    }
  }

  // Get a specific metric
  public getMetric(name: string): number | undefined {
    return this.metrics.get(name);
  }

  // Get all metrics
  public getAllMetrics(): Record<string, number> {
    const result: Record<string, number> = {};
    this.metrics.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  // Track image load performance
  public trackImageLoad(url: string): Promise<number> {
    return new Promise((resolve) => {
      const startTime = performance.now();
      const img = new Image();
      
      img.onload = () => {
        const loadTime = performance.now() - startTime;
        this.metrics.set(`image_load_${url}`, loadTime);
        resolve(loadTime);
      };
      
      img.onerror = () => {
        const loadTime = performance.now() - startTime;
        this.metrics.set(`image_error_${url}`, loadTime);
        resolve(loadTime);
      };
      
      img.src = url;
    });
  }

  // Track API call performance
  public async trackApiCall<T>(
    apiCall: () => Promise<T>,
    name: string
  ): Promise<T> {
    const startTime = performance.now();
    this.mark(`${name}_start`);
    
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      this.mark(`${name}_end`);
      this.measure(name, `${name}_start`, `${name}_end`);
      this.metrics.set(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.metrics.set(`${name}_error`, duration);
      throw error;
    }
  }

  // Get memory usage (if available)
  public getMemoryUsage(): Record<string, number> | null {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  // Cleanup observers
  public cleanup(): void {
    this.observers.forEach((observer) => {
      observer.disconnect();
    });
    this.observers.clear();
  }

  // Report performance data
  public reportPerformance(): void {
    const metrics = this.getAllMetrics();
    const memory = this.getMemoryUsage();
    
    console.log('Performance Metrics:', metrics);
    if (memory) {
      console.log('Memory Usage:', memory);
    }
  }
}

// Export singleton instance
export const performanceService = PerformanceService.getInstance(); 