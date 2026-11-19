#!/usr/bin/env node
/**
 * Rebrand idempotent: ubah bagian lib/ (hasil upstream) jadi identitas Athanasia.
 * Aman dijalankan berulang. Kalau upstream berubah dan sebuah aturan nggak nemu target,
 * script gagal (exit 1) dan bilang aturan mana — jadi nggak ada rebrand yang diam-diam bolong.
 *
 *   node scripts/rebrand.mjs           # terapkan
 *   node scripts/rebrand.mjs --check   # cuma cek (exit 1 kalau ada yang belum ke-rebrand)
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BRAND } from './brand.config.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.includes('--check')
const esc = x => x.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')

/** @type {{id:string,file:string,find:RegExp,replace:string|((...a:any[])=>string),done:RegExp}[]} */
const rules = [
   {
      id: 'util-starforge -> core sendiri',
      file: 'lib/Addon/index.js',
      find: /export \{[^}]*\} from '@itsliaaa\/starforge';/,
      replace: `export { createCache, createMutex, createQueue, createZip, detectFileType, detectMediaInfo, encodeQR, getAudioWaveform, getFile } from '../Athanasia/core/index.js';`,
      done: /from '\.\.\/Athanasia\/core\/index\.js'/
   },
   {
      id: 'LIBRARY_NAME',
      file: 'lib/Defaults/index.js',
      find: /export const LIBRARY_NAME = '[^']*';/,
      replace: `export const LIBRARY_NAME = '${BRAND.name}';`,
      done: new RegExp(`LIBRARY_NAME = '${esc(BRAND.name)}'`)
   },
   {
      id: 'LIBRARY_NAME (typing)',
      file: 'lib/Defaults/index.d.ts',
      find: /export const LIBRARY_NAME: "[^"]*";/,
      replace: `export const LIBRARY_NAME: "${BRAND.name}";`,
      done: new RegExp(`LIBRARY_NAME: "${esc(BRAND.name)}"`)
   },
   {
      id: 'DONATE_URL',
      file: 'lib/Defaults/index.js',
      find: /export const DONATE_URL = '[^']*';[^\n]*/,
      replace: `export const DONATE_URL = '${BRAND.npmUrl}';`,
      done: new RegExp(`DONATE_URL = '${esc(BRAND.npmUrl)}'`)
   },
   {
      id: 'DONATE_URL (typing)',
      file: 'lib/Defaults/index.d.ts',
      find: /export const DONATE_URL: "[^"]*";/,
      replace: `export const DONATE_URL: "${BRAND.npmUrl}";`,
      done: new RegExp(`DONATE_URL: "${esc(BRAND.npmUrl)}"`)
   },
   {
      id: 'logger class',
      file: 'lib/Defaults/index.js',
      find: /logger\.child\(\{ class: 'baileys' \}\)/,
      replace: `logger.child({ class: '${BRAND.loggerClass}' })`,
      done: new RegExp(`class: '${BRAND.loggerClass}'`)
   },
   {
      id: 'sumber versi WA (fetchLatestBaileysVersion) -> npm CDN',
      file: 'lib/Utils/generics.js',
      find: /https:\/\/(?:raw\.githubusercontent\.com\/[^/']+\/[^/']+\/[\w.-]+|cdn\.jsdelivr\.net\/npm\/[^']+?)\/lib\/Defaults\/index\.js/,
      replace: BRAND.versionSource,
      done: new RegExp(esc(BRAND.versionSource))
   },
   {
      id: 'default sticker pack publisher',
      file: 'lib/Utils/messages.js',
      find: /publisher = '[^']*'/,
      replace: `publisher = '${BRAND.display}'`,
      done: new RegExp(`publisher = '${BRAND.display}'`)
   },
   {
      id: 'default sticker pack description',
      file: 'lib/Utils/messages.js',
      find: /description = '🏷️ [^']*'/,
      replace: `description = '🏷️ ${BRAND.name}'`,
      done: new RegExp(`description = '🏷️ ${esc(BRAND.name)}'`)
   },
   {
      id: 'Browsers.athanasia',
      file: 'lib/Utils/browser-utils.js',
      find: /(\n(\s*)baileys: browser => \['Baileys', browser, '6\.5\.0'\],)/,
      replace: (m, _all, indent) => `${m}\n${indent}${BRAND.browserKey}: browser => ['${BRAND.browserName}', browser, '1.0.0'],`,
      done: new RegExp(`${BRAND.browserKey}: browser =>`)
   },
   {
      id: 'Browsers.athanasia (typing)',
      file: 'lib/Utils/browser-utils.d.ts',
      find: /(\n(\s*)function baileys\(browser: any\): any\[\];)/,
      replace: (m, _all, indent) => `${m}\n${indent}function ${BRAND.browserKey}(browser: any): any[];`,
      done: new RegExp(`function ${BRAND.browserKey}\\(browser`)
   }
]

let bad = 0
for (const r of rules) {
   const p = join(root, r.file)
   if (!existsSync(p)) { console.log(`✗ ${r.id}  (file ${r.file} tidak ada)`); bad++; continue }
   const src = readFileSync(p, 'utf8')
   if (r.done.test(src)) { console.log(`· ${r.id}  (sudah)`); continue }
   if (!r.find.test(src)) { console.log(`✗ ${r.id}  (target tidak ketemu di ${r.file} — upstream berubah? sesuaikan scripts/rebrand.mjs)`); bad++; continue }
   if (checkOnly) { console.log(`✗ ${r.id}  (belum di-rebrand)`); bad++; continue }
   writeFileSync(p, src.replace(r.find, r.replace))
   console.log(`✓ ${r.id}`)
}
process.exit(bad ? 1 : 0)
