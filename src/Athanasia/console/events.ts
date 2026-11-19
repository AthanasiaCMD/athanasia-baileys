import { DisconnectReason } from '../../Types/index.js'
import { extractMessageContent, getContentType } from '../../Utils/messages.js'
import { box, c } from './theme.js'
import type { AthanasiaLogger } from './logger.js'

export interface ConsoleOptions {
   connection?: boolean
   messages?: boolean
   groups?: boolean
   calls?: boolean
   /** panjang maksimum preview teks pesan */
   maxText?: number
   write?: (line: string) => void
   logger?: AthanasiaLogger
}

export interface AthanasiaStats {
   startedAt: number
   messagesIn: number
   messagesOut: number
   reconnects: number
   lastDisconnect?: number
}

const CLOSE_REASONS: Record<number, string> = {
   [DisconnectReason.loggedOut]: 'logged out dari HP (hapus session & scan ulang)',
   [DisconnectReason.badSession]: 'session rusak (hapus folder session)',
   [DisconnectReason.connectionClosed]: 'koneksi ditutup',
   [DisconnectReason.connectionReplaced]: 'session dipakai di tempat lain',
   [DisconnectReason.restartRequired]: 'restart diminta WhatsApp (normal setelah pairing)',
   [DisconnectReason.forbidden]: 'akses ditolak / nomor dibatasi',
   [DisconnectReason.unavailableService]: 'server WhatsApp lagi gangguan',
   [DisconnectReason.multideviceMismatch]: 'multi-device mismatch'
}

const ICONS: Record<string, string> = {
   conversation: '💬',
   extendedTextMessage: '💬',
   imageMessage: '🖼 ',
   videoMessage: '🎥',
   audioMessage: '🎙 ',
   stickerMessage: '🏷 ',
   documentMessage: '📄',
   locationMessage: '📍',
   liveLocationMessage: '📍',
   contactMessage: '👤',
   contactsArrayMessage: '👥',
   pollCreationMessage: '📊',
   reactionMessage: '❤️ ',
   interactiveMessage: '🔘',
   buttonsMessage: '🔘',
   listMessage: '📋',
   albumMessage: '🗂 '
}

export const shortJid = (jid?: string | null): string => {
   if (!jid) return '?'
   const [user, server] = jid.split('@')
   const clean = user.split(':')[0]
   if (server === 'lid') return `${clean.slice(0, 6)}…@lid`
   if (server === 'g.us') return clean.length > 14 ? `${clean.slice(0, 12)}…` : clean
   return clean
}

export const formatPairingCode = (code: string): string => (code.length === 8 ? `${code.slice(0, 4)}-${code.slice(4)}` : code)

const previewMessage = (msg: any, max: number): { icon: string; type: string; text: string } => {
   const content = extractMessageContent(msg?.message)
   const type = (content && getContentType(content)) || 'unknown'
   const body = content?.[type]
   const raw: string =
      (typeof body === 'string' ? body : body?.text ?? body?.caption ?? body?.name ?? body?.title ?? '') || ''
   const oneLine = raw.replace(/\s+/g, ' ').trim()
   const text = oneLine ? (oneLine.length > max ? oneLine.slice(0, max - 1) + '…' : oneLine) : c.dim(`[${type.replace('Message', '')}]`)
   return { icon: ICONS[type] ?? '✉️ ', type, text }
}

const ts = (): string => c.dim(new Date().toTimeString().slice(0, 8))
const fmtUptime = (ms: number): string => {
   const s = Math.floor(ms / 1000)
   return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0')).join(':')
}

/**
 * Pasang console cantik ke socket. Mengembalikan stats hidup (dipakai juga `sock.athanasia.stats`).
 */
