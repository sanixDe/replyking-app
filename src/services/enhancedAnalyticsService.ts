import { config } from '../config/environment';

interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  sessionId: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  category: 'timing' | 'memory' | 'error';
  timestamp: number;
}

class EnhancedAnalyticsService {
  private static instance: EnhancedAnalyticsService;
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private isEnabled: boolean;

  private constructor() {
    this.isEnabled = config.analytics.enabled;
    this.sessionId = this.generateSessionId();
    this.initialize();
  }

  public static getInstance(): EnhancedAnalyticsService {
    if (!EnhancedAnalyticsService.instance) {
      EnhancedAnalyticsService.instance = new EnhancedAnalyticsService();
    }
    return EnhancedAnalyticsService.instance;
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private initialize(): void {
    if (!this.isEnabled) return;

    // Track page view
    this.trackPageView();

    // Track performance metrics
    this.trackPerformanceMetrics();

    // Track user engagement
    this.trackUserEngagement();

    // Track errors
    this.trackErrors();
  }

  // Basic event tracking
  public trackEvent(event: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        sessionId: this.sessionId
      },
      timestamp: Date.now(),
      sessionId: this.sessionId
    };

    this.events.push(analyticsEvent);
    this.sendEvent(analyticsEvent);
  }

  // Page view tracking
  public trackPageView(): void {
    this.trackEvent('page_view', {
      path: window.location.pathname,
      referrer: document.referrer
    });
  }

  // User interaction tracking
  public trackUserInteraction(action: string, element?: string): void {
    this.trackEvent('user_interaction', {
      action,
      element,
      timestamp: Date.now()
    });
  }

  // Performance tracking
  public trackPerformance(name: string, value: number, category: 'timing' | 'memory' | 'error' = 'timing'): void {
    if (!this.isEnabled) return;

    const metric: PerformanceMetric = {
      name,
      value,
      category,
      timestamp: Date.now()
    };

    this.trackEvent('performance_metric', {
      metric,
      sessionId: this.sessionId
    });
  }

  // Error tracking
  public trackError(error: Error | string, context?: Record<string, any>): void {
    this.trackEvent('error', {
      message: typeof error === 'string' ? error : error.message,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      timestamp: Date.now()
    });
  }

  // API call tracking
  public trackApiCall(endpoint: string, duration: number, success: boolean, error?: string): void {
    this.trackEvent('api_call', {
      endpoint,
      duration,
      success,
      error,
      timestamp: Date.now()
    });
  }

  // PWA specific tracking
  public trackPWAEvent(event: 'install_prompt' | 'install_success' | 'offline_usage' | 'cache_hit'): void {
    this.trackEvent('pwa_event', {
      event,
      timestamp: Date.now()
    });
  }

  // User preference tracking
  public trackUserPreference(preference: string, value: any): void {
    this.trackEvent('user_preference', {
      preference,
      value,
      timestamp: Date.now()
    });
  }

  // Session tracking
  public trackSessionStart(): void {
    this.trackEvent('session_start', {
      sessionId: this.sessionId,
      timestamp: Date.now()
    });
  }

  public trackSessionEnd(): void {
    this.trackEvent('session_end', {
      sessionId: this.sessionId,
      duration: Date.now() - this.getSessionStartTime(),
      timestamp: Date.now()
    });
  }

  // Performance metrics collection
  private trackPerformanceMetrics(): void {
    if (!this.isEnabled) return;

    // Track Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.trackPerformance(entry.name, entry.startTime, 'timing');
          }
        });
        observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
      } catch (error) {
        console.warn('Performance tracking failed:', error);
      }
    }

    // Track memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        this.trackPerformance('memory_usage', memory.usedJSHeapSize, 'memory');
      }, 30000); // Every 30 seconds
    }
  }

  // User engagement tracking
  private trackUserEngagement(): void {
    if (!this.isEnabled) return;

    let lastActivity = Date.now();
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

    events.forEach(event => {
      document.addEventListener(event, () => {
        lastActivity = Date.now();
      }, { passive: true });
    });

    // Track engagement every 30 seconds
    setInterval(() => {
      const timeSinceLastActivity = Date.now() - lastActivity;
      this.trackPerformance('user_engagement', timeSinceLastActivity, 'timing');
    }, 30000);
  }

  // Error tracking
  private trackErrors(): void {
    if (!this.isEnabled) return;

    window.addEventListener('error', (event) => {
      this.trackError(event.error || new Error(event.message), {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(`Unhandled Promise Rejection: ${event.reason}`));
    });
  }

  // Send event to analytics service
  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.isEnabled) return;

    try {
      // Send to Google Analytics if configured
      if ('trackingId' in config.analytics && config.analytics.trackingId && (window as any).gtag) {
        (window as any).gtag('event', event.event, event.properties);
      }

      // Send to custom analytics endpoint if configured
      if (process.env.REACT_APP_ANALYTICS_ENDPOINT) {
        await fetch(process.env.REACT_APP_ANALYTICS_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event)
        });
      }
    } catch (error) {
      console.warn('Failed to send analytics event:', error);
    }
  }

  // Get session start time
  private getSessionStartTime(): number {
    const sessionStart = this.events.find(e => e.event === 'session_start');
    return sessionStart?.timestamp || Date.now();
  }

  // Get all events for debugging
  public getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  // Clear events (for privacy)
  public clearEvents(): void {
    this.events = [];
  }
}

export const enhancedAnalyticsService = EnhancedAnalyticsService.getInstance(); 