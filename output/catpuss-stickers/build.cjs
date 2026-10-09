'use strict';

// Renders the cat sticker set.
//   node output/catpuss-stickers/build.cjs               → svg/, public/stickers/pro/*.png, preview.png
//   node output/catpuss-stickers/build.cjs --sheet <png> [ids…]  → contact sheet only (for iteration)

const fs = require('fs');
const path = require('path');
const sharp = require(path.resolve(__dirname, '../../node_modules/sharp'));
const {cat} = require('./cat-art.cjs');
const {VARIANTS} = require('./variants.cjs');

const ROOT = path.resolve(__dirname, '../..');
const PUBLIC_DIR = path.join(ROOT, 'public/stickers/pro');
const SVG_DIR = path.join(__dirname, 'svg');

/** Render at 2× and downsample for smoother edges than librsvg's direct anti-aliasing. */
async function render(svg, size = 512) {
    return sharp(Buffer.from(svg), {density: 144 * size / 512}).resize(size, size, {kernel: 'lanczos3'}).png({compressionLevel: 9}).toBuffer();
}

async function sheet(items, out) {
    const cell = 300, label = 28, cols = Math.min(5, items.length), rows = Math.ceil(items.length / cols);
    const width = cols * cell * 2, height = rows * (cell + label);
    const composites = [];
    for (const [i, v] of items.entries()) {
        const png = await render(cat(v.spec), cell - 20);
        const small = await render(cat(v.spec), 48);
        const tiny = await render(cat(v.spec), 24);
        const x = (i % cols) * cell * 2, y = Math.floor(i / cols) * (cell + label);
        composites.push(
            {input: {create: {width: cell, height: cell + label, channels: 4, background: '#1f1f24'}}, left: x + cell, top: y},
            {input: png, left: x + 10, top: y + 10}, {input: png, left: x + cell + 10, top: y + 10},
            {input: small, left: x + cell - 58, top: y + cell - 50}, {input: tiny, left: x + cell - 86, top: y + cell - 38},
            {input: small, left: x + 2 * cell - 58, top: y + cell - 50}, {input: tiny, left: x + 2 * cell - 86, top: y + cell - 38},
            {input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${cell * 2}" height="${label}"><text x="12" y="20" font-family="Helvetica" font-size="17" fill="#555">${v.name} · :${v.id}:</text></svg>`), left: x, top: y + cell},
        );
    }
    await sharp({create: {width, height, channels: 4, background: '#ffffff'}}).composite(composites).png().toFile(out);
}

async function main() {
    const args = process.argv.slice(2);
    const sheetAt = args.indexOf('--sheet');
    if (sheetAt >= 0) {
        const out = args[sheetAt + 1];
        const ids = args.filter((_, i) => i !== sheetAt && i !== sheetAt + 1);
        await sheet(ids.length ? VARIANTS.filter(v => ids.includes(v.id)) : VARIANTS, out);
        return;
    }
    fs.mkdirSync(SVG_DIR, {recursive: true});
    fs.mkdirSync(PUBLIC_DIR, {recursive: true});
    for (const v of VARIANTS) {
        const svg = cat(v.spec);
        fs.writeFileSync(path.join(SVG_DIR, `${v.id}.svg`), svg);
        fs.writeFileSync(path.join(PUBLIC_DIR, `${v.id}.png`), await render(svg));
    }
    await sheet(VARIANTS, path.join(__dirname, 'preview.png'));
    fs.writeFileSync(path.join(__dirname, 'manifest.json'), `${JSON.stringify(VARIANTS.map(({id, name, tags}) => ({id, name, tags, file: `public/stickers/pro/${id}.png`})), null, 2)}\n`);
    console.log(`Rendered ${VARIANTS.length} stickers.`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
