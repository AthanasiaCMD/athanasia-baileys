import makeWASocket from '../Socket/index.js';
import { type AthanasiaStats, type ConsoleOptions } from './console/events.js';
import { type LogLevel } from './console/logger.js';
import type { AthanasiaContent } from './extensions/transform.js';
export * from './console/theme.js';
export * from './console/logger.js';
export * from './console/banner.js';
export * from './console/events.js';
export * from './extensions/index.js';
export declare const ATHANASIA_NAME: string;
export declare const ATHANASIA_VERSION: string;
export declare const ATHANASIA_REPO = "https://github.com/AthanasiaCMD/athanasia-baileys";
export interface AthanasiaOptions {
    /** tampilkan banner saat start (default true) */
    banner?: boolean;
    /** level log internal baileys (default 'info'; 'silent' = diam) */
    logLevel?: LogLevel;
    /** false = matiin console events, atau kasih opsi per-bagian */
    console?: false | ConsoleOptions;
    /** info tambahan di kotak banner, mis. { bot: 'MyBot v1' } */
    bannerExtra?: Record<string, string>;
}
type CoreConfig = Parameters<typeof makeWASocket>[0];
type CoreSocket = ReturnType<typeof makeWASocket>;
export type AthanasiaSocket = CoreSocket & {
    sendAthanasia: (jid: string, content: AthanasiaContent, options?: Record<string, any>) => Promise<any>;
    athanasia: {
        stats: AthanasiaStats;
        printStats: () => void;
    };
};
/**
 * makeWASocket + banner + console cantik + fitur tambahan.
 * Semua opsi makeWASocket biasa tetap jalan.
 */
export declare const makeAthanasiaSocket: (config: CoreConfig & AthanasiaOptions) => AthanasiaSocket;
export default makeAthanasiaSocket;
