/**
 * Selalu balikin path file TEMP BARU (buffer ditulis, path disalin) —
 * jadi pemanggil aman buat `unlink` setelah selesai tanpa ngehapus file asli.
 */
export declare const getFile: (input: Buffer | Uint8Array | string) => Promise<string>;
export interface AudioWaveform {
    durationSeconds: number;
    /** 64 nilai 0..100 (format waveform voice note WhatsApp) */
    waveform: Uint8Array;
}
/** hitung durasi + waveform 64-bar dari file audio (butuh ffmpeg di PATH, atau env FFMPEG_PATH) */
export declare const getAudioWaveform: (filePath: string) => Promise<AudioWaveform>;
