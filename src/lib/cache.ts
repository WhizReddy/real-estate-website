type CacheItem = {
    data: any;
    timestamp: number;
};

const cacheStore = new Map<string, CacheItem>();

/**
 * A simple serverless-friendly in-memory cache for database queries.
 * Note: In a true serverless environment, this cache lasts per container instance.
 */
export async function getCachedData<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMS: number = 60000 // default 60 seconds
): Promise<T> {
    const item = cacheStore.get(key);
    if (item && Date.now() - item.timestamp < ttlMS) {
        return item.data as T;
    }

    const data = await fetcher();
    cacheStore.set(key, { data, timestamp: Date.now() });
    return data;
}

export function clearCache(key?: string) {
    if (key) {
        cacheStore.delete(key);
    } else {
        cacheStore.clear();
    }
}
