/**
 * TTLCache — cache in-memory milik Athanasia (pengganti createCache dari starforge).
 * API sengaja mirip node-cache / lru-cache supaya cocok dengan `CacheStore` Baileys:
 *   get / set / del / has / mget / mset / clear / flushAll / close / size
 * ttl dalam DETIK (0 / undefined = nggak kadaluarsa).
 */
export interface CacheOptions<V = unknown> {
   /** umur entry dalam detik */
   ttl?: number
   /** batas jumlah entry; kalau penuh entry paling lama nggak dipakai dibuang (LRU) */
   max?: number
   /** dipanggil saat entry dibuang (expired / evicted / dihapus). TIDAK dipanggil saat overwrite */
   dispose?: (value: V, key: string) => void
   /** interval sweep entry kadaluarsa (detik). default = max(ttl, 1) ; 0 = lazy-only */
   sweepInterval?: number
}

interface Entry<V> {
   value: V
   expires: number // epoch ms, 0 = never
}

export class TTLCache<V = any> {
   readonly #map = new Map<string, Entry<V>>()
   readonly #ttlMs: number
   readonly #max: number
   readonly #dispose?: (value: V, key: string) => void
   #timer?: ReturnType<typeof setInterval>

   constructor(opts: CacheOptions<V> = {}) {
      this.#ttlMs = Math.max(0, (opts.ttl ?? 0) * 1000)
      this.#max = opts.max && opts.max > 0 ? opts.max : Infinity
      this.#dispose = opts.dispose
      const every = opts.sweepInterval ?? Math.max(opts.ttl ?? 0, 1)
      if (this.#ttlMs > 0 && every > 0) {
         this.#timer = setInterval(() => this.#sweep(), every * 1000)
         this.#timer.unref?.() // jangan nahan proses biar bisa exit
      }
   }

   get size(): number {
      this.#sweep()
      return this.#map.size
   }

   get(key: string): V | undefined {
      const e = this.#map.get(key)
      if (!e) return undefined
      if (this.#expired(e)) {
         this.#remove(key, e)
         return undefined
      }
      // refresh posisi (LRU)
      this.#map.delete(key)
      this.#map.set(key, e)
      return e.value
   }

   set(key: string, value: V, ttlSeconds?: number): boolean {
      const ttlMs = ttlSeconds != null ? ttlSeconds * 1000 : this.#ttlMs
      this.#map.delete(key) // overwrite: tanpa dispose
      this.#map.set(key, { value, expires: ttlMs > 0 ? Date.now() + ttlMs : 0 })
      while (this.#map.size > this.#max) {
         const oldest = this.#map.keys().next().value as string
         this.#remove(oldest, this.#map.get(oldest)!)
      }
      return true
   }

   has(key: string): boolean {
      const e = this.#map.get(key)
      if (!e) return false
      if (this.#expired(e)) {
         this.#remove(key, e)
         return false
      }
      return true
   }

   del(keys: string | string[]): number {
      let n = 0
      for (const key of Array.isArray(keys) ? keys : [keys]) {
         const e = this.#map.get(key)
         if (e) {
            this.#remove(key, e)
            n++
         }
      }
      return n
   }

   mget(keys: string[]): Record<string, V> {
      const out: Record<string, V> = {}
      for (const k of keys) {
         const v = this.get(k)
         if (v !== undefined) out[k] = v
      }
      return out
   }

   mset(items: Array<{ key: string; value?: V; val?: V; ttl?: number }>): boolean {
      for (const it of items) this.set(it.key, (it.value ?? it.val) as V, it.ttl)
      return true
   }

   keys(): string[] {
      this.#sweep()
      return [...this.#map.keys()]
   }

   clear(): void {
      for (const [k, e] of [...this.#map]) this.#remove(k, e)
   }

   /** alias clear() (kompatibel node-cache) */
   flushAll(): void {
      this.clear()
   }

   /** stop timer sweep + kosongkan cache */
   close(): void {
      if (this.#timer) clearInterval(this.#timer)
      this.#timer = undefined
      this.clear()
   }

   #expired(e: Entry<V>): boolean {
      return e.expires !== 0 && e.expires <= Date.now()
   }

   #remove(key: string, e: Entry<V>): void {
      this.#map.delete(key)
      try {
         this.#dispose?.(e.value, key)
      } catch {
         /* dispose nggak boleh ngerusak cache */
      }
   }

   #sweep(): void {
      const now = Date.now()
      for (const [k, e] of this.#map) {
         if (e.expires !== 0 && e.expires <= now) this.#remove(k, e)
      }
   }
}

export const createCache = <V = any>(opts: CacheOptions<V> = {}): TTLCache<V> => new TTLCache<V>(opts)
