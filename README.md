<div align="center">

# ✦ @athanasiacmd/baileys

**WhatsApp Web API (Baileys v7 fork) · TypeScript / JavaScript**

Interactive messages · Album · Rich response · Console cantik · Gabungan fitur itsliaaa + Itsukichann

</div>

## Install

```bash
npm i @athanasiacmd/baileys
# atau
yarn add @athanasiacmd/baileys
```

Node.js >= 20. Paket ini **ESM murni** dengan **signal via WASM** (`whatsapp-rust-bridge`). Dari CommonJS: `await import('@athanasiacmd/baileys')`, atau `require()` langsung di Node >= 20.19 / 22.12.

Opsional: salah satu image lib buat thumbnail (`sharp`, `jimp`, `@napi-rs/image`), dan `ffmpeg` di PATH buat waveform + durasi voice note.

## Quick start

```js
import { makeAthanasiaSocket, useMultiFileAuthState, DisconnectReason } from '@athanasiacmd/baileys'

const start = async () => {
   const { state, saveCreds } = await useMultiFileAuthState('session')
   const sock = makeAthanasiaSocket({ auth: state, printQRInTerminal: true })

   sock.ev.on('creds.update', saveCreds)
   sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
      if (connection === 'close' && lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) start()
   })
   sock.ev.on('messages.upsert', async ({ messages }) => {
      const m = messages[0]
      if (m.message?.conversation === '.ping') await sock.sendMessage(m.key.remoteJid, { text: 'pong 🏓' })
   })
}
start()
```

`makeWASocket` biasa tetap diekspor kalau lu nggak mau console/banner. Contoh lengkap: [`examples/bot.mjs`](examples/bot.mjs), [`examples/bot.ts`](examples/bot.ts).

## Console

Banner gradient, log berwarna, kotak pairing code, log pesan masuk/keluar, grup, call, dan stats.
Lihat [`docs/CONSOLE_PREVIEW.md`](docs/CONSOLE_PREVIEW.md).

```js
makeAthanasiaSocket({
   auth: state,
   logLevel: 'warn',                  // 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'silent'
   banner: true,
   console: { maxText: 80, calls: false },   // atau false buat matiin semua
   bannerExtra: { bot: 'MyBot v1' }
})
sock.athanasia.printStats()
```

## Fitur tambahan (port dari Itsukichann/Baileys)

```js
await sock.sendMessage(jid, { location: { degreesLatitude: -6.2, degreesLongitude: 106.8 }, live: true })
await sock.sendMessage(jid, { call: { type: 'video', name: 'Rapat', time: Date.now() + 3600_000 } })
await sock.sendMessage(jid, { adminInvite: { jid: '1203...@newsletter', name: 'Channel', expiration: 1900000000 } })
await sock.sendMessage(jid, { productList: [{ title: 'Menu', products: [{ productId: '123' }] }], buttonText: 'Lihat', businessOwnerJid, text: 'Katalog' })
await sock.sendMessage(jid, { text: 'Bayar', interactiveButtons: [{ name: 'review_and_pay', buttonParamsJson: '{...}' }] })
```

Di TypeScript pakai `sock.sendAthanasia(jid, content)` biar ter-type. Semua fitur lain (album, rich response, sticker pack, buttons, dll.) didokumentasikan di [`docs/API.md`](docs/API.md).

## Development

```bash
yarn install
yarn build   # compile src/Athanasia -> lib/Athanasia
yarn test
yarn check   # cek import/export lib + rebrand
```

Upgrade ke rilis baru upstream: lihat [`docs/UPGRADING.md`](docs/UPGRADING.md).

Analisis penggabungan fitur: [`docs/FEATURE_ANALYSIS.md`](docs/FEATURE_ANALYSIS.md).

## Credits

Dibangun di atas [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys), [itsliaaa/baileys](https://github.com/itsliaaa/baileys), dan [Itsukichann/Baileys](https://github.com/Itsukichann/Baileys). Lihat [`NOTICE.md`](NOTICE.md) dan [`LICENSE`](LICENSE). Proyek ini tidak berafiliasi dengan WhatsApp; pakai dengan bijak, risiko banned ditanggung sendiri.
