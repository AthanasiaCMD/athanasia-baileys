# Upgrade ke rilis upstream baru

Struktur biar gampang di-update:

| Bagian | Siapa yang punya | Saat upgrade |
| --- | --- | --- |
| `lib/**` (kecuali `lib/Athanasia`), `WAProto/` | upstream (itsliaaa/baileys), hasil compile | **diganti** |
| `src/Athanasia/**` → `lib/Athanasia/**` | kita (console, extensions, `core/` util) | **tidak disentuh** |
| `scripts/brand.config.mjs` | kita, identitas di satu tempat | tidak disentuh |
| `scripts/rebrand.mjs` | aturan "upstream → Athanasia" | disesuaikan kalau upstream berubah bentuk |

## Langkah

```bash
# 1. ambil + ganti lib/WAProto + rebrand + check (butuh internet)
node scripts/sync-upstream.mjs --npm 0.5.7
#    atau offline: npm pack @itsliaaa/baileys@0.5.7 && tar xzf *.tgz && node scripts/sync-upstream.mjs --dir ./package

# 2. build layer Athanasia + test
yarn build && yarn test

# 3. review perubahan, bump versi di package.json + tulis CHANGELOG, lalu tag
git diff --stat
git tag v0.7.1 && git push --tags     # workflow publish.yaml jalan
```

`sync-upstream` mencatat versi upstream di `scripts/upstream.json` (file internal, tidak ikut ke-publish).

## Kalau `sync` gagal

- **`✗ <aturan> (target tidak ketemu …)`**: upstream mengubah baris yang di-rebrand. Buka `scripts/rebrand.mjs`, sesuaikan regex aturan itu. Sengaja gagal keras supaya nggak ada identitas upstream yang lolos diam-diam.
- **`check gagal: 'X' tidak di-export oleh …`**: upstream mulai meng-import fungsi util baru dari `Addon`. Tambahkan implementasinya di `src/Athanasia/core` dan ekspor lewat aturan `util-starforge -> core sendiri` di `rebrand.mjs`.
- **Perubahan di `WAProto` / versi WA**: ikut otomatis karena `WAProto/` dan `lib/Defaults/index.js` datang dari upstream.

## Mau ganti nama / repo / author?

Edit `scripts/brand.config.mjs`, lalu `node scripts/rebrand.mjs`. Aturan sudah menerima nilai lama maupun baru, jadi aman diulang.

## Yang TIDAK boleh dihapus

`LICENSE` (semua baris copyright) dan `NOTICE.md`, komentar atribusi di `WAProto/index.js`. Itu syarat MIT dan permintaan eksplisit upstream.
