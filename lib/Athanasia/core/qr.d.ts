export interface EncodedQR {
    /** QR versi teks (siap console.log) */
    ascii: string;
}
/**
 * Encode QR jadi ASCII memakai paket `qr` (paulmillr, zero-dependency).
 * Nggak pernah reject: kalau `qr` belum ke-install, balikin string mentah + petunjuk.
 */
export declare const encodeQR: (text: string) => Promise<EncodedQR>;
