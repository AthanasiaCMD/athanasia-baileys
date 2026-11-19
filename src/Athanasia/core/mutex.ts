/** Mutex FIFO sederhana (pengganti createMutex starforge). */
export class Mutex {
   #tail: Promise<unknown> = Promise.resolve()
   #pending = 0

   /** true selama ada task jalan / antre */
   isLocked(): boolean {
      return this.#pending > 0
   }

   /** jalankan fn secara eksklusif, urut sesuai antrean. Error fn nggak ngunci mutex. */
   runExclusive<T>(fn: () => T | Promise<T>): Promise<T> {
      this.#pending++
      const run = this.#tail.then(fn, fn as () => never)
      this.#tail = run.then(
         () => undefined,
         () => undefined
      )
      return run.finally(() => {
         this.#pending--
      }) as Promise<T>
   }
}

export const createMutex = (): Mutex => new Mutex()
