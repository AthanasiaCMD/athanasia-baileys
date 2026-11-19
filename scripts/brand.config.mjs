/**
 * Satu-satunya tempat identitas @athanasiacmd/baileys didefinisikan.
 * Mau ganti nama / repo / author? Cukup edit file ini lalu `npm run rebrand`.
 */
export const BRAND = {
   name: '@athanasiacmd/baileys',
   display: 'Athanasia',
   author: 'AthanasiaCMD',
   /** halaman npm — dipakai sebagai link di runtime (bukan GitHub) */
   npmUrl: 'https://www.npmjs.com/package/@athanasiacmd/baileys',
   /** CDN npm buat baca versi WA terbaru (fetchLatestBaileysVersion) */
   versionSource: 'https://cdn.jsdelivr.net/npm/@athanasiacmd/baileys@latest/lib/Defaults/index.js',
   /** key Browsers.<key> + nama device di "Perangkat tertaut" */
   browserKey: 'athanasia',
   browserName: 'Athanasia',
   /** label class logger internal */
   loggerClass: 'athanasia'
}

/** sumber upstream yang di-track (buat sync) */
export const UPSTREAM = {
   npm: '@itsliaaa/baileys',
   repo: 'https://github.com/itsliaaa/baileys'
}
