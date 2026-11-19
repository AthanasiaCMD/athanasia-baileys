import { c } from './theme.js'

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent'

const LEVELS: Record<LogLevel, number> = { trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60, silent: 100 }

const BADGES: Record<Exclude<LogLevel, 'silent'>, () => string> = {
   trace: () => c.gray('TRACE'),
   debug: () => c.sky('DEBUG'),
   info: () => c.mint('INFO '),
   warn: () => c.gold('WARN '),
   error: () => c.rose('ERROR'),
   fatal: () => c.bold(c.rose('FATAL'))
}

export interface AthanasiaLogger {
   level: LogLevel
   trace: (...args: unknown[]) => void
   debug: (...args: unknown[]) => void
   info: (...args: unknown[]) => void
   warn: (...args: unknown[]) => void
   error: (...args: unknown[]) => void
   fatal: (...args: unknown[]) => void
   child: (bindings?: Record<string, unknown>) => AthanasiaLogger
   isLevelEnabled: (level: LogLevel) => boolean
}

export interface LoggerOptions {
   level?: LogLevel
   /** tampilkan jam di depan baris (default true) */
   timestamps?: boolean
   /** tulis tiap baris sebagai JSON (buat file log / pm2) */
   json?: boolean
   /** default console.log */
   write?: (line: string) => void
   bindings?: Record<string, unknown>
}

const hhmmss = (d = new Date()): string => d.toTimeString().slice(0, 8)

const short = (v: unknown, max = 90): string => {
   let s: string
   try {
      s = typeof v === 'string' ? v : JSON.stringify(v)
   } catch {
      s = String(v)
   }
   return s.length > max ? s.slice(0, max - 1) + '…' : s
}

/** Logger kompatibel pino: logger.info(msg) / logger.info(obj, msg) */
export const createLogger = (options: LoggerOptions = {}): AthanasiaLogger => {
   const { level = 'info', timestamps = true, json = false, write = (l: string) => console.log(l), bindings = {} } = options
   const threshold = LEVELS[level]

   const emit = (lvl: Exclude<LogLevel, 'silent'>, args: unknown[]) => {
      if (LEVELS[lvl] < threshold) return
      let obj: Record<string, unknown> = {}
      let msg = ''
      if (args.length && typeof args[0] === 'object' && args[0] !== null) {
         obj = args[0] as Record<string, unknown>
         msg = args[1] !== undefined ? String(args[1]) : ''
      } else {
         msg = args.map(String).join(' ')
      }
      if (obj instanceof Error) obj = { err: obj }

      if (json) {
         write(JSON.stringify({ level: lvl, time: Date.now(), ...bindings, ...obj, msg }))
         return
      }

      const scope = (bindings.module ?? bindings.class ?? obj.class) as string | undefined
      const { class: _c, module: _m, err, trace, stack, ...rest } = obj
      const extras = Object.entries(rest)
         .slice(0, 4)
         .map(([k, v]) => `${c.gray(k + '=')}${c.dim(short(v))}`)
         .join(' ')

      const parts = [
         timestamps ? c.dim(hhmmss()) : '',
         BADGES[lvl](),
         scope ? c.violet(`[${scope}]`) : '',
         msg,
         extras
      ].filter(Boolean)
      write(parts.join('  '))

      const errObj = (err ?? (trace && { stack: trace }) ?? (stack && { stack })) as { stack?: string; message?: string } | string | undefined
      if (errObj && lvl !== 'info') {
         const text = typeof errObj === 'string' ? errObj : errObj.stack ?? errObj.message ?? ''
         if (text) write(c.dim(text.split('\n').slice(0, 4).map((l) => '           ' + l).join('\n')))
      }
   }

   const logger: AthanasiaLogger = {
      level,
      trace: (...a) => emit('trace', a),
      debug: (...a) => emit('debug', a),
      info: (...a) => emit('info', a),
      warn: (...a) => emit('warn', a),
      error: (...a) => emit('error', a),
      fatal: (...a) => emit('fatal', a),
      child: (b = {}) => createLogger({ ...options, bindings: { ...bindings, ...b } }),
      isLevelEnabled: (l) => LEVELS[l] >= threshold
   }
   return logger
}
