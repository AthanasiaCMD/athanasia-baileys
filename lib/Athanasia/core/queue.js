/** Antrean task dengan batas concurrency (pengganti createQueue starforge). */
export class TaskQueue {
    #concurrency;
    #waiting = [];
    #running = 0;
    constructor(concurrency = 1) {
        this.#concurrency = Math.max(1, concurrency | 0);
    }
    get pending() {
        return this.#waiting.length;
    }
    get running() {
        return this.#running;
    }
    /** masukin task; resolve/reject sesuai hasil task */
    add(task) {
        return new Promise((resolve, reject) => {
            const start = () => {
                this.#running++;
                Promise.resolve()
                    .then(task)
                    .then(resolve, reject)
                    .finally(() => {
                    this.#running--;
                    this.#waiting.shift()?.();
                });
            };
            if (this.#running < this.#concurrency)
                start();
            else
                this.#waiting.push(start);
        });
    }
}
export const createQueue = (concurrency = 1) => new TaskQueue(concurrency);
