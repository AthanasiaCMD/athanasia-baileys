export interface DetectedType {
    mime?: string;
    ext?: string;
}
/** deteksi tipe file dari magic bytes. Return {} kalau nggak dikenal. */
export declare const detectBufferType: (b: Uint8Array) => DetectedType;
/** baca 64 byte pertama file lalu deteksi tipenya */
export declare const detectFileType: (filePath: string) => Promise<DetectedType>;
/**
 * Kompatibilitas: dulu diekspor starforge dan masih di-import oleh lib/Utils/messages-media.js
 * (nggak dipanggil, tapi named import yang hilang bikin ESM gagal load).
 * Terima Buffer atau path, balikin tipe file.
 */
export declare const detectMediaInfo: (input: Uint8Array | string) => Promise<DetectedType>;
