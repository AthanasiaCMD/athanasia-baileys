/**
 * TTLCache — cache in-memory milik Athanasia (pengganti createCache dari starforge).
 * API sengaja mirip node-cache / lru-cache supaya cocok dengan `CacheStore` Baileys:
 *   get / set / del / has / mget / mset / clear / flushAll / close / size
 * ttl dalam DETIK (0 / undefined = nggak kadaluarsa).
 */
export interface CacheOptions<V = unknown> {
    /** umur entry dalam detik */
    ttl?: number;
    /** batas jumlah entry; kalau penuh entry paling lama nggak dipakai dibuang (LRU) */
    max?: number;
    /** dipanggil saat entry dibuang (expired / evicted / dihapus). TIDAK dipanggil saat overwrite */
    dispose?: (value: V, key: string) => void;
    /** interval sweep entry kadaluarsa (detik). default = max(ttl, 1) ; 0 = lazy-only */
    sweepInterval?: number;
}
export declare class TTLCache<V = any> {
    #private;
    constructor(opts?: CacheOptions<V>);
    get size(): number;
    get(key: string): V | undefined;
    set(key: string, value: V, ttlSeconds?: number): boolean;
    has(key: string): boolean;
    del(keys: string | string[]): number;
    mget(keys: string[]): Record<string, V>;
    mset(items: Array<{
        key: string;
        value?: V;
        val?: V;
        ttl?: number;
    }>): boolean;
    keys(): string[];
    clear(): void;
    /** alias clear() (kompatibel node-cache) */
    flushAll(): void;
    /** stop timer sweep + kosongkan cache */
    close(): void;
}
export declare const createCache: <V = any>(opts?: CacheOptions<V>) => TTLCache<V>;
