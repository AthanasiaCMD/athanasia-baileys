import { box, c, termWidth } from './theme.js';
const GLYPHS = {
    A: [' █████╗ ', '██╔══██╗', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
    T: ['████████╗', '╚══██╔══╝', '   ██║   ', '   ██║   ', '   ██║   ', '   ╚═╝   '],
    H: ['██╗  ██╗', '██║  ██║', '███████║', '██╔══██║', '██║  ██║', '╚═╝  ╚═╝'],
    N: ['███╗   ██╗', '████╗  ██║', '██╔██╗ ██║', '██║╚██╗██║', '██║ ╚████║', '╚═╝  ╚═══╝'],
    S: ['███████╗', '██╔════╝', '███████╗', '╚════██║', '███████║', '╚══════╝'],
    I: ['██╗', '██║', '██║', '██║', '██║', '╚═╝']
};
// gradient violet -> gold per baris
const ROW_COLORS = [c.violet, c.violet, c.lilac, c.lilac, c.gold, c.gold];
const renderWord = (word) => Array.from({ length: 6 }, (_, row) => [...word].map((ch) => GLYPHS[ch][row]).join(''));
export const renderBanner = (info) => {
    const wide = termWidth() >= 76;
    const out = [''];
    if (wide) {
        renderWord('ATHANASIA').forEach((line, i) => out.push('  ' + ROW_COLORS[i](line)));
        out.push('  ' + c.gray('─ B A I L E Y S ─ ') + c.dim('WhatsApp Web API · TypeScript / JavaScript'));
    }
    else {
        out.push(box([c.bold(c.violet('✦ ATHANASIA')) + c.gold(' BAILEYS ✦')]));
    }
    const rows = [
        `${c.gray('version ')} ${c.white('v' + info.version)}`,
        info.waVersion ? `${c.gray('wa-web  ')} ${c.white(info.waVersion)}` : '',
        `${c.gray('node    ')} ${c.white(info.node ?? process.version)}`,
        info.repo ? `${c.gray('repo    ')} ${c.sky(info.repo)}` : '',
        ...Object.entries(info.extra ?? {}).map(([k, v]) => `${c.gray(k.padEnd(8))} ${c.white(v)}`)
    ].filter(Boolean);
    out.push('', box(rows, c.gold('info')), '');
    return out.join('\n');
};
export const printBanner = (info, write = (s) => console.log(s)) => write(renderBanner(info));
