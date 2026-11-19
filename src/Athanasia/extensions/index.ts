import { transformContent, type AthanasiaContent, type WANode } from './transform.js'

export * from './transform.js'

type SendMessage = (jid: any, content: any, options?: any) => Promise<any>

export interface ExtendableSocket {
   sendMessage: SendMessage
   [key: string]: any
}

/**
 * Patch `sock.sendMessage` supaya ngerti key tambahan athanasia
 * (live, call, adminInvite, productList, interactiveButtons, shop, collection)
 * dan nambahin method `sock.sendAthanasia()` yang typed.
 */
export const applyExtensions = <T extends ExtendableSocket>(
   sock: T,
   onFeature?: (feature: string, jid: unknown) => void
): T & { sendAthanasia: (jid: string, content: AthanasiaContent, options?: Record<string, any>) => Promise<any> } => {
   const original: SendMessage = sock.sendMessage.bind(sock)

   const patched: SendMessage = (jid, content, options = {}) => {
      const t = transformContent(content)
      if (t.feature) onFeature?.(t.feature, jid)
      if (t.content === content && !t.additionalNodes.length) return original(jid, content, options)
      const additionalNodes: WANode[] = [...(options.additionalNodes ?? []), ...t.additionalNodes]
      return original(jid, t.content, { ...options, ...(additionalNodes.length ? { additionalNodes } : {}) })
   }

   sock.sendMessage = patched
   ;(sock as any).sendAthanasia = (jid: string, content: AthanasiaContent, options?: Record<string, any>) => patched(jid, content, options)
   return sock as any
}
