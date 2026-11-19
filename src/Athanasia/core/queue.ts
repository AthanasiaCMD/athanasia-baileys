/** Antrean task dengan batas concurrency (pengganti createQueue starforge). */
export class TaskQueue {
   readonly #concurrency: number
   readonly #waiting: Array<() => void> = []
   #running = 0

   constructor(concurrency = 1) {
      this.#concurrency = Math.max(1, concurrency | 0)
   }

   get pending(): number {
      return this.#waiting.length
   }

   get running(): number {
      return this.#running
   }

   /** masukin task; resolve/reject sesuai hasil task */
   add<T>(task: () => T | Promise<T>): Promise<T> {
      return new Promise<T>((resolve, reject) => {
         const start = () => {
            this.#running++
            Promise.resolve()
               .then(task)
               .then(resolve, reject)
               .finally(() => {
                  this.#running--
                  this.#waiting.shift()?.()
               })
         }
         if (this.#running < this.#concurrency) start()
         else this.#waiting.push(start)
      })
   }
}

export const createQueue = (concurrency = 1): TaskQueue => new TaskQueue(concurrency)
