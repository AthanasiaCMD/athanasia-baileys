/**
 * Athanasia console theme: ANSI helpers tanpa dependency.
 * Auto-disable warna kalau NO_COLOR di-set / output bukan TTY (kecuali FORCE_COLOR).
 */
const env = typeof process !== 'undefined' ? process.env : {};
export const supportsColor = () => {
    if (env.NO_COLOR)
        return false;
    if (env.FORCE_COLOR && env.FORCE_COLOR !== '0')
        return true;
    return !!process.stdout?.isTTY;
};
const paint = (open, close) => (text) => supportsColor() ? `\u001b[${open}m${text}\u001b[${close}m` : String(text);
const rgb = (r, g, b) => paint(`38;2;${r};${g};${b}`, '39');
export const c = {
    bold: paint('1', '22'),
    dim: paint('2', '22'),
    italic: paint('3', '23'),
    violet: rgb(167, 139, 250),
    lilac: rgb(196, 181, 253),
    gold: rgb(251, 191, 36),
    rose: rgb(251, 113, 133),
    mint: rgb(110, 231, 183),
    sky: rgb(125, 211, 252),
    gray: rgb(148, 163, 184),
    white: rgb(241, 245, 249)
};
// eslint-disable-next-line no-control-regex
const ANSI_REGEX = /\u001b\[[0-9;]*m/g;
export const stripAnsi = (s) => s.replace(ANSI_REGEX, '');
export const visibleLength = (s) => [...stripAnsi(s)].length;
export const termWidth = () => process.stdout?.columns || 80;
/** Gambar kotak rounded. `lines` boleh berisi ANSI. */
export const box = (lines, title, color = c.violet) => {
    const inner = Math.max(...lines.map(visibleLength), title ? visibleLength(title) + 4 : 0);
    const top = title
        ? `╭─ ${title} ${'─'.repeat(Math.max(0, inner - visibleLength(title) - 1))}╮`
        : `╭${'─'.repeat(inner + 2)}╮`;
    const body = lines.map((l) => `${color('│')} ${l}${' '.repeat(inner - visibleLength(l))} ${color('│')}`);
    const bottom = `╰${'─'.repeat(inner + 2)}╯`;
    return [color(top), ...body, color(bottom)].join('\n');
};
