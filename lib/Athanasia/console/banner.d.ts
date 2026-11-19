export interface BannerInfo {
    name?: string;
    version: string;
    waVersion?: string;
    node?: string;
    author?: string;
    repo?: string;
    extra?: Record<string, string>;
}
export declare const renderBanner: (info: BannerInfo) => string;
export declare const printBanner: (info: BannerInfo, write?: (s: string) => void) => void;
