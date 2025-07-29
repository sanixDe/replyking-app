export interface EnvironmentConfig {
  isProduction: boolean;
  isDevelopment: boolean;
  apiBaseUrl: string;
  geminiModel: string;
  enableAnalytics: boolean;
  enableErrorReporting: boolean;
  enablePWA: boolean;
}

const getEnvironmentConfig = (): EnvironmentConfig => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    isProduction,
    isDevelopment,
    apiBaseUrl: process.env.REACT_APP_API_BASE_URL || 'https://generativelanguage.googleapis.com',
    geminiModel: process.env.REACT_APP_GEMINI_MODEL || 'gemini-2.5-flash',
    enableAnalytics: isProduction && process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
    enableErrorReporting: isProduction && process.env.REACT_APP_ENABLE_ERROR_REPORTING === 'true',
    enablePWA: true, // Always enable PWA features
  };
};

export const env = getEnvironmentConfig();

// Production-specific configurations
export const productionConfig = {
  // Disable console logs in production
  logLevel: env.isProduction ? 'error' : 'debug',
  
  // API rate limiting
  apiRateLimit: {
    maxRequests: 10,
    windowMs: 60000, // 1 minute
  },
  
  // Error reporting
  errorReporting: {
    enabled: env.enableErrorReporting,
    endpoint: process.env.REACT_APP_ERROR_REPORTING_ENDPOINT || undefined,
  },
  
  // Analytics
  analytics: {
    enabled: env.enableAnalytics,
    trackingId: process.env.REACT_APP_GA_ID,
  },
  
  // PWA settings
  pwa: {
    enabled: env.enablePWA,
    cacheStrategy: 'network-first',
    offlineFallback: '/offline.html',
  },
  
  // Performance monitoring
  performance: {
    enabled: env.isProduction,
    reportTo: process.env.REACT_APP_PERFORMANCE_ENDPOINT,
  },
};

// Development-specific configurations
export const developmentConfig = {
  logLevel: 'debug',
  apiRateLimit: {
    maxRequests: 100,
    windowMs: 60000,
  },
  errorReporting: {
    enabled: false,
    endpoint: undefined,
  },
  analytics: {
    enabled: false,
  },
  pwa: {
    enabled: true,
    cacheStrategy: 'network-first',
  },
  performance: {
    enabled: false,
  },
};

export const config = env.isProduction ? productionConfig : developmentConfig; 