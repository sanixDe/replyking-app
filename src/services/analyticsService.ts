// Analytics service for tracking user interactions
export class AnalyticsService {
  private static instance: AnalyticsService;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // Initialize analytics (placeholder for Google Analytics)
  public initialize(): void {
    if (this.isInitialized) return;
    
    // Placeholder for Google Analytics initialization
    if (typeof window !== 'undefined' && process.env.REACT_APP_GA_ID) {
      // Google Analytics initialization would go here
      console.log('Analytics initialized');
    }
    
    this.isInitialized = true;
  }

  // Track page views
  public trackPageView(page: string): void {
    if (!this.isInitialized) return;
    
    console.log('Page view:', page);
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.REACT_APP_GA_ID, {
        page_path: page
      });
    }
  }

  // Track events
  public trackEvent(action: string, category: string, label?: string, value?: number): void {
    if (!this.isInitialized) return;
    
    console.log('Event:', { action, category, label, value });
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value
      });
    }
  }

  // Track user interactions
  public trackImageUpload(): void {
    this.trackEvent('image_upload', 'engagement', 'screenshot_uploaded');
  }

  public trackToneSelection(tone: string): void {
    this.trackEvent('tone_selection', 'engagement', `tone_${tone.toLowerCase()}`);
  }

  public trackAnalysisStart(): void {
    this.trackEvent('analysis_start', 'engagement', 'analysis_initiated');
  }

  public trackAnalysisComplete(duration: number): void {
    this.trackEvent('analysis_complete', 'engagement', 'analysis_successful', duration);
  }

  public trackCopyReply(): void {
    this.trackEvent('copy_reply', 'engagement', 'reply_copied');
  }

  public trackCopyAllReplies(): void {
    this.trackEvent('copy_all_replies', 'engagement', 'all_replies_copied');
  }

  public trackError(error: string): void {
    this.trackEvent('error', 'error', error);
  }

  // Track performance metrics
  public trackPerformance(metric: string, value: number): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name: metric,
        value: value
      });
    }
  }

  // Track user properties
  public setUserProperty(property: string, value: string): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.REACT_APP_GA_ID, {
        custom_map: {
          [property]: value
        }
      });
    }
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance(); 