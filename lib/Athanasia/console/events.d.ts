import type { AthanasiaLogger } from './logger.js';
export interface ConsoleOptions {
    connection?: boolean;
    messages?: boolean;
    groups?: boolean;
    calls?: boolean;
    /** panjang maksimum preview teks pesan */
    maxText?: number;
    write?: (line: string) => void;
    logger?: AthanasiaLogger;
}
export interface AthanasiaStats {
    startedAt: number;
    messagesIn: number;
    messagesOut: number;
    reconnects: number;
    lastDisconnect?: number;
}
export declare const shortJid: (jid?: string | null) => string;
export declare const formatPairingCode: (code: string) => string;
/**
 * Pasang console cantik ke socket. Mengembalikan stats hidup (dipakai juga `sock.athanasia.stats`).
 */
export declare const attachConsole: (sock: any, options?: ConsoleOptions) => AthanasiaStats;
export declare const formatStats: (s: AthanasiaStats) => string;
