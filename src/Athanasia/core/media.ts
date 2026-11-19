import { spawn } from 'node:child_process'
import { copyFile, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'

/**
 * Selalu balikin path file TEMP BARU (buffer ditulis, path disalin) —
 * jadi pemanggil aman buat `unlink` setelah selesai tanpa ngehapus file asli.
 */
export const getFile = async (input: Buffer | Uint8Array | string): Promise<string> => {
   const out = join(tmpdir(), `athanasia-${randomBytes(8).toString('hex')}`)
   if (typeof input === 'string') await copyFile(input, out)
   else await writeFile(out, input)
   return out
}

export interface AudioWaveform {
   durationSeconds: number
   /** 64 nilai 0..100 (format waveform voice note WhatsApp) */
   waveform: Uint8Array
}

const SAMPLE_RATE = 16000
const BARS = 64

const decodePcm = (filePath: string, ffmpeg: string): Promise<Buffer> =>
   new Promise((resolve, reject) => {
      const p = spawn(ffmpeg, ['-v', 'error', '-i', filePath, '-vn', '-f', 's16le', '-ac', '1', '-ar', String(SAMPLE_RATE), '-'], {
         stdio: ['ignore', 'pipe', 'pipe']
      })
      const out: Buffer[] = []
      let err = ''
      p.stdout.on('data', (c: Buffer) => out.push(c))
      p.stderr.on('data', (c: Buffer) => (err += c))
      p.on('error', (e: Error) => reject(new Error(`ffmpeg tidak bisa dijalankan (${e.message}). Install ffmpeg buat waveform & durasi voice note.`)))
      p.on('close', (code: number | null) => (code === 0 ? resolve(Buffer.concat(out)) : reject(new Error(`ffmpeg exit ${code}: ${err.trim()}`))))
   })

/** hitung durasi + waveform 64-bar dari file audio (butuh ffmpeg di PATH, atau env FFMPEG_PATH) */
export const getAudioWaveform = async (filePath: string): Promise<AudioWaveform> => {
   const pcm = await decodePcm(filePath, process.env.FFMPEG_PATH || 'ffmpeg')
   const samples = Math.floor(pcm.length / 2)
   if (samples === 0) throw new Error('audio kosong / tidak bisa didecode')
   const block = Math.max(1, Math.floor(samples / BARS))
   const avg = new Float64Array(BARS)
   let max = 0
   for (let i = 0; i < BARS; i++) {
      let sum = 0
      const from = i * block
      const to = Math.min(from + block, samples)
      for (let j = from; j < to; j++) sum += Math.abs(pcm.readInt16LE(j * 2)) / 32768
      avg[i] = to > from ? sum / (to - from) : 0
      if (avg[i]! > max) max = avg[i]!
   }
   const mul = max > 0 ? 1 / max : 0
   const waveform = new Uint8Array(BARS)
   for (let i = 0; i < BARS; i++) waveform[i] = Math.min(100, Math.floor(avg[i]! * mul * 100))
   return { durationSeconds: Math.round(samples / SAMPLE_RATE), waveform }
}
