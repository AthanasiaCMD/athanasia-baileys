import { test } from 'node:test'
import assert from 'node:assert/strict'
import { transformContent } from '../lib/Athanasia/extensions/transform.js'
import { createLogger } from '../lib/Athanasia/console/logger.js'
import { renderBanner } from '../lib/Athanasia/console/banner.js'

test('konten biasa tidak diubah', () => {
   const c = { text: 'halo' }
   const r = transformContent(c)
   assert.equal(r.content, c)
   assert.deepEqual(r.additionalNodes, [])
})

test('live location -> liveLocationMessage (raw)', () => {
   const r = transformContent({ location: { degreesLatitude: -6.2, degreesLongitude: 106.8 }, live: true, text: 'otw' })
   assert.equal(r.content.raw, true)
   assert.equal(r.content.liveLocationMessage.degreesLatitude, -6.2)
   assert.equal(r.content.liveLocationMessage.caption, 'otw')
})

test('call -> scheduledCallCreationMessage', () => {
   const r = transformContent({ call: { type: 'video', name: 'Meet', time: 1 } })
   assert.equal(r.content.scheduledCallCreationMessage.callType, 2)
   assert.equal(r.content.scheduledCallCreationMessage.title, 'Meet')
})

test('adminInvite -> newsletterAdminInviteMessage', () => {
   const r = transformContent({ adminInvite: { jid: '1@newsletter', name: 'Ch', expiration: 99 }, mentions: ['6281@s.whatsapp.net'] })
   assert.equal(r.content.newsletterAdminInviteMessage.newsletterJid, '1@newsletter')
   assert.deepEqual(r.content.newsletterAdminInviteMessage.contextInfo.mentionedJid, ['6281@s.whatsapp.net'])
})

test('productList -> listMessage PRODUCT_LIST', () => {
   const r = transformContent({ productList: [{ title: 'A', products: [{ productId: 'p1' }] }], buttonText: 'Lihat', businessOwnerJid: 'b@s.whatsapp.net', title: 'Toko', text: 'x' })
   assert.equal(r.content.listMessage.listType, 2)
   assert.equal(r.content.listMessage.productListInfo.headerImage.productId, 'p1')
})

test('interactiveButtons biasa: tanpa node biz', () => {
   const r = transformContent({ text: 'pilih', interactiveButtons: [{ name: 'quick_reply', buttonParamsJson: '{}' }] })
   assert.equal(r.content.interactiveMessage.nativeFlowMessage.buttons.length, 1)
   assert.equal(r.additionalNodes.length, 0)
})

test('review_and_pay -> node biz order_details', () => {
   const r = transformContent({ text: 'bayar', interactiveButtons: [{ name: 'review_and_pay', buttonParamsJson: '{}' }] })
   assert.deepEqual(r.additionalNodes, [{ tag: 'biz', attrs: { native_flow_name: 'order_details' } }])
})

test('shop & collection', () => {
   assert.equal(transformContent({ shop: { surface: 1, id: 's' } }).content.interactiveMessage.shopStorefrontMessage.id, 's')
   assert.equal(transformContent({ collection: { bizJid: 'b', id: 'c' } }).content.interactiveMessage.collectionMessage.bizJid, 'b')
})

test('content raw dilewati', () => {
   const c = { raw: true, call: {} }
   assert.equal(transformContent(c).content, c)
})

test('logger kompatibel pino (obj, msg) + child + level', () => {
   const lines = []
   const log = createLogger({ level: 'info', write: (l) => lines.push(l), timestamps: false })
   log.debug('disembunyikan')
   log.child({ module: 'socket' }).info({ a: 1 }, 'halo')
   assert.equal(lines.length, 1)
   assert.match(lines[0], /\[socket\]/)
   assert.match(lines[0], /halo/)
})

test('banner render', () => {
   const out = renderBanner({ version: '0.6.0', waVersion: '2.3000.1' })
   assert.match(out, /v0\.6\.0/)
})
