# Notice & Attribution — athanasia-baileys

**athanasia-baileys** adalah gabungan (fork) dari beberapa proyek MIT. Kredit WAJIB tetap dipertahankan (lihat `LICENSE`):

| Bagian | Sumber | Lisensi |
| --- | --- | --- |
| Core socket, protokol, WAProto | [WhiskeySockets/Baileys](https://github.com/WhiskeySockets/Baileys) (Rajeh Taher) | MIT |
| Base fork: interactive message, album, rich response, sticker pack, group status, SQLite auth, signal WASM, dst. | [itsliaaa/baileys](https://github.com/itsliaaa/baileys) (Lia Wynn) v0.5.6 | MIT |
| Fitur yang di-port: live location, scheduled call, newsletter admin invite, product list, shop/collection shorthand, node `review_and_pay` / `payment_info` | [Itsukichann/Baileys](https://github.com/Itsukichann/Baileys) v7.3.2 | MIT |
| Layer `src/Athanasia/*` (console, banner, logger, extensions, `core/` util) | AthanasiaCMD | MIT |

Dari v0.7.0, util yang dulu diimpor dari `@itsliaaa/starforge` (cache, mutex, queue, zip, deteksi tipe file, QR, waveform) diganti implementasi sendiri di `src/Athanasia/core`. Arsitektur dan sebagian besar isi `lib/` (hasil compile, termasuk `lib/Addon/*` dan komentar atribusi di `WAProto/index.js`) tetap berasal dari upstream di atas dan kreditnya tetap berlaku.

Kalau lu fork / publish ulang athanasia-baileys, tolong jangan hapus kredit di atas.

---

# Upstream notice (itsliaaa/baileys), disalin apa adanya

## Project Notice & Maintenance Policy

## Attribution and Credits

I have noticed an increasing number of projects using code from this fork without providing proper credit or attribution. In some cases, the original project identity and attribution have been removed or replaced with someone else's name, making it appear as though the work originated from them.

I want to make one thing clear: I have no objection to people forking, modifying, renaming, or building upon this project. That is part of what makes open-source software valuable.

However, removing the original credits and presenting someone else's work as your own is something I cannot simply overlook.

A considerable amount of time, effort, and thought has gone into the modifications and improvements made to this fork. Seeing that work reused without acknowledgment is genuinely disappointing.

**Please respect the original authors and maintain proper attribution when using, redistributing, or building upon this project's code.** Always comply with the applicable license terms.

## Future Development

Due to these circumstances, I have decided to discontinue further custom development of this fork after version **0.5.3**.

This does not mean the repository is being abandoned. Instead, its maintenance will be limited to following the upstream [Baileys](https://github.com/WhiskeySockets/Baileys) repository.

Future updates will primarily focus on:

- Keeping the fork synchronized with upstream Baileys.
- Updating `WAProto` when necessary.
- Updating the default socket version when necessary.

No further custom features, major modifications, or independent development efforts are planned beyond version 0.5.3.

## A Final Note

This decision was not made lightly. I genuinely enjoyed working on this project and improving it in my own way.

However, open-source collaboration should be built on mutual respect, not on taking someone else's efforts while erasing their contributions.

Thank you to everyone who has used this project, supported its development, and given proper credit along the way.

Your appreciation has meant more than you might realize.