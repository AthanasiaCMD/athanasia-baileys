export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent';
export interface AthanasiaLogger {
    level: LogLevel;
    trace: (...args: unknown[]) => void;
    debug: (...args: unknown[]) => void;
    info: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    fatal: (...args: unknown[]) => void;
    child: (bindings?: Record<string, unknown>) => AthanasiaLogger;
    isLevelEnabled: (level: LogLevel) => boolean;
}
export interface LoggerOptions {
    level?: LogLevel;
    /** tampilkan jam di depan baris (default true) */
    timestamps?: boolean;
    /** tulis tiap baris sebagai JSON (buat file log / pm2) */
    json?: boolean;
    /** default console.log */
    write?: (line: string) => void;
    bindings?: Record<string, unknown>;
}
/** Logger kompatibel pino: logger.info(msg) / logger.info(obj, msg) */
export declare const createLogger: (options?: LoggerOptions) => AthanasiaLogger;
