import { Request, Response, NextFunction } from "express";

interface CacheEntry {
  data: any;
  expiresAt: number;
}

const memoryCache = new Map<string, CacheEntry>();

/**
 * Short-TTL response caching middleware.
 * Caches idempotent GET requests (e.g. campus analytics, pickup hubs) to eliminate database load.
 *
 * @param ttlSeconds Cache time-to-live in seconds (default: 60)
 */
export function cacheMiddleware(ttlSeconds = 60) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Only cache GET requests
    if (req.method !== "GET") {
      next();
      return;
    }

    const cacheKey = `cache:${req.originalUrl || req.url}`;
    const cached = memoryCache.get(cacheKey);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      res.setHeader("X-Cache-Lookup", "HIT");
      res.status(200).json(cached.data);
      return;
    }

    res.setHeader("X-Cache-Lookup", "MISS");

    // Intercept res.json to populate cache
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      if (res.statusCode === 200) {
        memoryCache.set(cacheKey, {
          data: body,
          expiresAt: Date.now() + ttlSeconds * 1000,
        });
      }
      return originalJson(body);
    };

    next();
  };
}

/**
 * Invalidate cached routes matching a key pattern
 */
export function clearCache(pattern?: string): void {
  if (!pattern) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(pattern)) {
      memoryCache.delete(key);
    }
  }
}
