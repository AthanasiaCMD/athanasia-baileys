/**
 * Fitur yang HANYA ada di fork Itsukichann (Baileys 7.3.x) dan belum ada di itsliaaa/baileys,
 * di-port ke athanasia-baileys sebagai layer terpisah (tanpa ngubah core).
 *
 * Cara kerja: content "versi athanasia" diubah jadi proto Message mentah lalu dikirim lewat
 * jalur `raw: true` milik core, jadi enkripsi / relay / retry tetap ditangani core.
 *
 * Ditulis pure (tanpa import core) biar gampang di-test.
 */
export type Jid = string;
export interface WANode {
    tag: string;
    attrs: Record<string, string>;
    content?: unknown;
}
interface BaseExtra {
    /** caption/teks utama */
    text?: string;
    footer?: string;
    title?: string;
    mentions?: Jid[];
    contextInfo?: Record<string, unknown>;
}
export interface LiveLocationContent extends BaseExtra {
    location: {
        degreesLatitude: number;
        degreesLongitude: number;
        accuracyInMeters?: number;
        speedInMps?: number;
        caption?: string;
        sequenceNumber?: number | string;
        timeOffset?: number;
        jpegThumbnail?: Uint8Array;
    };
    live: true;
}
export interface CallContent extends BaseExtra {
    /** jadwal panggilan. `time` = epoch ms, `type` = 'voice' | 'video' | 1 | 2 */
    call: {
        time?: number;
        type?: 'voice' | 'video' | 1 | 2;
        name?: string;
    };
}
export interface AdminInviteContent extends BaseExtra {
    adminInvite: {
        jid: Jid;
        name: string;
        caption?: string;
        expiration?: number;
        thumbnail?: Uint8Array;
    };
}
export interface ProductListContent extends BaseExtra {
    productList: Array<{
        title: string;
        products: Array<{
            productId: string;
        }>;
    }>;
    buttonText: string;
    businessOwnerJid: Jid;
    thumbnail?: Uint8Array;
}
export interface InteractiveButtonsContent extends BaseExtra {
    /** shorthand nativeFlow: [{ name: 'quick_reply', buttonParamsJson: '{"display_text":"Hi","id":"hi"}' }] */
    interactiveButtons: Array<{
        name: string;
        buttonParamsJson: string;
    }>;
}
export interface ShopContent extends BaseExtra {
    shop: {
        surface: number | string;
        id: string;
        version?: number;
    };
}
export interface CollectionContent extends BaseExtra {
    collection: {
        bizJid: Jid;
        id: string;
        version?: number;
    };
}
export type AthanasiaContent = LiveLocationContent | CallContent | AdminInviteContent | ProductListContent | InteractiveButtonsContent | ShopContent | CollectionContent;
export interface TransformResult {
    content: any;
    additionalNodes: WANode[];
    /** nama fitur yang kepake (buat log) */
    feature?: string;
}
export declare const transformContent: (content: any) => TransformResult;
export {};
