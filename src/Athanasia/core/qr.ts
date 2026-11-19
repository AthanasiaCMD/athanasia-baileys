export interface EncodedQR {
   /** QR versi teks (siap console.log) */
   ascii: string
}

/**
 * Encode QR jadi ASCII memakai paket `qr` (paulmillr, zero-dependency).
 * Nggak pernah reject: kalau `qr` belum ke-install, balikin string mentah + petunjuk.
 */
export const encodeQR = async (text: string): Promise<EncodedQR> => {
   try {
      const mod: any = await import('qr')
      const fn = mod.default ?? mod.encodeQR ?? mod
      return { ascii: String(fn(text, 'ascii')) }
   } catch {
      return { ascii: `[install paket "qr" buat tampilan QR di terminal]\n${text}` }
   }
}
