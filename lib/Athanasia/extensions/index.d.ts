import { type AthanasiaContent } from './transform.js';
export * from './transform.js';
type SendMessage = (jid: any, content: any, options?: any) => Promise<any>;
export interface ExtendableSocket {
    sendMessage: SendMessage;
    [key: string]: any;
}
/**
 * Patch `sock.sendMessage` supaya ngerti key tambahan athanasia
 * (live, call, adminInvite, productList, interactiveButtons, shop, collection)
 * dan nambahin method `sock.sendAthanasia()` yang typed.
 */
export declare const applyExtensions: <T extends ExtendableSocket>(sock: T, onFeature?: (feature: string, jid: unknown) => void) => T & {
    sendAthanasia: (jid: string, content: AthanasiaContent, options?: Record<string, any>) => Promise<any>;
};
