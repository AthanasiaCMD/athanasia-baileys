import { open } from 'node:fs/promises';
const starts = (b, sig, at = 0) => sig.every((v, i) => b[at + i] === v);
const ascii = (b, from, to) => String.fromCharCode(...b.subarray(from, to));
/** deteksi tipe file dari magic bytes. Return {} kalau nggak dikenal. */
export const detectBufferType = (b) => {
    if (b.length < 4)
        return {};
    if (starts(b, [0xff, 0xd8, 0xff]))
        return { mime: 'image/jpeg', ext: 'jpg' };
    if (starts(b, [0x89, 0x50, 0x4e, 0x47]))
        return { mime: 'image/png', ext: 'png' };
    if (ascii(b, 0, 3) === 'GIF')
        return { mime: 'image/gif', ext: 'gif' };
    if (ascii(b, 0, 4) === 'RIFF' && b.length >= 12) {
        const k = ascii(b, 8, 12);
        if (k === 'WEBP')
            return { mime: 'image/webp', ext: 'webp' };
        if (k === 'WAVE')
            return { mime: 'audio/wav', ext: 'wav' };
        if (k === 'AVI ')
            return { mime: 'video/x-msvideo', ext: 'avi' };
    }
    if (ascii(b, 0, 4) === '%PDF')
        return { mime: 'application/pdf', ext: 'pdf' };
    if (ascii(b, 0, 4) === 'OggS') {
        const head = ascii(b, 28, Math.min(b.length, 40));
        if (head.includes('OpusHead'))
            return { mime: 'audio/ogg; codecs=opus', ext: 'opus' };
        return { mime: 'audio/ogg', ext: 'ogg' };
    }
    if (ascii(b, 0, 3) === 'ID3' || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0 && (b[1] & 0x06) !== 0)) {
        // ADTS AAC punya layer bits 00, mp3 punya != 00
        return (b[1] & 0x06) === 0 && b[0] === 0xff
            ? { mime: 'audio/aac', ext: 'aac' }
            : { mime: 'audio/mpeg', ext: 'mp3' };
    }
    if (b.length >= 12 && ascii(b, 4, 8) === 'ftyp') {
        const brand = ascii(b, 8, 12);
        if (brand.startsWith('M4A'))
            return { mime: 'audio/mp4', ext: 'm4a' };
        if (brand.startsWith('qt'))
            return { mime: 'video/quicktime', ext: 'mov' };
        if (brand.startsWith('3gp'))
            return { mime: 'video/3gpp', ext: '3gp' };
        if (brand.startsWith('heic') || brand.startsWith('heix') || brand.startsWith('mif1'))
            return { mime: 'image/heic', ext: 'heic' };
        return { mime: 'video/mp4', ext: 'mp4' };
    }
    if (starts(b, [0x1a, 0x45, 0xdf, 0xa3])) {
        return ascii(b, 0, Math.min(b.length, 64)).includes('webm')
            ? { mime: 'video/webm', ext: 'webm' }
            : { mime: 'video/x-matroska', ext: 'mkv' };
    }
    if (starts(b, [0x50, 0x4b, 0x03, 0x04]))
        return { mime: 'application/zip', ext: 'zip' };
    return {};
};
/** baca 64 byte pertama file lalu deteksi tipenya */
export const detectFileType = async (filePath) => {
    const fh = await open(filePath, 'r');
    try {
        const buf = Buffer.alloc(64);
        const { bytesRead } = await fh.read(buf, 0, 64, 0);
        return detectBufferType(buf.subarray(0, bytesRead));
    }
    finally {
        await fh.close();
    }
};
/**
 * Kompatibilitas: dulu diekspor starforge dan masih di-import oleh lib/Utils/messages-media.js
 * (nggak dipanggil, tapi named import yang hilang bikin ESM gagal load).
 * Terima Buffer atau path, balikin tipe file.
 */
export const detectMediaInfo = async (input) => typeof input === 'string' ? detectFileType(input) : detectBufferType(input);
