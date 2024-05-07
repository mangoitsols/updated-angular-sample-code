import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * The `Cacheable` function is a TypeScript decorator that adds caching functionality to a method.
 * @param {string} cacheKey - The `cacheKey` parameter is a string that represents the key used to
 * identify the cache entry. It is combined with the serialized arguments of the method to create a
 * unique cache key for each method call.
 * @param [options] - The `options` parameter is an optional object that can contain the following
 * properties:
 * - `ttl` - The `ttl` property is a number that represents the time to live (in milliseconds) of
 * the cache entry. If the cache entry is older than the time to live, it is considered invalid and
 * will be evicted from the cache.
 * - `maxSize` - The `maxSize` property is a number that represents the maximum number of entries
 * that can be stored in the cache. If the cache size exceeds the maximum size, the least recently
 * accessed entry will be evicted from the cache.
 * - `handleError` - The `handleError` property is a boolean that indicates whether to handle errors
 * or not. If set to `true`, the decorator will catch errors and return an empty observable instead.
 * If set to `false`, the decorator will rethrow the error.
 * @returns The `Cacheable` function returns a decorator function.
 * @example
 * // The following code snippet shows how to use the `Cacheable` decorator.
 * import { Cacheable } from '@core/helpers';
 *
 * @Cacheable('getIcon', { maxSize: 150 })
 * get(name: string): Observable<string> {
 *  return this.http.get(<url>, { responseType: 'text' });
 * }
 */
export function Cacheable(cacheKey: string, options?: { ttl?: number; maxSize?: number; handleError?: boolean }) {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;
    const cache = ((window as any).myAppCache = (window as any).myAppCache || new Map());

    descriptor.value = function (...args: any[]) {
      const key = `${cacheKey}-${JSON.stringify(args)}`;
      const now = Date.now();

      // Check if the cache exists and is valid
      if (cache.has(key)) {
        const entry = cache.get(key);
        if (!options?.ttl || now - entry.timestamp < options.ttl) {
          entry.lastAccessed = now; // Update last accessed time
          return of(entry.data);
        }
      }

      if (options?.maxSize && cache.size >= options.maxSize) {
        evictCache(cache); // Evict cache entries if max size is reached
      }

      const resultObservable: Observable<any> = originalMethod.apply(this, args);

      return resultObservable.pipe(
        tap(result => {
          cache.set(key, { data: result, timestamp: Date.now(), lastAccessed: Date.now() });
        }),
        catchError(err => {
          // Error handling logic
          return throwError(err);
        })
      );
    };

    return descriptor;
  };
}

/**
 * The function `evictCache` evicts the least recently accessed entry from a cache.
 * @param cache - The `cache` parameter is a `Map` object that stores key-value pairs. The keys are
 * strings, and the values can be of any type. The purpose of this function is to evict the least
 * recently accessed entry from the cache.
 */
function evictCache(cache: Map<string, any>) {
  let oldestKey = null;
  let oldestTime = Infinity;

  // Find the least recently accessed entry
  for (const [key, value] of cache) {
    if (value.lastAccessed < oldestTime) {
      oldestTime = value.lastAccessed;
      oldestKey = key;
    }
  }

  if (oldestKey !== null) {
    cache.delete(oldestKey); // Evict the oldest entry
  }
}
