interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheService {
  private static instance: CacheService;
  private cache = new Map<string, CacheItem<any>>();

  private constructor() {
    // Load cached data from localStorage on initialization
    this.loadFromStorage();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Set cache item with TTL
  public set<T>(key: string, data: T, ttl: number = 300000): void {
    const item: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      ttl
    };

    this.cache.set(key, item);
    this.saveToStorage();
  }

  // Get cache item if not expired
  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    const isExpired = Date.now() - item.timestamp > item.ttl;
    if (isExpired) {
      this.cache.delete(key);
      this.saveToStorage();
      return null;
    }

    return item.data;
  }

  // Check if key exists and is not expired
  public has(key: string): boolean {
    return this.get(key) !== null;
  }

  // Remove specific cache item
  public delete(key: string): void {
    this.cache.delete(key);
    this.saveToStorage();
  }

  // Clear all cache
  public clear(): void {
    this.cache.clear();
    this.saveToStorage();
  }

  // Get cache size
  public size(): number {
    return this.cache.size;
  }

  // User preferences storage
  public setPreference(key: string, value: any): void {
    const preferences: Record<string, any> = this.get('user_preferences') || {};
    preferences[key] = value;
    this.set('user_preferences', preferences, 86400000); // 24 hours
  }

  public getPreference<T>(key: string, defaultValue?: T): T | null {
    const preferences: Record<string, any> = this.get('user_preferences') || {};
    return preferences[key] !== undefined ? preferences[key] : defaultValue || null;
  }

  // API response caching
  public setApiResponse(endpoint: string, params: any, response: any, ttl: number = 300000): void {
    const key = `api_${endpoint}_${JSON.stringify(params)}`;
    this.set(key, response, ttl);
  }

  public getApiResponse(endpoint: string, params: any): any {
    const key = `api_${endpoint}_${JSON.stringify(params)}`;
    return this.get(key);
  }

  // Image caching
  public setImageCache(url: string, blob: Blob): void {
    const key = `image_${url}`;
    this.set(key, blob, 86400000); // 24 hours
  }

  public getImageCache(url: string): Blob | null {
    const key = `image_${url}`;
    return this.get(key);
  }

  // Save to localStorage
  private saveToStorage(): void {
    try {
      const data = Array.from(this.cache.entries());
      localStorage.setItem('replyking_cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  // Load from localStorage
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('replyking_cache');
      if (data) {
        const entries = JSON.parse(data);
        this.cache = new Map(entries);
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
    }
  }

  // Clean expired items
  public cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.cache.forEach((item, key) => {
      if (now - item.timestamp > item.ttl) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.cache.delete(key));
    this.saveToStorage();
  }
}

export const cacheService = CacheService.getInstance(); 