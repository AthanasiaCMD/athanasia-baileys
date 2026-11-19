/** Mutex FIFO sederhana (pengganti createMutex starforge). */
export class Mutex {
    #tail = Promise.resolve();
    #pending = 0;
    /** true selama ada task jalan / antre */
    isLocked() {
        return this.#pending > 0;
    }
    /** jalankan fn secara eksklusif, urut sesuai antrean. Error fn nggak ngunci mutex. */
    runExclusive(fn) {
        this.#pending++;
        const run = this.#tail.then(fn, fn);
        this.#tail = run.then(() => undefined, () => undefined);
        return run.finally(() => {
            this.#pending--;
        });
    }
}
export const createMutex = () => new Mutex();
