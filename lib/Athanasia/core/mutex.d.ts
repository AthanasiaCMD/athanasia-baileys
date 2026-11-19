/** Mutex FIFO sederhana (pengganti createMutex starforge). */
export declare class Mutex {
    #private;
    /** true selama ada task jalan / antre */
    isLocked(): boolean;
    /** jalankan fn secara eksklusif, urut sesuai antrean. Error fn nggak ngunci mutex. */
    runExclusive<T>(fn: () => T | Promise<T>): Promise<T>;
}
export declare const createMutex: () => Mutex;
