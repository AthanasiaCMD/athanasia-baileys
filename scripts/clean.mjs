// hapus hasil build lama layer Athanasia (lib/Athanasia) sebelum tsc — lintas-OS
import { rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
rmSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'lib', 'Athanasia'), { recursive: true, force: true })
