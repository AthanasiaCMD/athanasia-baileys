/**
 * Fitur yang HANYA ada di fork Itsukichann (Baileys 7.3.x) dan belum ada di itsliaaa/baileys,
 * di-port ke athanasia-baileys sebagai layer terpisah (tanpa ngubah core).
 *
 * Cara kerja: content "versi athanasia" diubah jadi proto Message mentah lalu dikirim lewat
 * jalur `raw: true` milik core, jadi enkripsi / relay / retry tetap ditangani core.
 *
 * Ditulis pure (tanpa import core) biar gampang di-test.
 */

export type Jid = string

export interface WANode {
   tag: string
   attrs: Record<string, string>
   content?: unknown
}

interface BaseExtra {
   /** caption/teks utama */
   text?: string
   footer?: string
   title?: string
   mentions?: Jid[]
   contextInfo?: Record<string, unknown>
}

export interface LiveLocationContent extends BaseExtra {
   location: { degreesLatitude: number; degreesLongitude: number; accuracyInMeters?: number; speedInMps?: number; caption?: string; sequenceNumber?: number | string; timeOffset?: number; jpegThumbnail?: Uint8Array }
   live: true
}
export interface CallContent extends BaseExtra {
   /** jadwal panggilan. `time` = epoch ms, `type` = 'voice' | 'video' | 1 | 2 */
   call: { time?: number; type?: 'voice' | 'video' | 1 | 2; name?: string }
}
export interface AdminInviteContent extends BaseExtra {
   adminInvite: { jid: Jid; name: string; caption?: string; expiration?: number; thumbnail?: Uint8Array }
}
export interface ProductListContent extends BaseExtra {
   productList: Array<{ title: string; products: Array<{ productId: string }> }>
   buttonText: string
   businessOwnerJid: Jid
   thumbnail?: Uint8Array
}
export interface InteractiveButtonsContent extends BaseExtra {
   /** shorthand nativeFlow: [{ name: 'quick_reply', buttonParamsJson: '{"display_text":"Hi","id":"hi"}' }] */
   interactiveButtons: Array<{ name: string; buttonParamsJson: string }>
}
export interface ShopContent extends BaseExtra {
   shop: { surface: number | string; id: string; version?: number }
}
export interface CollectionContent extends BaseExtra {
   collection: { bizJid: Jid; id: string; version?: number }
}

export type AthanasiaContent =
   | LiveLocationContent
   | CallContent
   | AdminInviteContent
   | ProductListContent
   | InteractiveButtonsContent
   | ShopContent
   | CollectionContent

export interface TransformResult {
   content: any
   additionalNodes: WANode[]
   /** nama fitur yang kepake (buat log) */
   feature?: string
}

// enum proto (lihat WAProto/index.d.ts)
const LIST_TYPE_PRODUCT_LIST = 2
const CALL_TYPE: Record<string, number> = { voice: 1, video: 2 }
/** native flow yang butuh <biz native_flow_name=...> di stanza */
const PAYMENT_FLOWS: Record<string, string> = { review_and_pay: 'order_details', payment_info: 'payment_info' }

const has = (o: any, k: string): boolean => o != null && o[k] !== undefined && o[k] !== null

const buildContextInfo = (c: BaseExtra): Record<string, unknown> | undefined => {
   if (!c.contextInfo && !c.mentions?.length) return undefined
   return { ...c.contextInfo, ...(c.mentions?.length ? { mentionedJid: c.mentions } : {}) }
}

const isBytes = (v: unknown): v is Uint8Array => v instanceof Uint8Array

const interactiveShell = (c: BaseExtra, inner: Record<string, unknown>) => {
   const interactiveMessage: Record<string, unknown> = { ...inner }
   if (has(c, 'text')) interactiveMessage.body = { text: c.text }
   if (has(c, 'title')) interactiveMessage.header = { title: c.title, subtitle: null, hasMediaAttachment: false }
   if (has(c, 'footer')) interactiveMessage.footer = { text: c.footer }
   const contextInfo = buildContextInfo(c)
   if (contextInfo) interactiveMessage.contextInfo = contextInfo
   return { raw: true, interactiveMessage }
}

export const transformContent = (content: any): TransformResult => {
   const none: TransformResult = { content, additionalNodes: [] }
   if (!content || typeof content !== 'object' || content.raw) return none

   // --- live location
   if (has(content, 'location') && content.live === true) {
      return {
         feature: 'liveLocation',
         additionalNodes: [],
         content: {
            raw: true,
            liveLocationMessage: {
               ...content.location,
               caption: content.location.caption ?? content.text,
               contextInfo: buildContextInfo(content)
            }
         }
      }
   }

   // --- scheduled call
   if (has(content, 'call')) {
      const t = content.call?.type
      return {
         feature: 'call',
         additionalNodes: [],
         content: {
            raw: true,
            scheduledCallCreationMessage: {
               scheduledTimestampMs: content.call?.time ?? Date.now(),
               callType: typeof t === 'string' ? CALL_TYPE[t] ?? 1 : t ?? 1,
               title: content.call?.name ?? 'Call'
            }
         }
      }
   }

   // --- newsletter admin invite
   if (has(content, 'adminInvite')) {
      const a = content.adminInvite
      return {
         feature: 'adminInvite',
         additionalNodes: [],
         content: {
            raw: true,
            newsletterAdminInviteMessage: {
               newsletterJid: a.jid,
               newsletterName: a.name,
               caption: a.caption,
               inviteExpiration: a.expiration,
               jpegThumbnail: isBytes(a.thumbnail) ? a.thumbnail : undefined,
               contextInfo: buildContextInfo(content)
            }
         }
      }
   }

   // --- product list (listMessage tipe PRODUCT_LIST)
   if (has(content, 'productList')) {
      const first = content.productList?.[0]?.products?.[0]?.productId
      return {
         feature: 'productList',
         additionalNodes: [],
         content: {
            raw: true,
            listMessage: {
               title: content.title,
               buttonText: content.buttonText,
               footerText: content.footer,
               description: content.text,
               listType: LIST_TYPE_PRODUCT_LIST,
               productListInfo: {
                  productSections: content.productList,
                  headerImage: { productId: first, jpegThumbnail: isBytes(content.thumbnail) ? content.thumbnail : null },
                  businessOwnerJid: content.businessOwnerJid
               },
               contextInfo: buildContextInfo(content)
            }
         }
      }
   }

   // --- shop / collection (storefront & katalog)
   if (has(content, 'shop')) {
      return {
         feature: 'shop',
         additionalNodes: [],
         content: interactiveShell(content, {
            shopStorefrontMessage: { surface: content.shop.surface, id: content.shop.id, messageVersion: content.shop.version ?? 1 }
         })
      }
   }
   if (has(content, 'collection')) {
      return {
         feature: 'collection',
         additionalNodes: [],
         content: interactiveShell(content, {
            collectionMessage: { bizJid: content.collection.bizJid, id: content.collection.id, messageVersion: content.collection.version ?? 1 }
         })
      }
   }

   // --- interactiveButtons shorthand (+ node biz buat review_and_pay / payment_info)
   if (has(content, 'interactiveButtons')) {
      const first = content.interactiveButtons?.[0]?.name as string | undefined
      const flow = first ? PAYMENT_FLOWS[first] : undefined
      return {
         feature: flow ? 'payment' : 'interactiveButtons',
         additionalNodes: flow ? [{ tag: 'biz', attrs: { native_flow_name: flow } }] : [],
         content: interactiveShell(content, { nativeFlowMessage: { buttons: content.interactiveButtons } })
      }
   }

   return none
}
