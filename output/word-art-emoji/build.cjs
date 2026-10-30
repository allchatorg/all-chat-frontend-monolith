'use strict';

// Renders the free word-art custom emojis.
//   node output/word-art-emoji/build.cjs                → svg/, public/emoji/*.png, preview.png
//   node output/word-art-emoji/build.cjs --sheet <png>  → contact sheet only (for iteration)

const fs = require('fs');
const path = require('path');
const sharp = require(path.resolve(__dirname, '../../node_modules/sharp'));

const ROOT = path.resolve(__dirname, '../..');
const PUBLIC_DIR = path.join(ROOT, 'public/emoji');
const SVG_DIR = path.join(__dirname, 'svg');

// Monoline bubble lettering: every glyph is a skeleton stroked at increasing widths
// (halo → extrusion → outline → gradient fill → gloss), so touching strokes merge cleanly.
const W = 48;            // letter stroke
const OUT = 11;          // dark outline on each side
const HALO = 11;         // white sticker edge outside the outline
const DEPTH = 22;        // 3D extrusion drop
const X = 150;           // x-height (skeleton)
const A = 196;           // ascender (skeleton)
const INK = '#2b1d2a';
const EXTRUDE = '#6d28d9';

const GLYPHS = {
    h: {width: 104, d: `M0 ${-A}V0M0 ${-X + 52}A52 52 0 0 1 104 ${-X + 52}V0`},
    a: {width: 112, d: `M0 ${-X / 2}A56 ${X / 2 - 3} 0 1 0 112 ${-X / 2}A56 ${X / 2 - 3} 0 1 0 0 ${-X / 2}ZM112 ${-X + 2}V0`},
};

/** Letters as {char, x, y, rotate} in a shared frame; a little bounce keeps it hand-set. */
function layout(rows, {gap = 66, lineHeight = 292, stagger = 92, bounce = [[-4, 3], [5, -4]]} = {}) {
    const letters = [];
    rows.forEach((row, r) => {
        let x = r * stagger;
        [...row].forEach((char, i) => {
            const [rotate, dy] = bounce[i % bounce.length];
            letters.push({char, x, y: r * lineHeight + dy, rotate});
            x += GLYPHS[char].width + gap;
        });
    });
    return letters;
}

function strokeAll(letters, attrs, dy = 0) {
    return letters.map(({char, x, y, rotate}) =>
        `<path transform="translate(${x} ${y + dy}) rotate(${rotate} ${GLYPHS[char].width / 2} ${-X / 2})" d="${GLYPHS[char].d}" ${attrs}/>`).join('');
}

