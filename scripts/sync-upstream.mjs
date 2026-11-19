#!/usr/bin/env node
/**
 * Upgrade ke rilis baru upstream (itsliaaa/baileys) tanpa kehilangan identitas Athanasia.
 *
 *   node scripts/sync-upstream.mjs --npm 0.5.7        # ambil dari npm (butuh internet)
 *   node scripts/sync-upstream.mjs --dir ./upstream   # atau dari folder hasil `npm pack` + extract (ada lib/ & WAProto/)
 *
 * Yang dilakukan:
 *   1. ganti lib/ (KECUALI lib/Athanasia) + WAProto/ dengan versi upstream
 *   2. jalankan rebrand (identitas + util sendiri)
 *   3. catat versi upstream di package.json -> "athanasia".upstream
 *   4. jalankan check
 * Setelah itu: npm run build && npm test, cek diff `git diff`, bump version, publish.
 */
import { cpSync, rmSync, readdirSync, readFileSync, writeFileSync, mkdtempSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { UPSTREAM } from './brand.config.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : undefined }
const run = (cmd, args, opts = {}) => {
   const r = spawnSync(cmd, args, { stdio: 'inherit', cwd: root, ...opts })
   if (r.status !== 0) { console.error(`✗ gagal: ${cmd} ${args.join(' ')}`); process.exit(r.status ?? 1) }
}

let srcDir = arg('--dir') && resolve(arg('--dir'))
const wantVersion = arg('--npm')
if (!srcDir) {
   if (!wantVersion) { console.error('Pakai --npm <versi> atau --dir <folder upstream>'); process.exit(1) }
   const tmp = mkdtempSync(join(tmpdir(), 'athanasia-sync-'))
   const spec = `${UPSTREAM.npm}@${wantVersion}`
   console.log(`↓ npm pack ${spec}`)
   const packed = spawnSync('npm', ['pack', spec, '--silent'], { cwd: tmp, encoding: 'utf8' })
   if (packed.status !== 0) { console.error(packed.stderr); process.exit(1) }
   run('tar', ['-xzf', join(tmp, packed.stdout.trim().split('\n').pop()), '-C', tmp])
   srcDir = join(tmp, 'package')
}
if (!existsSync(join(srcDir, 'lib')) || !existsSync(join(srcDir, 'WAProto'))) {
   console.error(`✗ ${srcDir} nggak punya lib/ dan WAProto/`); process.exit(1)
}
const upstreamPkg = JSON.parse(readFileSync(join(srcDir, 'package.json'), 'utf8'))
console.log(`→ upstream ${upstreamPkg.name}@${upstreamPkg.version}`)

// 1. ganti lib (sisakan lib/Athanasia = kode kita)
for (const name of readdirSync(join(root, 'lib'))) if (name !== 'Athanasia') rmSync(join(root, 'lib', name), { recursive: true, force: true })
for (const name of readdirSync(join(srcDir, 'lib'))) if (name !== 'Athanasia') cpSync(join(srcDir, 'lib', name), join(root, 'lib', name), { recursive: true })
rmSync(join(root, 'WAProto'), { recursive: true, force: true })
cpSync(join(srcDir, 'WAProto'), join(root, 'WAProto'), { recursive: true })

// lib/index.js upstream nggak tahu layer Athanasia -> pastikan ke-export
const idx = join(root, 'lib/index.js')
let idxSrc = readFileSync(idx, 'utf8')
if (!idxSrc.includes("./Athanasia/index.js")) writeFileSync(idx, idxSrc.trimEnd() + "\nexport * from './Athanasia/index.js';\n")
const idxDts = join(root, 'lib/index.d.ts')
if (existsSync(idxDts) && !readFileSync(idxDts, 'utf8').includes('./Athanasia/index.js')) writeFileSync(idxDts, readFileSync(idxDts, 'utf8').trimEnd() + "\nexport * from './Athanasia/index.js';\n")

// 2. rebrand
run(process.execPath, ['scripts/rebrand.mjs'])

// 3. catat versi upstream (file internal, tidak ikut ke-publish)
writeFileSync(join(root, 'scripts/upstream.json'), JSON.stringify({ upstream: { name: upstreamPkg.name, version: upstreamPkg.version } }, null, 3) + '\n')

// 4. check
run(process.execPath, ['scripts/check.mjs'])
console.log(`\n✓ sync selesai (upstream ${upstreamPkg.version}). Lanjut: npm run build && npm test, lalu review git diff.`)
