#!/usr/bin/env node
'use strict';

// Rebuild only this script's named exports. Never alters masters or deletes files.
// Usage: node output/meme-stickers-2/export-pack.cjs
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');

const ROOT = __dirname;
const MASTER_DIR = path.join(ROOT, 'masters');
const PNG_DIR = path.join(ROOT, 'png');
const CANVAS = 512;
const FIT = 480;
const STICKERS = [
  ['apu-apustaja', 'Apu Apustaja'],
  ['big-brain-wojak', 'Big Brain Wojak'],
  ['bloomer', 'Bloomer'],
  ['chad-1', 'Chad 1'],
  ['chad-2', 'Chad 2'],
  ['chudjak', 'Chudjak'],
  ['coomer', 'Coomer'],
  ['doomer', 'Doomer'],
  ['dumb-wojak', 'Dumb Wojak'],
  ['gigachad', 'Gigachad'],
  ['gondola', 'Gondola'],
  ['grug', 'Grug'],
  ['honkler', 'Honkler'],
  ['npc', 'NPC'],
  ['pepe', 'Pepe'],
  ['rage-pepe', 'Rage Pepe'],
  ['smug-pepe', 'Smug Pepe'],
  ['smug-wojak', 'Smug Wojak'],
  ['soyjak-1', 'Soyjak 1'],
  ['soyjak-2', 'Soyjak 2'],
  ['spurdo', 'Spurdo'],
  ['virgin', 'Virgin'],
  ['wojak', 'Wojak'],
  ['zoomer', 'Zoomer'],
];

function escapeMarkup(value) {
  return String(value).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);
}

