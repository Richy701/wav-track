type CacheItem<T> = {
  data: T;
  timestamp: number;
  id: number;
};

export class Cache {
  private static instance: Cache;
  private cache: Map<string, CacheItem<any>>;
  private prefixCounters: Map<string, Set<number>>;
  private readonly TTL = 1000 * 60 * 5; // 5 minutes default TTL

  private constructor() {
    this.cache = new Map();
    this.prefixCounters = new Map();
  }

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache();
    }
    return Cache.instance;
  }

  private ensurePrefixSet(prefix: string): Set<number> {
    if (!this.prefixCounters.has(prefix)) {
      this.prefixCounters.set(prefix, new Set());
    }
    return this.prefixCounters.get(prefix)!;
  }

  private getNextId(prefix: string): number {
    const usedIds = this.ensurePrefixSet(prefix);
    let id = 1;
    while (usedIds.has(id)) {
      id++;
    }
    usedIds.add(id);
    return id;
  }

  set<T>(key: string, data: T, ttl: number = this.TTL): void {
    const prefix = key.split('-')[0];
    const id = this.getNextId(prefix);
    
    this.cache.set(key, {
      data,
      timestamp: Date.now() + ttl,
      id
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.timestamp) {
      this.delete(key);
      return null;
    }

    return item.data as T;
  }

  delete(key: string): boolean {
    const item = this.cache.get(key);
    if (item) {
      const prefix = key.split('-')[0];
      const ids = this.ensurePrefixSet(prefix);
      ids.delete(item.id);
      
      // If this was the last item with this prefix, clean up
      if (ids.size === 0) {
        this.prefixCounters.delete(prefix);
      }
    }
    return this.cache.delete(key);
  }

  deletePrefix(prefix: string): void {
    const keysToDelete = Array.from(this.cache.keys())
      .filter(key => key.startsWith(prefix));
    
    keysToDelete.forEach(key => this.delete(key));
    this.prefixCounters.delete(prefix); // Ensure complete cleanup
  }

  clear(): void {
    this.cache.clear();
    this.prefixCounters.clear();
  }

  getKeysByPrefix(prefix: string): string[] {
    return Array.from(this.cache.keys())
      .filter(key => key.startsWith(prefix))
      .sort((a, b) => {
        const aItem = this.cache.get(a);
        const bItem = this.cache.get(b);
        return (aItem?.id || 0) - (bItem?.id || 0);
      });
  }

  getCurrentCounter(prefix: string): number {
    const ids = this.prefixCounters.get(prefix);
    if (!ids || ids.size === 0) return 0;
    return Math.max(...Array.from(ids));
  }

  invalidate(key: string): void {
    this.delete(key);
  }

  invalidateAll(): void {
    this.clear();
  }
}

export const cache = Cache.getInstance(); 