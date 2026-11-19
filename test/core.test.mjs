import test from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { writeFileSync, mkdtempSync, existsSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
   createCache, createMutex, createQueue, createZip, crc32,
   detectFileType, detectBufferType, getFile, getAudioWaveform, encodeQR
} from '../lib/Athanasia/core/index.js'

const sleep = ms => new Promise(r => setTimeout(r, ms))

test('cache: get/set/del/has + overwrite tanpa dispose', () => {
   const disposed = []
   const c = createCache({ ttl: 0, dispose: (v, k) => disposed.push(k) })
   c.set('a', 1); c.set('a', 2)
   assert.equal(c.get('a'), 2)
   assert.deepEqual(disposed, [])
   assert.equal(c.has('a'), true)
   assert.equal(c.del('a'), 1)
   assert.deepEqual(disposed, ['a'])
   assert.equal(c.get('a'), undefined)
   c.close()
})

test('cache: ttl kadaluarsa + dispose terpanggil', async () => {
   const disposed = []
   const c = createCache({ ttl: 0.05, dispose: (_v, k) => disposed.push(k) })
   c.set('x', 1)
   await sleep(90)
   assert.equal(c.get('x'), undefined)
   assert.deepEqual(disposed, ['x'])
   c.close()
})

test('cache: max = LRU eviction', () => {
   const c = createCache({ max: 2 })
   c.set('a', 1); c.set('b', 2); c.get('a'); c.set('c', 3)
   assert.equal(c.has('b'), false)
   assert.equal(c.has('a'), true)
   assert.equal(c.has('c'), true)
   c.close()
})

test('cache: mget/mset/flushAll/close', () => {
   const c = createCache({ ttl: 60 })
   c.mset([{ key: 'a', value: 1 }, { key: 'b', val: 2 }])
   assert.deepEqual(c.mget(['a', 'b', 'zz']), { a: 1, b: 2 })
   c.flushAll()
   assert.equal(c.size, 0)
   c.close()
})

test('mutex: urut FIFO, isLocked, error nggak ngunci', async () => {
   const m = createMutex()
   const order = []
   const p1 = m.runExclusive(async () => { await sleep(30); order.push(1) })
   const p2 = m.runExclusive(() => { order.push(2) })
   assert.equal(m.isLocked(), true)
   await Promise.all([p1, p2])
   assert.deepEqual(order, [1, 2])
   assert.equal(m.isLocked(), false)
   await assert.rejects(m.runExclusive(() => { throw new Error('boom') }), /boom/)
   assert.equal(await m.runExclusive(() => 'ok'), 'ok')
})

test('queue(1): serial; queue(2): paralel max 2', async () => {
   const run = async n => {
      const q = createQueue(n); let cur = 0, peak = 0
      await Promise.all([1, 2, 3, 4].map(() => q.add(async () => { peak = Math.max(peak, ++cur); await sleep(15); cur-- })))
      return peak
   }
   assert.equal(await run(1), 1)
   assert.equal(await run(2), 2)
})

test('zip: valid (python zipfile + unzip -t) & crc32', async () => {
   assert.equal(crc32(Buffer.from('123456789')), 0xcbf43926)
   const buf = await createZip([{ name: 'a.webp', data: Buffer.from('hello') }, { name: 'tray.png', data: Buffer.alloc(1000, 7) }])
   const dir = mkdtempSync(join(tmpdir(), 'zt-')); const f = join(dir, 't.zip'); writeFileSync(f, buf)
   const out = execFileSync('python3', ['-c', 'import zipfile,sys;z=zipfile.ZipFile(sys.argv[1]);print(z.testzip());print(sorted(z.namelist()));print(z.read("a.webp"))', f]).toString()
   assert.match(out, /^None/)
   assert.match(out, /a\.webp/)
   assert.match(out, /b'hello'/)
   // object-style (kayak yang dipakai sticker pack)
   const buf2 = await createZip({ 0: { name: 'x.webp', data: Buffer.from('z') } })
   assert.ok(buf2.length > 0)
})

test('file-type: magic bytes', () => {
   const T = (bytes) => detectBufferType(Buffer.from(bytes))
   assert.equal(T([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0]).mime, 'image/jpeg')
   assert.equal(T([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0]).mime, 'image/png')
   assert.equal(detectBufferType(Buffer.from('RIFF\0\0\0\0WEBPVP8 ')).mime, 'image/webp')
   assert.equal(detectBufferType(Buffer.from('\0\0\0\x18ftypmp42')).mime, 'video/mp4')
   assert.equal(detectBufferType(Buffer.from('\0\0\0\x18ftypM4A ')).mime, 'audio/mp4')
   assert.equal(detectBufferType(Buffer.from('%PDF-1.7')).mime, 'application/pdf')
   assert.equal(detectBufferType(Buffer.from('ID3\x03\0\0\0\0\0\0')).mime, 'audio/mpeg')
   assert.deepEqual(detectBufferType(Buffer.from('random-text-here')), {})
})

test('detectFileType(path) + getFile (selalu temp baru)', async () => {
   const dir = mkdtempSync(join(tmpdir(), 'ft-')); const f = join(dir, 'x.bin')
   writeFileSync(f, Buffer.from([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4]))
   assert.equal((await detectFileType(f)).mime, 'image/png')
   const copy = await getFile(f)
   assert.notEqual(copy, f); assert.ok(existsSync(copy)); unlinkSync(copy)
   assert.ok(existsSync(f)) // file asli aman
   const fromBuf = await getFile(Buffer.from('abc')); assert.ok(existsSync(fromBuf)); unlinkSync(fromBuf)
})

const hasFfmpeg = spawnSync('ffmpeg', ['-version']).status === 0
test('waveform + durasi (butuh ffmpeg)', { skip: !hasFfmpeg && 'ffmpeg tidak ada' }, async () => {
   const dir = mkdtempSync(join(tmpdir(), 'wf-')); const f = join(dir, 's.wav')
   execFileSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', 'sine=frequency=440:duration=2', '-af', 'volume=0.5', f])
   const r = await getAudioWaveform(f)
   assert.equal(r.durationSeconds, 2)
   assert.equal(r.waveform.length, 64)
   assert.ok(Math.max(...r.waveform) === 100)
})

test('waveform: error jelas kalau ffmpeg tidak ada', async () => {
   const old = process.env.FFMPEG_PATH; process.env.FFMPEG_PATH = '/nonexistent/ffmpeg'
   await assert.rejects(getAudioWaveform('/tmp/x'), /ffmpeg/)
   if (old === undefined) delete process.env.FFMPEG_PATH; else process.env.FFMPEG_PATH = old
})

test('encodeQR: nggak pernah reject', async () => {
   const r = await encodeQR('hello')
   assert.equal(typeof r.ascii, 'string'); assert.ok(r.ascii.length > 0)
})