async function alphaInfo(input) {
  const { data, info } = await sharp(input).toColourspace('srgb').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let min = 255, max = 0, left = width, top = height, right = -1, bottom = -1;
  let transparentPixels = 0, partialAlphaPixels = 0;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const a = data[(y * width + x) * channels + channels - 1];
      if (a < min) min = a;
      if (a > max) max = a;
      if (a === 0) transparentPixels++;
      else {
        if (a < 255) partialAlphaPixels++;
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  const at = (x, y) => data[(y * width + x) * channels + channels - 1];
  return {
    width, height, channels, alphaMin: min, alphaMax: max,
    transparentPixels, partialAlphaPixels,
    cornerAlpha: [at(0, 0), at(width - 1, 0), at(0, height - 1), at(width - 1, height - 1)],
    nonzeroAlphaBounds: right < 0 ? null : { left, top, width: right - left + 1, height: bottom - top + 1 },
  };
}

async function boundsAboveAlphaOne(input) {
  const { data, info } = await sharp(input).toColourspace('srgb').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  let left = width, top = height, right = -1, bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (data[(y * width + x) * channels + channels - 1] > 1) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < 0) throw new Error('Cannot crop a master with no alpha greater than 1.');
  // Include two source pixels around the visible bounds. Only crop coordinates change;
  // every RGBA value inside the crop is passed unchanged to the normal resize operation.
  left = Math.max(0, left - 2);
  top = Math.max(0, top - 2);
  right = Math.min(width - 1, right + 2);
  bottom = Math.min(height - 1, bottom + 2);
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

async function exportSticker([id, label]) {
  const filename = `${id}.png`;
  const sourcePath = path.join(MASTER_DIR, filename);
  const sourceBuffer = await fs.readFile(sourcePath);
  const metadata = await sharp(sourceBuffer).metadata();
  if (metadata.format !== 'png' || !metadata.hasAlpha) throw new Error(`${filename}: master must be a PNG with alpha.`);
  const source = await alphaInfo(sourceBuffer);
  if (!source.nonzeroAlphaBounds || source.alphaMin !== 0) throw new Error(`${filename}: master must contain a visible subject and transparent pixels.`);

  const trimAlphaOneCanvas = id === 'chad-2' || id === 'zoomer';
  const exportCrop = trimAlphaOneCanvas ? await boundsAboveAlphaOne(sourceBuffer) : source.nonzeroAlphaBounds;
  const exportCropReason = trimAlphaOneCanvas
    ? 'Crop coordinates use alpha > 1 bounds expanded by two source pixels on each side (clamped to image bounds), excluding distant alpha=1 canvas noise from the framing. No alpha or color values inside the crop are changed before resizing.'
    : 'Exact nonzero-alpha bounding box; only fully transparent outer canvas is cropped.';
  // No erosion, masking, pixel repair, or alpha replacement. Chad 2 and Zoomer use
  // the documented crop-coordinate exception above; all other masters use alpha > 0.
  const resized = await sharp(sourceBuffer)
    .extract(exportCrop)
    .resize(FIT, FIT, { fit: 'inside', kernel: 'lanczos3' })
    .ensureAlpha()
    .png({ compressionLevel: 9, palette: false })
    .toBuffer({ resolveWithObject: true });
  const left = Math.floor((CANVAS - resized.info.width) / 2);
  const top = Math.floor((CANVAS - resized.info.height) / 2);
  const padding = {
    left, top,
    right: CANVAS - resized.info.width - left,
    bottom: CANVAS - resized.info.height - top,
  };
  const png = await sharp(resized.data)
    .extend({ ...padding, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
  const output = await alphaInfo(png);
  if (output.width !== CANVAS || output.height !== CANVAS || output.channels !== 4 ||
      output.alphaMin !== 0 || output.alphaMax !== 255 || output.cornerAlpha.some((a) => a !== 0) ||
      Object.values(padding).some((n) => n < 16)) {
    throw new Error(`${filename}: normalized output failed validation.`);
  }
  await fs.writeFile(path.join(PNG_DIR, filename), png);
  return {
    id, label, png,
    validation: {
      id, label, filename, source: `masters/${filename}`, output: `png/${filename}`,
      sourceBytes: sourceBuffer.length,
      sourceSha256: crypto.createHash('sha256').update(sourceBuffer).digest('hex'),
      sourceImage: source,
      exportCrop,
      exportCropReason,
      fittedDimensions: { width: resized.info.width, height: resized.info.height },
      padding,
      outputBytes: png.length,
      outputSha256: crypto.createHash('sha256').update(png).digest('hex'),
      outputImage: output,
      valid: true,
    },
  };
}

async function createContactSheet(stickers) {
  const cols = 4, rows = 6, cardW = 276, cardH = 326, gap = 20, margin = 32;
  const headerH = 104, width = margin * 2 + cols * cardW + (cols - 1) * gap;
  const height = headerH + rows * cardH + (rows - 1) * gap + 48;
  const cards = stickers.map(({ label, id }, i) => {
    const x = margin + (i % cols) * (cardW + gap);
    const y = headerH + Math.floor(i / cols) * (cardH + gap);
    return `<rect x="${x}" y="${y}" width="${cardW}" height="${cardH}" rx="14" fill="#fff" stroke="#dde2e9"/>
      <rect x="${x + 10}" y="${y + 10}" width="256" height="256" rx="8" fill="url(#checker)"/>
      <text x="${x + 16}" y="${y + 289}" font-size="16" font-weight="700" fill="#162039">${escapeMarkup(label)}</text>
      <text x="${x + 16}" y="${y + 311}" font-size="11" fill="#667085">${String(i + 1).padStart(2, '0')} · ${escapeMarkup(id)}.png</text>`;
  }).join('\n');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><pattern id="checker" width="24" height="24" patternUnits="userSpaceOnUse"><rect width="24" height="24" fill="#f8fafc"/><path d="M0 0h12v12H0z M12 12h12v12H12z" fill="#e9edf2"/></pattern></defs>
    <rect width="${width}" height="${height}" fill="#f2f5f9"/>
    <g font-family="Arial, Helvetica, sans-serif">
      <text x="32" y="44" font-size="28" font-weight="700" fill="#162039">All Chat · Meme Stickers 2</text>
      <text x="32" y="72" font-size="14" fill="#5b6576">24 transparent PNG stickers · 512 × 512 px · backgrounds shown for preview only</text>
      ${cards}
      <text x="32" y="${height - 18}" font-size="12" fill="#667085">Individual PNG files have transparent backgrounds. This contact sheet includes a checkerboard for inspection.</text>
    </g>
  </svg>`;
  const overlays = await Promise.all(stickers.map(async ({ png }, i) => ({
    input: await sharp(png).resize(248, 248).png().toBuffer(),
    left: margin + (i % cols) * (cardW + gap) + 14,
    top: headerH + Math.floor(i / cols) * (cardH + gap) + 14,
  })));
  await sharp(Buffer.from(svg)).composite(overlays).png({ compressionLevel: 9 }).toFile(path.join(ROOT, 'preview.png'));
  return { columns: cols, rows, width, height };
}

function createHtml(stickers) {
  const cards = stickers.map(({ id, label, png }, i) => {
    const dataUrl = `data:image/png;base64,${png.toString('base64')}`;
    return `<article class="card"><div class="swatch"><img src="${dataUrl}" width="512" height="512" alt="${escapeMarkup(label)} sticker" loading="lazy"></div><div class="info"><div><h2>${escapeMarkup(label)}</h2><p>${String(i + 1).padStart(2, '0')} · ${escapeMarkup(id)}.png</p></div><a class="download" href="${dataUrl}" download="${escapeMarkup(id)}.png" aria-label="Download ${escapeMarkup(label)} PNG" title="Download PNG">↓</a></div></article>`;
  }).join('\n');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>All Chat · Meme Stickers 2</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#f2f5f9;color:#162039;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{max-width:1260px;margin:auto;padding:36px 24px 48px}header{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;margin-bottom:28px}h1{font-size:clamp(24px,4vw,34px);letter-spacing:-.8px;margin:0 0 10px}header p{color:#5b6576;line-height:1.6;margin:0;font-size:14px}.controls{flex-shrink:0}.controls span{display:block;font-size:12px;font-weight:600;margin-bottom:8px;color:#667085}.toggle{display:flex;gap:4px;border:1px solid #d9dfe8;border-radius:10px;background:white;padding:4px}button{font:inherit;font-size:12px;cursor:pointer;border:0;border-radius:6px;background:transparent;padding:9px 11px;color:#5b6576}button[aria-pressed="true"]{background:#162039;color:#fff}button:focus-visible,a:focus-visible{outline:3px solid #668cff;outline-offset:3px}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}.card{min-width:0;background:#fff;border:1px solid #dde2e9;border-radius:14px;padding:10px;box-shadow:0 2px 3px #16203903}.swatch{aspect-ratio:1;border-radius:8px;display:grid;place-items:center;overflow:hidden;background-color:#f8fafc;background-image:conic-gradient(#e9edf2 25%,transparent 0 50%,#e9edf2 0 75%,transparent 0);background-size:24px 24px}body[data-background="light"] .swatch{background:#fff}body[data-background="dark"] .swatch{background:#242735}.swatch img{display:block;width:100%;height:100%;object-fit:contain}.info{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:13px 5px 4px}h2{font-size:14px;line-height:1.3;margin:0 0 5px}p{margin:0}.info p{font-size:10px;color:#667085;overflow-wrap:anywhere}.download{width:30px;height:30px;flex-shrink:0;display:grid;place-items:center;border-radius:7px;text-decoration:none;color:#162039;background:#f2f5f9;font-size:21px}.download:hover{background:#e6ecf5}footer{margin-top:24px;font-size:12px;line-height:1.7;color:#667085}@media(max-width:920px){.grid{grid-template-columns:repeat(3,minmax(0,1fr))}header{align-items:flex-start;flex-direction:column;gap:16px}}@media(max-width:620px){main{padding:24px 16px}.grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.card{padding:7px}.info{padding:10px 3px 3px}h2{font-size:13px}.info p{font-size:9px}}@media(prefers-reduced-motion:no-preference){button,.download{transition:background .15s ease}}
</style></head><body data-background="checker"><main><header><div><h1>All Chat · Meme Stickers 2</h1><p>24 stickers with transparent backgrounds.<br>512 × 512 px PNG · each sticker includes a clear margin.</p></div><div class="controls"><span>Preview background</span><div class="toggle" role="group" aria-label="Preview background"><button type="button" data-mode="checker" aria-pressed="true">Checkerboard</button><button type="button" data-mode="light" aria-pressed="false">Light</button><button type="button" data-mode="dark" aria-pressed="false">Dark</button></div></div></header><section class="grid" aria-label="Sticker collection">${cards}</section><footer>Background colors are for preview only. The download arrow saves the individual transparent PNG.<br>This preview is self-contained and works offline.</footer></main><script>document.querySelectorAll('[data-mode]').forEach(function(button){button.addEventListener('click',function(){document.body.dataset.background=button.dataset.mode;document.querySelectorAll('[data-mode]').forEach(function(other){other.setAttribute('aria-pressed',String(other===button));});});});</script></body></html>\n`;
}

async function main() {
  const filenames = await fs.readdir(MASTER_DIR);
  const missing = STICKERS.map(([id]) => `${id}.png`).filter((file) => !filenames.includes(file));
  if (missing.length) throw new Error(`Missing required masters: ${missing.join(', ')}. Nothing was exported.`);
  await fs.mkdir(PNG_DIR, { recursive: true });
  const stickers = [];
  for (const spec of STICKERS) stickers.push(await exportSticker(spec));
  const contactSheet = await createContactSheet(stickers);
  await fs.writeFile(path.join(ROOT, 'preview.html'), createHtml(stickers));
  const validation = {
    generatedAt: new Date().toISOString(),
    expectedCount: STICKERS.length,
    exportedCount: stickers.length,
    format: 'PNG, lossless encoding, RGBA',
    canvas: { width: CANVAS, height: CANVAS },
    maxSubjectDimensions: { width: FIT, height: FIT },
    minimumCanvasPadding: 16,
    operation: 'Crop outer canvas to exact nonzero-alpha bounds, except Chad 2 and Zoomer whose crop coordinates use alpha > 1 bounds expanded by two source pixels to exclude distant alpha=1 canvas noise. Source alpha statistics are unchanged. All RGBA values inside each crop are preserved until proportional Lanczos3 resizing; then transparent padding and lossless PNG encoding. No masking, alpha repairs, background removal, or pixel cleanup.',
    allValid: stickers.every((item) => item.validation.valid),
    contactSheet,
    stickers: stickers.map((item) => item.validation),
  };
  await fs.writeFile(path.join(ROOT, 'validation.json'), JSON.stringify(validation, null, 2) + '\n');
  console.log(`Exported ${stickers.length} transparent 512×512 PNGs to ${PNG_DIR}`);
  console.log(`Wrote preview.png, preview.html and validation.json in ${ROOT}`);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
