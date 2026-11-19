#!/usr/bin/env node
/**
 * Sanity check tanpa install dependency:
 *  1. nggak ada sisa import @itsliaaa/starforge / paket upstream di lib + package.json
 *  2. semua import relatif di lib/ nunjuk file yang ada
 *  3. semua named import dari modul relatif beneran di-export (ini yang nangkep "does not provide an export named ...")
 *  4. rebrand sudah lengkap
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const libDir = join(root, 'lib')
const problems = []

const walk = d => readdirSync(d).flatMap(n => {
   const p = join(d, n)
   return statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') ? [p] : []
})
const files = walk(libDir)
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '')
const cache = new Map()

/** kumpulin nama export sebuah modul (rekursif untuk `export * from`) */
function exportsOf(file, seen = new Set()) {
   if (cache.has(file)) return cache.get(file)
   if (seen.has(file)) return new Set()
   seen.add(file)
   const out = new Set()
   const src = strip(readFileSync(file, 'utf8'))
   for (const m of src.matchAll(/export\s+(?:async\s+)?(?:const|let|var|function\*?|class)\s+([\w$]+)([^\n;]*)/g)) {
      out.add(m[1])
      // deklarasi ganda satu baris: export const A = 1, B = 2;
      for (const extra of m[2].matchAll(/,\s*([A-Za-z_$][\w$]*)\s*=(?!=)/g)) out.add(extra[1])
   }
   for (const m of src.matchAll(/export\s*\{([^}]*)\}(?:\s*from\s*['"]([^'"]+)['"])?/g)) {
      for (const part of m[1].split(',')) {
         const t = part.trim(); if (!t) continue
         const as = t.split(/\s+as\s+/); out.add((as[1] ?? as[0]).trim())
      }
   }
   if (/export\s+default\b/.test(src)) out.add('default')
   for (const m of src.matchAll(/export\s*\*\s*from\s*['"](\.[^'"]+)['"]/g)) {
      const t = resolve(dirname(file), m[1])
      if (existsSync(t)) for (const n of exportsOf(t, seen)) if (n !== 'default') out.add(n)
   }
   if (/export\s*\*\s*as\s+([\w$]+)\s+from/.test(src)) for (const m of src.matchAll(/export\s*\*\s*as\s+([\w$]+)\s+from/g)) out.add(m[1])
   cache.set(file, out)
   return out
}

for (const f of files) {
   const rel = f.slice(root.length + 1)
   const src = strip(readFileSync(f, 'utf8'))
   if (/@itsliaaa\/starforge/.test(src)) problems.push(`${rel}: masih import @itsliaaa/starforge`)
   for (const m of src.matchAll(/(?:import|export)\s+([^'";]*?)\s*from\s*['"](\.[^'"]+)['"]/g)) {
      const target = resolve(dirname(f), m[2])
      if (!existsSync(target)) { problems.push(`${rel}: import ${m[2]} -> file tidak ada`); continue }
      const named = m[1].match(/\{([^}]*)\}/)
      if (!named) continue
      const have = exportsOf(target)
      for (const part of named[1].split(',')) {
         const name = part.trim().split(/\s+as\s+/)[0].trim()
         if (name && !have.has(name)) problems.push(`${rel}: '${name}' tidak di-export oleh ${m[2]}`)
      }
   }
}

const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
for (const sect of ['dependencies', 'peerDependencies', 'devDependencies'])
   for (const k of Object.keys(pkg[sect] ?? {})) if (k.startsWith('@itsliaaa/')) problems.push(`package.json ${sect}: ${k} (paket upstream harus lepas)`)

const rb = spawnSync(process.execPath, [join(root, 'scripts/rebrand.mjs'), '--check'], { encoding: 'utf8' })
if (rb.status !== 0) problems.push('rebrand belum lengkap:\n' + rb.stdout.split('\n').filter(l => l.startsWith('✗')).join('\n'))

if (problems.length) {
   console.error('✗ check gagal:\n - ' + problems.join('\n - '))
   process.exit(1)
}
console.log(`✓ check OK (${files.length} file lib diperiksa)`)
