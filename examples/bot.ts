// Contoh TypeScript. Jalankan: npx tsx examples/bot.ts
import { makeAthanasiaSocket, useMultiFileAuthState, DisconnectReason, type AthanasiaSocket } from '@athanasiacmd/baileys'

const start = async (): Promise<AthanasiaSocket> => {
   const { state, saveCreds } = await useMultiFileAuthState('session')
   const sock = makeAthanasiaSocket({ auth: state, printQRInTerminal: true, logLevel: 'warn' })

   sock.ev.on('creds.update', saveCreds)
   sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
      const code = (lastDisconnect?.error as any)?.output?.statusCode
      if (connection === 'close' && code !== DisconnectReason.loggedOut) void start()
   })

   sock.ev.on('messages.upsert', async ({ messages }) => {
      const m = messages[0]
      if (m?.message?.conversation === '.live' && m.key.remoteJid) {
         // sendAthanasia = versi typed untuk fitur tambahan
         await sock.sendAthanasia(m.key.remoteJid, { location: { degreesLatitude: -6.2, degreesLongitude: 106.8 }, live: true })
      }
   })
   return sock
}

void start()
