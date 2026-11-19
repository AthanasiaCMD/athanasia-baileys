/**
 * Penulis ZIP minimal (metode STORE, tanpa kompresi) — cukup buat sticker pack
 * karena isinya sudah webp (nggak bisa dikompres lagi).
 */
export interface ZipEntry {
    name: string;
    data: Uint8Array | Buffer;
}
export declare const crc32: (buf: Uint8Array) => number;
/** entries boleh array atau object (key bebas, value {name,data}) */
export declare const createZip: (entries: ZipEntry[] | Record<string, ZipEntry>, now?: Date) => Promise<Buffer>;