export const attachConsole = (sock: any, options: ConsoleOptions = {}): AthanasiaStats => {
   const { connection = true, messages = true, groups = true, calls = true, maxText = 60, write = (l: string) => console.log(l) } = options
   const stats: AthanasiaStats = { startedAt: Date.now(), messagesIn: 0, messagesOut: 0, reconnects: 0 }
   const say = (tag: string, line: string) => write(`${ts()}  ${tag}  ${line}`)

   // --- pairing code dicetak cantik
   if (typeof sock.requestPairingCode === 'function') {
      const orig = sock.requestPairingCode.bind(sock)
      sock.requestPairingCode = async (...args: unknown[]) => {
         const code: string = await orig(...args)
         write('\n' + box([c.gray('Buka WhatsApp → Perangkat tertaut → Tautkan dengan nomor telepon'), '', '   ' + c.bold(c.gold(formatPairingCode(code)))], c.violet('pairing code')) + '\n')
         return code
      }
   }

   if (connection) {
      sock.ev.on('connection.update', (u: any) => {
         if (u.connection === 'connecting') say(c.sky('LINK '), 'menghubungkan ke WhatsApp…')
         if (u.qr) say(c.violet('QR   '), 'scan QR di atas, atau pakai pairing code')
         if (u.isNewLogin) say(c.mint('AUTH '), 'login baru berhasil, session disimpan')

         if (u.connection === 'open') {
            const me = sock.user
            write(
               '\n' +
                  box(
                     [
                        `${c.mint('✔')} ${c.bold('Athanasia online')}`,
                        `${c.gray('akun    ')} ${c.white(me?.name ?? '-')} ${c.dim('(' + shortJid(me?.id) + ')')}`,
                        `${c.gray('mulai   ')} ${c.white(new Date().toLocaleString())}`
                     ],
                     c.mint('connected'),
                     c.mint
                  ) +
                  '\n'
            )
         }

         if (u.connection === 'close') {
            const code: number | undefined = u.lastDisconnect?.error?.output?.statusCode
            const loggedOut = code === DisconnectReason.loggedOut
            stats.lastDisconnect = Date.now()
            if (!loggedOut) stats.reconnects++
            say(
               c.rose('CLOSE'),
               `${c.white(String(code ?? '???'))} ${c.dim('·')} ${CLOSE_REASONS[code ?? -1] ?? u.lastDisconnect?.error?.message ?? 'unknown'} ${c.dim('·')} ` +
                  (loggedOut ? c.rose('tidak reconnect') : c.gold('reconnect disarankan'))
            )
         }
      })
   }

   if (messages) {
      sock.ev.on('messages.upsert', ({ messages: list, type }: any) => {
         if (type !== 'notify') return
         for (const m of list) {
            if (!m.message) continue
            const fromMe = !!m.key.fromMe
            fromMe ? stats.messagesOut++ : stats.messagesIn++
            const group = m.key.remoteJid?.endsWith('@g.us')
            const { icon, text } = previewMessage(m, maxText)
            const who = fromMe ? c.violet('me') : c.white(m.pushName ?? shortJid(m.key.participant ?? m.key.remoteJid))
            const where = group ? c.gold(`👥 ${shortJid(m.key.remoteJid)}`) : c.sky('DM')
            say(fromMe ? c.violet('SEND ') : c.mint('RECV '), `${icon} ${where} ${c.dim('·')} ${who}${c.dim(':')} ${text}`)
         }
      })
   }

   if (groups) {
      sock.ev.on('group-participants.update', (u: any) =>
         say(c.gold('GROUP'), `${shortJid(u.id)} ${c.dim('·')} ${u.action} ${c.dim('→')} ${(u.participants ?? []).map((p: any) => shortJid(typeof p === 'string' ? p : p.id)).join(', ')}`)
      )
      sock.ev.on('groups.update', (list: any[]) =>
         list.forEach((g) => say(c.gold('GROUP'), `${shortJid(g.id)} ${c.dim('·')} update ${c.dim(Object.keys(g).filter((k) => k !== 'id').join(', '))}`))
      )
   }

   if (calls) {
      sock.ev.on('call', (list: any[]) =>
         list.forEach((x) => say(c.rose('CALL '), `${shortJid(x.from)} ${c.dim('·')} ${x.isVideo ? 'video' : 'voice'} ${c.dim('·')} ${x.status}`))
      )
   }

   return stats
}

export const formatStats = (s: AthanasiaStats): string => {
   const row = (k: string, v: string) => `${c.gray(k.padEnd(13))} ${c.white(v)}`
   return box(
      [
         row('uptime', fmtUptime(Date.now() - s.startedAt)),
         row('pesan masuk', String(s.messagesIn)),
         row('pesan keluar', String(s.messagesOut)),
         row('reconnect', String(s.reconnects))
      ],
      c.gold('stats')
   )
}
