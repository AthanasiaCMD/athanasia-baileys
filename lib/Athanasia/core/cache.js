export class TTLCache {
    #map = new Map();
    #ttlMs;
    #max;
    #dispose;
    #timer;
    constructor(opts = {}) {
        this.#ttlMs = Math.max(0, (opts.ttl ?? 0) * 1000);
        this.#max = opts.max && opts.max > 0 ? opts.max : Infinity;
        this.#dispose = opts.dispose;
        const every = opts.sweepInterval ?? Math.max(opts.ttl ?? 0, 1);
        if (this.#ttlMs > 0 && every > 0) {
            this.#timer = setInterval(() => this.#sweep(), every * 1000);
            this.#timer.unref?.(); // jangan nahan proses biar bisa exit
        }
    }
    get size() {
        this.#sweep();
        return this.#map.size;
    }
    get(key) {
        const e = this.#map.get(key);
        if (!e)
            return undefined;
        if (this.#expired(e)) {
            this.#remove(key, e);
            return undefined;
        }
        // refresh posisi (LRU)
        this.#map.delete(key);
        this.#map.set(key, e);
        return e.value;
    }
    set(key, value, ttlSeconds) {
        const ttlMs = ttlSeconds != null ? ttlSeconds * 1000 : this.#ttlMs;
        this.#map.delete(key); // overwrite: tanpa dispose
        this.#map.set(key, { value, expires: ttlMs > 0 ? Date.now() + ttlMs : 0 });
        while (this.#map.size > this.#max) {
            const oldest = this.#map.keys().next().value;
            this.#remove(oldest, this.#map.get(oldest));
        }
        return true;
    }
    has(key) {
        const e = this.#map.get(key);
        if (!e)
            return false;
        if (this.#expired(e)) {
            this.#remove(key, e);
            return false;
        }
        return true;
    }
    del(keys) {
        let n = 0;
        for (const key of Array.isArray(keys) ? keys : [keys]) {
            const e = this.#map.get(key);
            if (e) {
                this.#remove(key, e);
                n++;
            }
        }
        return n;
    }
    mget(keys) {
        const out = {};
        for (const k of keys) {
            const v = this.get(k);
            if (v !== undefined)
                out[k] = v;
        }
        return out;
    }
    mset(items) {
        for (const it of items)
            this.set(it.key, (it.value ?? it.val), it.ttl);
        return true;
    }
    keys() {
        this.#sweep();
        return [...this.#map.keys()];
    }
    clear() {
        for (const [k, e] of [...this.#map])
            this.#remove(k, e);
    }
    /** alias clear() (kompatibel node-cache) */
    flushAll() {
        this.clear();
    }
    /** stop timer sweep + kosongkan cache */
    close() {
        if (this.#timer)
            clearInterval(this.#timer);
        this.#timer = undefined;
        this.clear();
    }
    #expired(e) {
        return e.expires !== 0 && e.expires <= Date.now();
    }
    #remove(key, e) {
        this.#map.delete(key);
        try {
            this.#dispose?.(e.value, key);
        }
        catch {
            /* dispose nggak boleh ngerusak cache */
        }
    }
    #sweep() {
        const now = Date.now();
        for (const [k, e] of this.#map) {
            if (e.expires !== 0 && e.expires <= now)
                this.#remove(k, e);
        }
    }
}
export const createCache = (opts = {}) => new TTLCache(opts);
