import { transformContent } from './transform.js';
export * from './transform.js';
/**
 * Patch `sock.sendMessage` supaya ngerti key tambahan athanasia
 * (live, call, adminInvite, productList, interactiveButtons, shop, collection)
 * dan nambahin method `sock.sendAthanasia()` yang typed.
 */
export const applyExtensions = (sock, onFeature) => {
    const original = sock.sendMessage.bind(sock);
    const patched = (jid, content, options = {}) => {
        const t = transformContent(content);
        if (t.feature)
            onFeature?.(t.feature, jid);
        if (t.content === content && !t.additionalNodes.length)
            return original(jid, content, options);
        const additionalNodes = [...(options.additionalNodes ?? []), ...t.additionalNodes];
        return original(jid, t.content, { ...options, ...(additionalNodes.length ? { additionalNodes } : {}) });
    };
    sock.sendMessage = patched;
    sock.sendAthanasia = (jid, content, options) => patched(jid, content, options);
    return sock;
};