function wordArt({rows, tilt = -8, scale = 0.77, center = [252, 236], sparkles = []}) {
    const letters = layout(rows);
    const minX = Math.min(...letters.map(l => l.x));
    const maxX = Math.max(...letters.map(l => l.x + GLYPHS[l.char].width));
    const minY = Math.min(...letters.map(l => l.y)) - A;
    const maxY = Math.max(...letters.map(l => l.y));
    const cx = (minX + maxX) / 2, cy = (minY + maxY) / 2;
    const round = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';
    const group = (body, extra = '') => `<g transform="translate(${center[0]} ${center[1]}) rotate(${tilt}) scale(${scale}) translate(${-cx} ${-cy})" ${extra}>${body}</g>`;
    const sparkle = ([x, y, s]) => {
        const d = `M${x} ${y - s}Q${x + s * 0.18} ${y - s * 0.18} ${x + s} ${y}Q${x + s * 0.18} ${y + s * 0.18} ${x} ${y + s}Q${x - s * 0.18} ${y + s * 0.18} ${x - s} ${y}Q${x - s * 0.18} ${y - s * 0.18} ${x} ${y - s}Z`;
        return `<path d="${d}" fill="#fff" stroke="#fff" stroke-width="${2 * (7 + HALO * 0.8)}" stroke-linejoin="round"/>`
            + `<path d="${d}" fill="#ffd43b" stroke="${INK}" stroke-width="14" stroke-linejoin="round" paint-order="stroke"/>`;
    };
    return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<defs>
  <linearGradient id="fill" gradientUnits="userSpaceOnUse" x1="0" y1="${-X - W / 2}" x2="0" y2="${W / 2}">
    <stop offset="0" stop-color="#fff27a"/><stop offset="0.38" stop-color="#ffc21a"/>
    <stop offset="0.72" stop-color="#ff7a2f"/><stop offset="1" stop-color="#ff3d81"/>
  </linearGradient>
  <linearGradient id="stem" gradientUnits="userSpaceOnUse" x1="0" y1="${-A - W / 2}" x2="0" y2="${-X}">
    <stop offset="0" stop-color="#fff9c4"/><stop offset="1" stop-color="#fff27a"/>
  </linearGradient>
  <mask id="inside" maskUnits="userSpaceOnUse" x="-512" y="-512" width="2048" height="2048">
    ${strokeAll(letters, `${round} stroke="#fff" stroke-width="${W - 6}"`)}
  </mask>
</defs>
${sparkles.map(sparkle).join('')}
${group(strokeAll(letters, `${round} stroke="#fff" stroke-width="${W + 2 * (OUT + HALO)}"`)
    + strokeAll(letters, `${round} stroke="#fff" stroke-width="${W + 2 * (OUT + HALO)}"`, DEPTH)
    + strokeAll(letters, `${round} stroke="${INK}" stroke-width="${W + 2 * OUT}"`, DEPTH)
    + strokeAll(letters, `${round} stroke="${EXTRUDE}" stroke-width="${W}"`, DEPTH)
    + strokeAll(letters, `${round} stroke="${INK}" stroke-width="${W + 2 * OUT}"`)
    + strokeAll(letters, `${round} stroke="url(#stem)" stroke-width="${W}"`)
    // Ascenders keep the pale stem colour; the main gradient spans the x-height only.
    + strokeAll(letters, `${round} stroke="url(#fill)" stroke-width="${W}"`).replaceAll(`M0 ${-A}V0`, `M0 ${-X - 10}V0`)
    + `<g mask="url(#inside)"><g transform="translate(${-W * 0.17} ${-W * 0.2})">${strokeAll(letters, `${round} stroke="#fff" stroke-opacity="0.55" stroke-width="${W * 0.2}"`)}</g></g>`)}
</svg>`;
}

const EMOJIS = [
    {id: 'haha', name: 'Haha', tags: ['haha', 'hehe', 'lol', 'lmao', 'laugh', 'funny', 'word art'],
        spec: {rows: ['ha', 'ha'], sparkles: [[426, 86, 30], [462, 150, 15], [64, 412, 25]]}},
];

/** Render at 2× and downsample for smoother edges than librsvg's direct anti-aliasing. */
async function render(svg, size = 512) {
    return sharp(Buffer.from(svg), {density: 144 * size / 512}).resize(size, size, {kernel: 'lanczos3'}).png({compressionLevel: 9}).toBuffer();
}

async function sheet(items, out) {
    const cell = 300, cols = items.length;
    const composites = [];
    for (const [i, v] of items.entries()) {
        const svg = wordArt(v.spec);
        const big = await render(svg, cell - 20), small = await render(svg, 48), tiny = await render(svg, 24);
        const x = i * cell * 2;
        composites.push(
            {input: {create: {width: cell, height: cell, channels: 4, background: '#1f1f24'}}, left: x + cell, top: 0},
            {input: big, left: x + 10, top: 10}, {input: big, left: x + cell + 10, top: 10},
            {input: small, left: x + cell - 58, top: cell - 50}, {input: tiny, left: x + cell - 86, top: cell - 38},
            {input: small, left: x + 2 * cell - 58, top: cell - 50}, {input: tiny, left: x + 2 * cell - 86, top: cell - 38},
        );
    }
    await sharp({create: {width: cols * cell * 2, height: cell, channels: 4, background: '#ffffff'}}).composite(composites).png().toFile(out);
}

async function main() {
    const args = process.argv.slice(2);
    const sheetAt = args.indexOf('--sheet');
    if (sheetAt >= 0) {
        await sheet(EMOJIS, args[sheetAt + 1]);
        return;
    }
    fs.mkdirSync(SVG_DIR, {recursive: true});
    fs.mkdirSync(PUBLIC_DIR, {recursive: true});
    for (const v of EMOJIS) {
        const svg = wordArt(v.spec);
        fs.writeFileSync(path.join(SVG_DIR, `${v.id}.svg`), svg);
        fs.writeFileSync(path.join(PUBLIC_DIR, `${v.id}.png`), await render(svg));
    }
    await sheet(EMOJIS, path.join(__dirname, 'preview.png'));
    console.log(`Rendered ${EMOJIS.length} word-art emoji.`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
