// node examples/bot.mjs            -> QR di terminal
// node examples/bot.mjs 628xxxxx   -> pairing code
import { makeAthanasiaSocket, useMultiFileAuthState, DisconnectReason, delay } from '../lib/index.js'

const phone = process.argv[2]

const start = async () => {
   const { state, saveCreds } = await useMultiFileAuthState('session')

   const sock = makeAthanasiaSocket({
      auth: state,
      printQRInTerminal: !phone,
      bannerExtra: { bot: 'Athanasia-MD' }
   })

   sock.ev.on('creds.update', saveCreds)

   if (phone && !sock.authState.creds.registered) {
      await delay(2000)
      await sock.requestPairingCode(phone) // dicetak otomatis dalam kotak
   }

   sock.ev.on('connection.update', ({ connection, lastDisconnect }) => {
      if (connection !== 'close') return
      const code = lastDisconnect?.error?.output?.statusCode
      if (code !== DisconnectReason.loggedOut) start()
   })

   sock.ev.on('messages.upsert', async ({ messages, type }) => {
      if (type !== 'notify') return
      for (const m of messages) {
         const text = m.message?.conversation ?? m.message?.extendedTextMessage?.text ?? ''
         const jid = m.key.remoteJid
         if (m.key.fromMe || !text.startsWith('.')) continue

         if (text === '.ping') await sock.sendMessage(jid, { text: 'pong 🏓' }, { quoted: m })

         if (text === '.loc')
            await sock.sendMessage(jid, { location: { degreesLatitude: -6.2, degreesLongitude: 106.8 }, live: true, text: 'live location' })

         if (text === '.call')
            await sock.sendMessage(jid, { call: { type: 'video', name: 'Rapat Athanasia', time: Date.now() + 3600_000 } })

         if (text === '.btn')
            await sock.sendMessage(jid, {
               text: 'Pilih salah satu',
               footer: '@athanasiacmd/baileys',
               interactiveButtons: [
                  { name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: 'Halo', id: 'halo' }) },
                  { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: 'npm', url: 'https://www.npmjs.com/package/@athanasiacmd/baileys' }) }
               ]
            })

         if (text === '.stats') sock.athanasia.printStats()
      }
   })
}

start()
