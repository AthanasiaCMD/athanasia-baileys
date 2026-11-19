export declare const supportsColor: () => boolean;
type Painter = (text: string | number) => string;
export declare const c: {
    readonly bold: Painter;
    readonly dim: Painter;
    readonly italic: Painter;
    readonly violet: Painter;
    readonly lilac: Painter;
    readonly gold: Painter;
    readonly rose: Painter;
    readonly mint: Painter;
    readonly sky: Painter;
    readonly gray: Painter;
    readonly white: Painter;
};
export declare const stripAnsi: (s: string) => string;
export declare const visibleLength: (s: string) => number;
export declare const termWidth: () => number;
/** Gambar kotak rounded. `lines` boleh berisi ANSI. */
export declare const box: (lines: string[], title?: string, color?: Painter) => string;
export {};
