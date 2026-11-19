import { createRequire } from 'node:module';
import makeWASocket from '../Socket/index.js';
import { DEFAULT_CONNECTION_CONFIG } from '../Defaults/index.js';
import { printBanner } from './console/banner.js';
import { attachConsole, formatStats } from './console/events.js';
import { createLogger } from './console/logger.js';
import { applyExtensions } from './extensions/index.js';
export * from './console/theme.js';
export * from './console/logger.js';
export * from './console/banner.js';
export * from './console/events.js';
export * from './extensions/index.js';
const pkg = createRequire(import.meta.url)('../../package.json');
export const ATHANASIA_NAME = pkg.name;
export const ATHANASIA_VERSION = pkg.version;
export const ATHANASIA_REPO = 'https://github.com/AthanasiaCMD/athanasia-baileys';
/**
 * makeWASocket + banner + console cantik + fitur tambahan.
 * Semua opsi makeWASocket biasa tetap jalan.
 */
export const makeAthanasiaSocket = (config) => {
    const { banner = true, logLevel = 'info', console: consoleOpts, bannerExtra, ...core } = config;
    const waVersion = (core.version ?? DEFAULT_CONNECTION_CONFIG.version);
    if (banner) {
        printBanner({
            version: ATHANASIA_VERSION,
            waVersion: waVersion?.join('.'),
            repo: ATHANASIA_REPO.replace('https://', ''),
            extra: bannerExtra
        });
    }
    const logger = core.logger ?? createLogger({ level: logLevel });
    const sock = makeWASocket({ ...core, logger });
    applyExtensions(sock);
    const stats = consoleOpts === false ? { startedAt: Date.now(), messagesIn: 0, messagesOut: 0, reconnects: 0 } : attachConsole(sock, consoleOpts ?? {});
    sock.athanasia = { stats, printStats: () => console.log(formatStats(stats)) };
    return sock;
};
export default makeAthanasiaSocket;
