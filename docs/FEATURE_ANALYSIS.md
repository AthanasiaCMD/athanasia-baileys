# Analisis Fitur: itsliaaa/baileys vs Itsukichann/Baileys

| | itsliaaa/baileys | Itsukichann/Baileys |
| --- | --- | --- |
| Versi | 0.5.6 (14 Nov 2026) | 7.3.2 (25 Jan 2026) |
| Modul | ESM, hasil compile TS (ada `.d.ts`) | CommonJS, JS saja |
| Signal | `whatsapp-rust-bridge` (WASM) | `@itsukichan/libsignal-node` |
| Versi WA Web | 2.3000.1054623785 | 2.3000.1030831524 (lama) |
| Dependency | 2 runtime | 17 runtime |

**Keputusan:** base = itsliaaa (lebih baru, protokol up-to-date). Kedua core beda arsitektur (ESM vs CJS, signal WASM vs node), jadi tidak bisa di-merge baris per baris. Fitur unik Itsuki di-port jadi layer TypeScript.

## Fitur SAMA (pakai implementasi itsliaaa)

album, sticker pack, PTV video, poll + poll result, event, buttons, list, template, cards/carousel, order, payment invite, product, group invite, keep, pin, react, edit, delete, forward, status mention, AI icon, newsletter, community, group/privacy/business mgmt, link preview, multi-file auth state.

## Fitur UNIK itsliaaa (tetap ada)

rich response (code block, table, inline entities), group status, lottie sticker, spoiler, view once v2, mention all, invoice, hydrated template, A2UI form, SQLite + single-file auth, image processing options (sharp/jimp/napi), `genai_sticker`, phash recovery, username USync.

## Fitur UNIK Itsuki (di-port ke `src/Athanasia/extensions`)

| Key | Output proto |
| --- | --- |
| `{ location, live: true }` | `liveLocationMessage` |
| `{ call: { type, name, time } }` | `scheduledCallCreationMessage` |
| `{ adminInvite: { jid, name, ... } }` | `newsletterAdminInviteMessage` |
| `{ productList, buttonText, businessOwnerJid }` | `listMessage` (PRODUCT_LIST) |
| `{ shop: { surface, id } }` | `interactiveMessage.shopStorefrontMessage` |
| `{ collection: { bizJid, id } }` | `interactiveMessage.collectionMessage` |
| `{ interactiveButtons: [...] }` | `interactiveMessage.nativeFlowMessage` |
| tombol `review_and_pay` / `payment_info` | node `<biz native_flow_name>` otomatis |

## Sengaja TIDAK di-port

`make-cache-manager-store` (itsliaaa sudah punya store + SQLite), `baileys-event-stream`, `@itsukichan/libsignal-node` (diganti signal WASM), logic socket/messages-recv (versi itsliaaa lebih baru).

## Yang harus lu tau

1. **Belum dites ke WhatsApp asli.** Yang sudah dites: compile TS, 23 unit test (transform, logger, banner, util core), cek link seluruh `lib/` (320 export ke-load, dengan `whatsapp-rust-bridge` di-stub), dan simulasi upgrade upstream. `whatsapp-rust-bridge` asli belum bisa di-install di sandbox, jadi jalankan `yarn install` lalu coba login + kirim tiap fitur di nomor cadangan.
2. **`@itsliaaa/starforge` sudah dilepas (v0.7.0).** 9 util-nya diganti implementasi sendiri di `src/Athanasia/core` (cache, mutex, queue, zip, file-type, qr, waveform, getFile). Dua hal yang beda perilaku dari starforge: waveform/durasi voice note butuh `ffmpeg` di PATH (kalau nggak ada, pesan tetap terkirim tanpa waveform), dan sticker-pack ZIP ditulis tanpa kompresi (valid, ukuran sama karena isinya webp).
3. **Core cuma ada JS hasil compile**, tidak ada source TS-nya (di kedua repo). TS yang gw tulis = layer `src/Athanasia`. Core tetap JS + `.d.ts`.
4. **Link donasi**: `DONATE_URL` di core aslinya link saweria Lia (dipakai sebagai URL fallback di pesan). Sudah gw ganti ke URL repo lu; ubah sesuka lu di `lib/Defaults/index.js`.
5. Kredit asli wajib dipertahankan (MIT + `NOTICE.md`). Lia secara eksplisit minta ini di NOTICE-nya.
