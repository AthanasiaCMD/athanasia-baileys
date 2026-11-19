/** Antrean task dengan batas concurrency (pengganti createQueue starforge). */
export declare class TaskQueue {
    #private;
    constructor(concurrency?: number);
    get pending(): number;
    get running(): number;
    /** masukin task; resolve/reject sesuai hasil task */
    add<T>(task: () => T | Promise<T>): Promise<T>;
}
export declare const createQueue: (concurrency?: number) => TaskQueue;
