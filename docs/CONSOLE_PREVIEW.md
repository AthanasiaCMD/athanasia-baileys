# Console Preview

Output asli dari `makeAthanasiaSocket()` (di terminal asli ada warna gradient violet → gold; di sini versi tanpa warna).
Terminal sempit (< 76 kolom, mis. Termux) otomatis pakai banner ringkas. Matiin warna: `NO_COLOR=1`.

```text

   █████╗ ████████╗██╗  ██╗ █████╗ ███╗   ██╗ █████╗ ███████╗██╗ █████╗ 
  ██╔══██╗╚══██╔══╝██║  ██║██╔══██╗████╗  ██║██╔══██╗██╔════╝██║██╔══██╗
  ███████║   ██║   ███████║███████║██╔██╗ ██║███████║███████╗██║███████║
  ██╔══██║   ██║   ██╔══██║██╔══██║██║╚██╗██║██╔══██║╚════██║██║██╔══██║
  ██║  ██║   ██║   ██║  ██║██║  ██║██║ ╚████║██║  ██║███████║██║██║  ██║
  ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═╝
  ─ B A I L E Y S ─ WhatsApp Web API · TypeScript / JavaScript

╭─ info ─────────────────────────────────────────────╮
│ version  v0.6.0                                    │
│ wa-web   2.3000.1054623785                         │
│ node     v22.23.5                                  │
│ repo     npm: @athanasiacmd/baileys │
│ bot      Athanasia-MD v1                           │
╰────────────────────────────────────────────────────╯

00:29:43  INFO   [socket]  opening ws connection
00:29:43  WARN   [auth]  prekey stock rendah, upload ulang  attempts=2
00:29:43  ERROR  [msg-send]  gagal kirim pesan
           Error: Timed Out
               at file:///tmp/pv/demo.mjs:10:48
               at ModuleJob.run (node:internal/modules/esm/module_job:343:25)
               at async onImport.tracePromise.__proto__ (node:internal/modules/esm/loader:681:26)
00:29:43  LINK   menghubungkan ke WhatsApp…

╭─ pairing code ───────────────────────────────────────────────────╮
│ Buka WhatsApp → Perangkat tertaut → Tautkan dengan nomor telepon │
│                                                                  │
│    ABCD-1234                                                     │
╰──────────────────────────────────────────────────────────────────╯

00:29:43  AUTH   login baru berhasil, session disimpan

╭─ connected ───────────────────────────╮
│ ✔ Athanasia online                    │
│ akun     Athanasia Bot (628123456789) │
│ mulai    11/19/2026, 12:29:43 AM      │
╰───────────────────────────────────────╯

00:29:43  RECV   💬 DM · Rani: .menu
00:29:43  RECV   💬 👥 120363025 · Dimas: bang tolong bikinin stiker dari gambar ini ya, makasih bany…
00:29:43  RECV   🖼  👥 120363025 · Sari: foto kemarin
00:29:43  SEND   💬 DM · me: 📋 *MENU ATHANASIA*
00:29:43  RECV   🏷  DM · Rani: [sticker]
00:29:43  GROUP  120363025 · add → 628777666555
00:29:43  CALL   628111222333 · voice · offer
00:29:43  CLOSE  428 · koneksi ditutup · reconnect disarankan
00:29:43  CLOSE  401 · logged out dari HP (hapus session & scan ulang) · tidak reconnect
╭─ stats ─────────────╮
│ uptime     00:00:00 │
│ pesan masuk 4       │
│ pesan keluar 1      │
│ reconnect  1        │
╰─────────────────────╯
```

Matiin bagian tertentu:

```js
makeAthanasiaSocket({ auth: state, banner: false, console: { messages: false }, logLevel: 'silent' })
```
