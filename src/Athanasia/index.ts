import { createRequire } from 'node:module'
import makeWASocket from '../Socket/index.js'
import { DEFAULT_CONNECTION_CONFIG } from '../Defaults/index.js'
import { printBanner } from './console/banner.js'
import { attachConsole, formatStats, type AthanasiaStats, type ConsoleOptions } from './console/events.js'
import { createLogger, type LogLevel } from './console/logger.js'
import { applyExtensions } from './extensions/index.js'
import type { AthanasiaContent } from './extensions/transform.js'

export * from './console/theme.js'
export * from './console/logger.js'
export * from './console/banner.js'
export * from './console/events.js'
export * from './extensions/index.js'

const pkg = createRequire(import.meta.url)('../../package.json') as { name: string; version: string; repository?: { url?: string } }

export const ATHANASIA_NAME = pkg.name
export const ATHANASIA_VERSION = pkg.version
export const ATHANASIA_REPO = 'https://www.npmjs.com/package/@athanasiacmd/baileys'

export interface AthanasiaOptions {
   /** tampilkan banner saat start (default true) */
   banner?: boolean
   /** level log internal baileys (default 'info'; 'silent' = diam) */
   logLevel?: LogLevel
   /** false = matiin console events, atau kasih opsi per-bagian */
   console?: false | ConsoleOptions
   /** info tambahan di kotak banner, mis. { bot: 'MyBot v1' } */
   bannerExtra?: Record<string, string>
}

type CoreConfig = Parameters<typeof makeWASocket>[0]
type CoreSocket = ReturnType<typeof makeWASocket>

export type AthanasiaSocket = CoreSocket & {
   sendAthanasia: (jid: string, content: AthanasiaContent, options?: Record<string, any>) => Promise<any>
   athanasia: { stats: AthanasiaStats; printStats: () => void }
}

/**
 * makeWASocket + banner + console cantik + fitur tambahan.
 * Semua opsi makeWASocket biasa tetap jalan.
 */
export const makeAthanasiaSocket = (config: CoreConfig & AthanasiaOptions): AthanasiaSocket => {
   const { banner = true, logLevel = 'info', console: consoleOpts, bannerExtra, ...core } = config as any

   const waVersion = (core.version ?? DEFAULT_CONNECTION_CONFIG.version) as number[] | undefined
   if (banner) {
      printBanner({
         version: ATHANASIA_VERSION,
         waVersion: waVersion?.join('.'),
         repo: ATHANASIA_REPO.replace('https://', ''),
         extra: bannerExtra
      })
   }

   const logger = core.logger ?? createLogger({ level: logLevel })
   const sock = makeWASocket({ ...core, logger }) as any

   applyExtensions(sock)
   const stats = consoleOpts === false ? ({ startedAt: Date.now(), messagesIn: 0, messagesOut: 0, reconnects: 0 } as AthanasiaStats) : attachConsole(sock, consoleOpts ?? {})
   sock.athanasia = { stats, printStats: () => console.log(formatStats(stats)) }

   return sock as AthanasiaSocket
}

export default makeAthanasiaSocket
