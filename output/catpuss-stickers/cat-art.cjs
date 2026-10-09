'use strict';

// Vector kawaii-cat ("Catpuss") sticker art, drawn in the style of the client's three cat samples:
// a chubby white cat with a dark outline, pink ears and beans, striped blush, ^ ^ eyes and a
// w-mouth. Every sticker is one 512×512 SVG; `cat(spec)` composes the shared parts below.

const INK = '#2d1e22';
const WHITE = '#ffffff';
const SHADE = '#e9e3f2';
const EAR = '#f6a3b5';
const EAR_LIGHT = '#fcc9d3';
const BLUSH = '#fbb3c1';
const BLUSH_LINE = '#f08ba0';
const MOUTH = '#a8344f';
const TONGUE = '#f78aa1';
const YELLOW = '#ffcd45';
const CREAM = '#ffe28a';
const HEART = '#f4607d';
const HEART_LIGHT = '#ff9aae';
const TEAR = '#8fd3ff';
const TEAR_DARK = '#5fb6f2';
const ANGER = '#ff4d6a';

const OUT = 9; // outline width of the silhouette and props
const FACE = 12; // face-line width

const f = n => Math.round(n * 10) / 10;
const xy = ([x, y]) => `${f(x)} ${f(y)}`;
const at = (x, y, rot = 0, s = 1) => `transform="translate(${f(x)} ${f(y)})${rot ? ` rotate(${rot})` : ''}${s !== 1 ? ` scale(${s})` : ''}"`;

function line(d, w = FACE, color = INK, extra = '') {
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
}

function shape(d, fill, w = OUT, extra = '') {
    return `<path d="${d}" fill="${fill}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" ${extra}/>`;
}

/** A white limb: one wide ink stroke under a narrower white one gives an outlined capsule. */
function limb(d, w = 60) {
    return line(d, w + OUT * 2, INK) + line(d, w, WHITE);
}

/* ------------------------------------------------------------------ silhouette */

function superellipse(cx, cy, rx, ryTop, ryBottom, n, steps = 120) {
    const out = [];
    for (let i = 0; i < steps; i++) {
        const t = i / steps * Math.PI * 2;
        const c = Math.cos(t), s = Math.sin(t);
        out.push([cx + rx * Math.sign(c) * Math.abs(c) ** (2 / n), cy + (s < 0 ? ryTop : ryBottom) * Math.sign(s) * Math.abs(s) ** (2 / n)]);
    }
    return `M${out.map(xy).join('L')}Z`;
}

const HEAD = superellipse(256, 258, 196, 128, 142, 2.35);

/** A curved fur spike: base centred on (x, y), pointing along `angle` (0 = up, clockwise). */
function tuft(x, y, angle, len, w, curl = 0) {
    const a = angle * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    const p = ([u, v]) => [x + u * c - v * s, y + u * s + v * c];
    const bl = p([-w / 2, 0]), br = p([w / 2, 0]), tip = p([curl, -len]);
    const c1 = p([-w * 0.12 + curl * 0.3, -len * 0.55]), c2 = p([w * 0.22 + curl * 0.55, -len * 0.48]);
    return `M${xy(bl)} Q${xy(c1)} ${xy(tip)} Q${xy(c2)} ${xy(br)} Z`;
}

/** Tufts listed for the left side are mirrored onto the right. */
function mirrored(list) {
    return list.flatMap(([x, y, a, len, w, curl]) => [tuft(x, y, a, len, w, curl), tuft(512 - x, y, -a, len, w, -curl)]);
}

const FUR = [
    tuft(232, 142, -16, 22, 26, -4), tuft(254, 138, 0, 30, 26, 4), tuft(277, 142, 18, 20, 22, 5),
    ...mirrored([[70, 264, -100, 24, 34, -6], [70, 298, -118, 26, 34, -7], [88, 332, -136, 18, 28, -4], [84, 404, -108, 16, 30, -4]]),
];

const EARS = {
    up: [
        'M84 214 Q86 120 112 62 Q122 44 140 58 Q186 96 222 146 Z',
        'M428 214 Q426 120 400 62 Q390 44 372 58 Q326 96 290 146 Z',
    ],
    down: [
        'M80 200 Q54 172 34 132 Q28 116 46 116 Q110 124 170 150 Z',
        'M432 200 Q458 172 478 132 Q484 116 466 116 Q402 124 342 150 Z',
    ],
};

const INNER_EARS = {
    up: [false, true].map(flip => `<g ${flip ? 'transform="translate(512 0) scale(-1 1)"' : ''}>
<path d="M106 198 Q106 132 122 90 Q129 78 140 88 Q170 116 198 152 Q150 166 106 198Z" fill="url(#earFill)"/>
<path d="M124 168 Q124 128 132 104 Q152 124 168 148 Q146 154 124 168Z" fill="${EAR_LIGHT}" opacity="0.85"/>
<path d="M108 168 Q112 128 122 100" fill="none" stroke="#ee8aa1" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
<path d="M100 206 Q104 188 114 176 Q118 190 124 194 Q128 176 138 166 Q142 184 150 194 Q158 186 170 182 Q166 198 162 208Z" fill="${WHITE}"/></g>`).join(''),
    down: `<path d="M92 182 Q72 160 58 134 Q104 138 150 158 Q118 162 92 182Z" fill="${EAR}"/>
<path d="M420 182 Q440 160 454 134 Q408 138 362 158 Q394 162 420 182Z" fill="${EAR}"/>`,
};

const BODY = 'M92 316 C62 400 58 460 90 484 L422 484 C454 460 450 400 420 316 Z';

/* ------------------------------------------------------------------ paws */

/** A paw seen from above (toe lines) or palm-out (pink beans), in local coordinates facing up. */
function paw(x, y, {r = 38, rot = 0, beans = false, toes = true} = {}) {
    const ry = r * 0.9;
    const body = `<ellipse cx="0" cy="0" rx="${r}" ry="${f(ry)}" fill="url(#pawShade)" stroke="${INK}" stroke-width="${OUT}"/>`;
    const detail = beans
        ? `<path d="M${f(-r * 0.42)} ${f(r * 0.38)} Q${f(-r * 0.46)} ${f(-r * 0.06)} 0 ${f(-r * 0.06)} Q${f(r * 0.46)} ${f(-r * 0.06)} ${f(r * 0.42)} ${f(r * 0.38)} Q0 ${f(r * 0.6)} ${f(-r * 0.42)} ${f(r * 0.38)}Z" fill="${EAR}"/>
<circle cx="${f(-r * 0.52)}" cy="${f(-r * 0.36)}" r="${f(r * 0.17)}" fill="${EAR}"/><circle cx="0" cy="${f(-r * 0.56)}" r="${f(r * 0.18)}" fill="${EAR}"/><circle cx="${f(r * 0.52)}" cy="${f(-r * 0.36)}" r="${f(r * 0.17)}" fill="${EAR}"/>`
        : toes ? line(`M${f(-r * 0.3)} ${f(-ry + 1)} l${f(r * 0.04)} ${f(r * 0.36)} M${f(r * 0.3)} ${f(-ry + 1)} l${f(-r * 0.04)} ${f(r * 0.36)}`, 6.5) : '';
    return `<g ${at(x, y, rot)}>${body}${detail}</g>`;
}

/** Front paws resting at the bottom of the body. */
const restPaws = () => paw(200, 468, {r: 40}) + paw(312, 468, {r: 40});

/** One raised arm rising from the body side, palm out, with a soft curve at the elbow. */
function raisedArm(side, {to = [50, 228], from = [112, 404], bend = -14, rot = -16, r = 48, w = 70} = {}) {
    const m = side === 'left' ? p => p : ([x, y]) => [512 - x, y];
    const [fx, fy] = m(from), [tx, ty] = m(to);
    const mid = m([(from[0] + to[0]) / 2 + bend, (from[1] + to[1]) / 2]);
    const d = `M${f(fx)} ${f(fy)} Q${xy(mid)} ${f(tx)} ${f(ty + r * 0.5)}`;
    return limb(d, w) + paw(tx, ty, {r, rot: side === 'left' ? rot : -rot, beans: true});
}

/* ------------------------------------------------------------------ face */

const EYES_AT = {l: [186, 252], r: [326, 252]};

/** Thick closed-smile crescent, tapered at the ends like the samples. */
function crescent(cx, cy, {w = 66, h = 38, t = 16, flip = false} = {}) {
    const s = flip ? -1 : 1, l = cx - w / 2, r = cx + w / 2;
    return `<path d="M${f(l)} ${f(cy + 6 * s)} Q${f(cx)} ${f(cy - h * s)} ${f(r)} ${f(cy + 6 * s)} Q${f(cx)} ${f(cy - (h - t * 1.9) * s)} ${f(l)} ${f(cy + 6 * s)}Z" fill="${INK}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
}

/** Big glossy kawaii eye. `look` shifts the pupil highlight; `size` scales it. */
function roundEye(cx, cy, {size = 1, look = [0, 0], sparkle = false} = {}) {
    const rx = 23 * size, ry = 28 * size;
    const [lx, ly] = look;
    const extra = sparkle
        ? `<ellipse cx="${f(cx)}" cy="${f(cy + ry * 0.45)}" rx="${f(rx * 0.7)}" ry="${f(ry * 0.32)}" fill="#7a5fa8" opacity="0.75"/>
<circle cx="${f(cx + rx * 0.35 + lx)}" cy="${f(cy + ry * 0.3 + ly)}" r="${f(4.5 * size)}" fill="${WHITE}"/>
<path d="M${f(cx - rx * 0.85)} ${f(cy + ry * 0.62)} Q${f(cx)} ${f(cy + ry * 1.12)} ${f(cx + rx * 0.85)} ${f(cy + ry * 0.62)}" fill="none" stroke="${TEAR}" stroke-width="${f(5 * size)}" stroke-linecap="round"/>`
        : `<circle cx="${f(cx + rx * 0.38 + lx)}" cy="${f(cy + ry * 0.38 + ly)}" r="${f(4 * size)}" fill="${WHITE}"/>`;
    return `<ellipse cx="${f(cx + lx * 0.4)}" cy="${f(cy + ly * 0.4)}" rx="${f(rx)}" ry="${f(ry)}" fill="${INK}"/>${extra}
<circle cx="${f(cx - rx * 0.3 + lx)}" cy="${f(cy - ry * 0.34 + ly)}" r="${f(9 * size)}" fill="${WHITE}"/>`;
}

function heartPath(r) {
    return `M0 ${f(r * 0.92)} C${f(-r * 1.55)} ${f(-r * 0.05)} ${f(-r * 0.78)} ${f(-r * 1.18)} 0 ${f(-r * 0.42)} C${f(r * 0.78)} ${f(-r * 1.18)} ${f(r * 1.55)} ${f(-r * 0.05)} 0 ${f(r * 0.92)}Z`;
}

function heart(x, y, r, {rot = 0, w = OUT * 0.9, glossy = true} = {}) {
    const shine = glossy
        ? `<ellipse cx="${f(-r * 0.45)}" cy="${f(-r * 0.42)}" rx="${f(r * 0.2)}" ry="${f(r * 0.13)}" transform="rotate(-35 ${f(-r * 0.45)} ${f(-r * 0.42)})" fill="${WHITE}" opacity="0.9"/><circle cx="${f(-r * 0.18)}" cy="${f(-r * 0.5)}" r="${f(r * 0.06)}" fill="${WHITE}" opacity="0.9"/>`
        : '';
    return `<g ${at(x, y, rot)}><path d="${heartPath(r)}" fill="url(#heartFill)" stroke="${INK}" stroke-width="${f(w)}" stroke-linejoin="round"/>${shine}</g>`;
}

const eyes = {
    happy: () => crescent(186, 258) + crescent(326, 258),
    open: (o = {}) => roundEye(186, 252, o) + roundEye(326, 252, o),
    sparkle: () => roundEye(186, 250, {size: 1.25, sparkle: true}) + roundEye(326, 250, {size: 1.25, sparkle: true}),
    heart: () => heart(186, 250, 38, {rot: -8}) + heart(326, 250, 38, {rot: 8}),
    wide: () => `<circle cx="186" cy="250" r="26" fill="${WHITE}" stroke="${INK}" stroke-width="9"/><circle cx="186" cy="252" r="10" fill="${INK}"/>
<circle cx="326" cy="250" r="26" fill="${WHITE}" stroke="${INK}" stroke-width="9"/><circle cx="326" cy="252" r="10" fill="${INK}"/>`,
    dot: () => `<ellipse cx="190" cy="254" rx="11" ry="13" fill="${INK}"/><ellipse cx="322" cy="254" rx="11" ry="13" fill="${INK}"/>`,
    squint: () => line('M164 232 L208 254 L164 276', 14) + line('M348 232 L304 254 L348 276', 14),
    sleep: () => crescent(186, 250, {flip: true, h: 26, t: 13}) + crescent(326, 250, {flip: true, h: 26, t: 13})
        + line('M152 256 l-12 8 M220 256 l12 8 M292 256 l-12 8 M360 256 l12 8', 7),
    smug: () => line('M152 242 Q186 234 220 246', 12) + `<path d="M160 246 Q186 240 214 248 Q212 270 192 272 Q168 272 160 246Z" fill="${INK}"/>`
        + line('M292 246 Q326 234 360 242', 12) + `<path d="M298 248 Q326 240 352 246 Q344 272 320 272 Q300 270 298 248Z" fill="${INK}"/>`
        + `<circle cx="200" cy="254" r="4" fill="${WHITE}"/><circle cx="340" cy="254" r="4" fill="${WHITE}"/>`,
    lidded: () => line('M154 248 L218 248', 12) + `<path d="M162 248 Q162 272 188 272 Q212 272 212 248Z" fill="${INK}"/>`
        + line('M294 248 L358 248', 12) + `<path d="M300 248 Q300 272 324 272 Q350 272 350 248Z" fill="${INK}"/>`,
    angry: () => `<path d="M162 240 L212 256 Q210 280 188 280 Q164 280 162 252Z" fill="${INK}"/><path d="M350 240 L300 256 Q302 280 324 280 Q348 280 350 252Z" fill="${INK}"/>
<circle cx="194" cy="266" r="4" fill="${WHITE}"/><circle cx="334" cy="266" r="4" fill="${WHITE}"/>`,
    sad: () => roundEye(186, 254, {size: 1.05, sparkle: true}) + roundEye(326, 254, {size: 1.05, sparkle: true}),
    wink: () => roundEye(186, 252) + line('M300 258 Q326 236 352 258', 13),
    swirl: () => [186, 326].map(cx => line(`M${cx} 252 m0 0 a4 4 0 0 1 8 0 a8 8 0 0 1 -16 0 a12 12 0 0 1 24 0 a16 16 0 0 1 -32 0 a20 20 0 0 1 40 0`, 7)).join(''),
    cry: () => line('M160 252 Q186 264 214 250', 13) + line('M298 250 Q326 264 352 252', 13),
    look: () => roundEye(186, 254, {look: [6, 6]}) + roundEye(326, 254, {look: [6, 6]}),
    up: () => roundEye(186, 252, {look: [4, -6]}) + roundEye(326, 252, {look: [4, -6]}),
};

const brows = {
    angry: () => line('M150 214 L214 236', 14) + line('M362 214 L298 236', 14),
    sad: () => line('M156 222 Q182 214 208 204', 11) + line('M356 222 Q330 214 304 204', 11),
    worried: () => line('M160 214 Q184 210 206 200', 10) + line('M352 214 Q328 210 306 200', 10),
    raised: () => line('M160 214 Q186 204 212 214', 10) + line('M300 196 Q326 182 352 194', 10),
    determined: () => line('M152 218 L212 230', 13) + line('M360 218 L300 230', 13),
};

function blush({scale = 1, strong = false} = {}) {
    const one = (cx, cy) => `<ellipse cx="${cx}" cy="${cy}" rx="${f(46 * scale)}" ry="${f(28 * scale)}" fill="url(#${strong ? 'blushStrong' : 'blushFill'})"/>
<path d="M${cx - 18} ${cy + 8} l8 -14 M${cx - 4} ${cy + 8} l8 -14 M${cx + 10} ${cy + 8} l8 -14" stroke="${strong ? '#e8607c' : BLUSH_LINE}" stroke-width="5.5" stroke-linecap="round" opacity="0.9"/>`;
    return one(150, 300) + one(362, 300);
}

const W_LIP = 'M222 282 Q232 296 244 290 Q252 286 256 280 Q260 286 268 290 Q280 296 290 282';

const mouths = {
    open: () => `<path d="M230 288 Q232 340 256 344 Q280 340 282 288 Q268 296 256 286 Q244 296 230 288Z" fill="url(#mouthFill)" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
<path d="M237 320 Q256 300 275 320 Q271 340 256 341 Q241 340 237 320Z" fill="url(#tongueFill)"/><ellipse cx="249" cy="320" rx="5" ry="3.5" fill="${WHITE}" opacity="0.6"/>` + line(W_LIP, 9),
    w: () => line('M226 284 Q236 302 248 296 Q254 292 256 284 Q258 292 264 296 Q276 302 286 284', 10),
    small: () => `<path d="M240 292 Q242 318 256 320 Q270 318 272 292 Q264 298 256 290 Q248 298 240 292Z" fill="url(#mouthFill)" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>`
        + line('M230 286 Q238 298 248 294 Q254 290 256 284 Q258 290 264 294 Q274 298 282 286', 9),
    big: () => `<path d="M212 286 Q256 300 300 286 Q298 352 256 360 Q214 352 212 286Z" fill="url(#mouthFill)" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>
<path d="M226 334 Q256 310 286 334 Q276 356 256 357 Q236 356 226 334Z" fill="url(#tongueFill)"/>`,
    o: () => `<ellipse cx="256" cy="312" rx="17" ry="22" fill="url(#mouthFill)" stroke="${INK}" stroke-width="9"/><ellipse cx="256" cy="322" rx="9" ry="8" fill="url(#tongueFill)"/>`,
    frown: () => line('M232 310 Q256 290 280 310', 10),
    wobbly: () => line('M222 306 q9 -12 17 0 t17 0 t17 0 t17 0', 9),
    wail: () => `<path d="M224 324 Q236 290 256 290 Q276 290 288 324 Q290 346 256 348 Q222 346 224 324Z" fill="url(#mouthFill)" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>
<path d="M234 336 Q256 318 278 336 Q272 346 256 346 Q240 346 234 336Z" fill="url(#tongueFill)"/>`,
    smirk: () => line('M226 296 Q260 310 292 282', 10) + line('M286 274 Q296 280 294 290', 7),
    flat: () => line('M236 300 L276 300', 10),
    tongue: () => `<path d="M244 294 Q244 334 262 334 Q280 334 278 300Z" fill="${TONGUE}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>` + line('M262 304 L263 322', 5, '#e0607a')
        + line(W_LIP, 10),
    scream: () => `<path d="M214 290 Q256 280 298 290 Q304 366 256 372 Q208 366 214 290Z" fill="url(#mouthFill)" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>
<path d="M226 348 Q256 324 286 348 Q278 368 256 369 Q234 368 226 348Z" fill="url(#tongueFill)"/>
<path d="M222 292 L232 312 L240 290Z M290 292 L280 312 L272 290Z" fill="${WHITE}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`,
    grin: () => `<path d="M224 288 Q256 300 288 288 Q284 322 256 324 Q228 322 224 288Z" fill="url(#mouthFill)" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
<path d="M238 312 Q256 302 274 312 Q268 322 256 322 Q244 322 238 312Z" fill="url(#tongueFill)"/>`,
    pout: () => line('M246 290 Q262 296 250 304 Q264 310 246 318', 9),
};

/* ------------------------------------------------------------------ effects & props */

function sparkle(x, y, r, {rot = 0, fill = CREAM} = {}) {
    const k = r * 0.2;
    return `<path ${at(x, y, rot)} d="M0 ${-r} Q${f(k)} ${f(-k)} ${r} 0 Q${f(k)} ${f(k)} 0 ${r} Q${f(-k)} ${f(k)} ${-r} 0 Q${f(-k)} ${f(-k)} 0 ${-r}Z" fill="${fill}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`;
}

/** Radiating yellow wedges, like the "yay!" marks in the cheering sample. */
function burst(x, y, angles, {r1 = 18, r2 = 62, w1 = 6, w2 = 18} = {}) {
    return angles.map(a => `<path ${at(x, y, a)} d="M${-w1 / 2} ${-r1} L${w1 / 2} ${-r1} L${w2 / 2} ${-r2} L${-w2 / 2} ${-r2}Z" fill="${YELLOW}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>`).join('');
}

/** Short yellow "action" ticks. */
function ticks(x, y, angles, {len = 26, gap = 0} = {}) {
    return angles.map(a => `<g ${at(x, y, a)}>${line(`M0 ${-gap} L0 ${-gap - len}`, 14, INK)}${line(`M0 ${-gap} L0 ${-gap - len}`, 6, YELLOW)}</g>`).join('');
}

function drop(x, y, s = 1, {rot = 0, fill = TEAR} = {}) {
    return `<g ${at(x, y, rot, s)}><path d="M0 -26 Q18 -2 16 10 A16 16 0 1 1 -16 10 Q-18 -2 0 -26Z" fill="${fill}" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><ellipse cx="-6" cy="8" rx="4" ry="6" fill="${WHITE}"/></g>`;
}

function angerMark(x, y, s = 1) {
    return `<g ${at(x, y, 0, s)}>${line('M-20 -7 Q-7 -7 -7 -20 M7 -20 Q7 -7 20 -7 M20 7 Q7 7 7 20 M-7 20 Q-7 7 -20 7', 17, INK)}${line('M-20 -7 Q-7 -7 -7 -20 M7 -20 Q7 -7 20 -7 M20 7 Q7 7 7 20 M-7 20 Q-7 7 -20 7', 9, ANGER)}</g>`;
}

function zee(x, y, s) {
    const d = `M${f(x)} ${f(y)} l${f(26 * s)} 0 l${f(-26 * s)} ${f(28 * s)} l${f(26 * s)} 0`;
    return line(d, 15 * Math.min(1, s + 0.2), INK) + line(d, 7 * Math.min(1, s + 0.2), '#a9b6ff');
}

function question(x, y, s = 1, rot = 0) {
    const d = 'M-15 -14 Q-15 -36 2 -36 Q20 -36 20 -18 Q20 -6 4 0 Q0 2 0 12';
    return `<g ${at(x, y, rot, s)}>${line(d, 20, INK)}${line(d, 10, '#ffb84d')}<circle cx="0" cy="34" r="10" fill="#ffb84d" stroke="${INK}" stroke-width="5"/></g>`;
}

function exclaim(x, y, s = 1, rot = 0) {
    return `<g ${at(x, y, rot, s)}>${line('M0 -40 L0 4', 22, INK)}${line('M0 -40 L0 4', 12, ANGER)}<circle cx="0" cy="26" r="10" fill="${ANGER}" stroke="${INK}" stroke-width="5"/></g>`;
}

const confettiColors = ['#7cc8ff', '#ffcd45', '#f6849b', '#9be37a', '#b79cff'];
function confetti(items) {
    return items.map(([x, y, rot, i, round]) => round
        ? `<circle cx="${x}" cy="${y}" r="9" fill="${confettiColors[i % 5]}" stroke="${INK}" stroke-width="5"/>`
        : `<rect ${at(x, y, rot)} x="-8" y="-14" width="16" height="28" rx="4" fill="${confettiColors[i % 5]}" stroke="${INK}" stroke-width="5"/>`).join('');
}

const defs = `<defs>
<linearGradient id="heartFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HEART_LIGHT}"/><stop offset="1" stop-color="${HEART}"/></linearGradient>
<linearGradient id="lens" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3b3350"/><stop offset="1" stop-color="#141019"/></linearGradient>
<linearGradient id="flame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff5a3d"/><stop offset="1" stop-color="#ffb43d"/></linearGradient>
<linearGradient id="earFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7a9ba"/><stop offset="1" stop-color="#f493a9"/></linearGradient>
<linearGradient id="mouthFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9e2c46"/><stop offset="1" stop-color="#cc4a66"/></linearGradient>
<linearGradient id="tongueFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9db2"/><stop offset="1" stop-color="#f27994"/></linearGradient>
<radialGradient id="blushFill"><stop offset="0" stop-color="#fba2b5" stop-opacity="0.95"/><stop offset="0.6" stop-color="#fcb3c2" stop-opacity="0.75"/><stop offset="1" stop-color="#fdc4cf" stop-opacity="0"/></radialGradient>
<radialGradient id="blushStrong"><stop offset="0" stop-color="#f7839c" stop-opacity="0.95"/><stop offset="0.65" stop-color="#f996aa" stop-opacity="0.8"/><stop offset="1" stop-color="#fbb0bf" stop-opacity="0"/></radialGradient>
<radialGradient id="pawShade" cx="0.5" cy="0.15" r="0.9"><stop offset="0.55" stop-color="${WHITE}"/><stop offset="1" stop-color="${SHADE}"/></radialGradient>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
<filter id="rim" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="8"/></filter>
<filter id="inner" filterUnits="userSpaceOnUse" x="-64" y="-64" width="640" height="640" color-interpolation-filters="sRGB">
<feComponentTransfer in="SourceAlpha" result="outside"><feFuncA type="table" tableValues="1 0"/></feComponentTransfer>
<feOffset in="outside" dx="-10" dy="-12" result="shifted"/><feGaussianBlur in="shifted" stdDeviation="10" result="soft"/>
<feComposite in="soft" in2="SourceAlpha" operator="in" result="edge"/>
<feFlood flood-color="#e2daee"/><feComposite in2="edge" operator="in"/>
</filter>
<filter id="sticker" x="-15%" y="-15%" width="130%" height="130%" color-interpolation-filters="sRGB">
<feGaussianBlur in="SourceAlpha" stdDeviation="7" result="blur"/>
<feComponentTransfer in="blur" result="mask"><feFuncA type="linear" slope="14" intercept="-0.6"/></feComponentTransfer>
<feFlood flood-color="${WHITE}"/><feComposite in2="mask" operator="in" result="border"/>
<feGaussianBlur in="mask" stdDeviation="2.5" result="shadowBlur"/>
<feFlood flood-color="#1d1428" flood-opacity="0.22"/><feComposite in2="shadowBlur" operator="in" result="shadow"/>
<feMerge><feMergeNode in="shadow"/><feMergeNode in="border"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter>
</defs>`;

const props = {
    /** Big glossy heart held against the chest (sample 3). */
    heartHug: () => limb('M92 440 Q112 404 146 394', 56) + limb('M420 448 Q400 414 366 406', 56)
        + heart(256, 410, 104, {w: OUT}) + paw(150, 390, {r: 40, rot: 55}) + paw(362, 402, {r: 40, rot: -55}),

    /** Laptop seen from behind its lid, paws tapping the top edge (sample 2). */
    laptop: () => `<path d="M104 472 L408 472 L420 490 L92 490Z" fill="#9c97b3" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>
<rect x="132" y="360" width="248" height="118" rx="16" fill="#bdb8d1" stroke="${INK}" stroke-width="${OUT}"/>
<path d="M146 372 L366 372" stroke="#d6d2e6" stroke-width="8" stroke-linecap="round"/>
<g transform="translate(256 424)"><circle r="34" fill="#ffd9e3" opacity="0.55" filter="url(#soft)"/>
<path d="M-24 14 Q-28 -8 -22 -26 L-10 -12 Q0 -16 10 -12 L22 -26 Q28 -8 24 14 Q0 26 -24 14Z" fill="#fff1f4"/></g>`
        + paw(178, 362, {r: 34, rot: 0}) + paw(334, 362, {r: 34, rot: 0}),

    restPaws,

    /** Paws pressed together under the chin. */
    pray: () => paw(232, 396, {r: 36, rot: 22}) + paw(280, 396, {r: 36, rot: -22}) + restPaws(),


    /** One paw stroking the chin. */
    chin: () => limb('M398 446 Q384 398 320 384', 58) + paw(306, 374, {r: 36, rot: -30}) + paw(196, 468, {r: 40}),

    /** Thumbs-up paw. */
    thumb: () => `<g ${at(352, 410, -8)}>${limb('M14 -26 L18 -70', 30)}
<rect x="-44" y="-34" width="88" height="70" rx="30" fill="${WHITE}" stroke="${INK}" stroke-width="${OUT}"/>
${line('M-22 -2 L22 -2 M-22 18 L22 18', 7)}</g>` + paw(184, 468, {r: 40}),

    /** Party hat between the ears. */
    partyHat: () => `<g ${at(262, 138, 14)}><clipPath id="hat"><path d="M-48 0 L0 -126 L48 0 Q0 16 -48 0Z"/></clipPath>
<path d="M-48 0 L0 -126 L48 0 Q0 16 -48 0Z" fill="#8fd0ff"/>
<g clip-path="url(#hat)"><path d="M-60 -24 L60 -54 L60 -32 L-60 -2Z M-60 -76 L60 -106 L60 -84 L-60 -54Z" fill="${YELLOW}"/></g>
<path d="M-48 0 L0 -126 L48 0 Q0 16 -48 0Z" fill="none" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>
<circle cx="0" cy="-128" r="18" fill="${HEART_LIGHT}" stroke="${INK}" stroke-width="9"/></g>`,

    /** Droopy nightcap. */
    nightcap: () => `<path d="M150 168 Q170 66 274 62 Q370 60 420 150 Q436 186 418 214 Q404 160 352 132 Q340 160 300 156 Q220 150 150 168Z" fill="#8f9dff" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>
<path d="M140 174 Q240 136 356 150" fill="none" stroke="${INK}" stroke-width="${44 + OUT * 2}" stroke-linecap="round"/>
<path d="M140 174 Q240 136 356 150" fill="none" stroke="${WHITE}" stroke-width="44" stroke-linecap="round"/>
<circle cx="420" cy="222" r="24" fill="${WHITE}" stroke="${INK}" stroke-width="${OUT}"/>
${sparkle(270, 96, 12, {fill: '#fff6c9'})}${sparkle(330, 106, 9, {fill: '#fff6c9'})}`,

    /** Round nerd glasses. */
    glasses: () => `<circle cx="186" cy="252" r="46" fill="none" stroke="${INK}" stroke-width="10"/>
<circle cx="326" cy="252" r="46" fill="none" stroke="${INK}" stroke-width="10"/>
${line('M232 248 Q256 236 280 248', 10)}${line('M140 246 L96 234 M372 246 L416 234', 10)}
${line('M160 226 L176 214 M300 226 L316 214', 6, WHITE)}`,

    sunglasses: () => `<path d="M128 228 L238 228 Q240 280 196 284 Q140 286 128 228Z M274 228 L384 228 Q372 286 316 284 Q272 280 274 228Z" fill="url(#lens)" stroke="${INK}" stroke-width="10" stroke-linejoin="round"/>
${line('M120 226 L392 226', 12)}${line('M238 236 Q256 226 274 236', 10)}
${line('M150 240 L176 262 M170 238 L182 248 M296 240 L322 262 M316 238 L328 248', 6, WHITE, 'opacity="0.8"')}`,

    /** Lightbulb idea. */
    bulb: () => `<g ${at(418, 92, 14)}>
${line('M0 -66 L0 -54 M-46 -46 L-38 -38 M46 -46 L38 -38 M-62 -4 L-50 -4 M62 -4 L50 -4', 8, YELLOW)}
<path d="M-30 18 Q-42 2 -40 -14 Q-36 -46 0 -48 Q36 -46 40 -14 Q42 2 30 18 L24 30 L-24 30Z" fill="${CREAM}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
<rect x="-22" y="30" width="44" height="22" rx="7" fill="#b9b6c9" stroke="${INK}" stroke-width="8"/>
${line('M-14 -6 Q0 8 14 -6', 6, '#f2a93b')}${line('M-20 -28 Q-12 -38 -2 -38', 6, WHITE)}</g>`,

    /** A dumbbell gripped in a raised paw. */
    dumbbell: (x, y, rot = 0) => `<g ${at(x, y, rot)}>${line('M-58 0 L58 0', 14 + OUT * 2, INK)}${line('M-58 0 L58 0', 14, '#d4d1e0')}
<rect x="-80" y="-34" width="30" height="68" rx="10" fill="#7a7594" stroke="${INK}" stroke-width="${OUT}"/>
<rect x="50" y="-34" width="30" height="68" rx="10" fill="#7a7594" stroke="${INK}" stroke-width="${OUT}"/>
${line('M-70 -20 L-70 -6 M60 -20 L60 -6', 5, '#a9a4c2')}</g>`,

    /** Paws pressed to both cheeks. */
    cheeks: () => limb('M98 452 Q92 392 124 340', 56) + limb('M414 452 Q420 392 388 340', 56)
        + paw(130, 328, {r: 40, rot: 28}) + paw(382, 328, {r: 40, rot: -28}),

    headband: () => `<path d="M76 206 Q256 150 436 206 L432 236 Q256 182 80 236Z" fill="${ANGER}" stroke="${INK}" stroke-width="${OUT}" stroke-linejoin="round"/>
<path d="M434 214 Q468 214 486 196 M432 226 Q462 238 482 238" fill="none" stroke="${INK}" stroke-width="${16 + OUT * 2}" stroke-linecap="round"/>
<path d="M434 214 Q468 214 486 196 M432 226 Q462 238 482 238" fill="none" stroke="${ANGER}" stroke-width="16" stroke-linecap="round"/>`,

    thoughtBubble: () => `<circle cx="372" cy="146" r="10" fill="${WHITE}" stroke="${INK}" stroke-width="7"/><circle cx="398" cy="114" r="15" fill="${WHITE}" stroke="${INK}" stroke-width="8"/>
<path d="M392 78 Q384 40 420 36 Q438 10 466 30 Q498 30 494 60 Q510 86 482 98 Q470 118 440 106 Q408 116 398 92 Q380 92 392 78Z" fill="${WHITE}" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
<circle cx="420" cy="70" r="7" fill="${INK}"/><circle cx="444" cy="70" r="7" fill="${INK}"/><circle cx="468" cy="70" r="7" fill="${INK}"/>`,

    rainCloud: () => `<path d="M330 92 Q326 58 362 56 Q376 24 414 34 Q446 26 456 58 Q490 64 482 96 Q480 116 452 116 L352 116 Q328 114 330 92Z" fill="#c8cadf" stroke="${INK}" stroke-width="9" stroke-linejoin="round"/>
${drop(370, 146, 0.55)}${drop(410, 160, 0.6)}${drop(450, 142, 0.5)}`,

    flames: () => {
        const flame = (x, y, s, rot) => `<g ${at(x, y, rot, s)}><path d="M0 0 Q-62 -6 -58 -70 Q-54 -112 -18 -150 Q-24 -100 2 -86 Q4 -136 40 -174 Q38 -120 62 -88 Q78 -60 58 -24 Q40 4 0 0Z" fill="url(#flame)" stroke="${INK}" stroke-width="${f(OUT / s)}" stroke-linejoin="round"/>
<path d="M2 -12 Q-30 -16 -26 -52 Q-22 -78 -2 -96 Q0 -66 16 -58 Q22 -86 34 -100 Q48 -60 34 -30 Q24 -10 2 -12Z" fill="#ffe066"/></g>`;
        return flame(96, 300, 1.0, -22) + flame(416, 300, 1.0, 22) + flame(170, 160, 0.85, -10) + flame(342, 160, 0.85, 10) + flame(256, 128, 0.9, 0);
    },


    shockLines: () => line('M206 150 L206 196 M232 144 L232 204 M258 142 L258 206 M284 144 L284 204 M310 150 L310 196', 7, '#7c84d9', 'opacity="0.8"'),

    tearsStream: () => {
        const stream = d => line(d, 30, INK) + line(d, 18, TEAR);
        return stream('M174 266 Q164 330 172 380 Q178 420 166 470') + stream('M338 266 Q348 330 340 380 Q334 420 346 470')
            + drop(130, 448, 0.55, {rot: -20}) + drop(384, 448, 0.55, {rot: 20});
    },

    joyTears: () => drop(118, 222, 0.75, {rot: -60}) + drop(394, 222, 0.75, {rot: 60}) + drop(96, 268, 0.5, {rot: -80}) + drop(416, 268, 0.5, {rot: 80}),

    waveLines: () => line('M462 186 Q480 214 474 246 M486 170 Q506 214 494 258', 9, INK),

    snot: () => `<circle cx="296" cy="296" r="22" fill="#cfefff" fill-opacity="0.85" stroke="#7fc6ef" stroke-width="5"/><circle cx="289" cy="288" r="5" fill="${WHITE}"/>`,

    dots: () => `<circle cx="404" cy="92" r="10" fill="${INK}"/><circle cx="433" cy="92" r="10" fill="${INK}"/><circle cx="462" cy="92" r="10" fill="${INK}"/>`,

    /** Ground line the peeking cat hides behind. */
    ledge: () => `<rect x="34" y="404" width="444" height="34" rx="17" fill="#d8d2e8" stroke="${INK}" stroke-width="${OUT}"/>`,
};

/* ------------------------------------------------------------------ assembly */

/**
 * The silhouette is drawn as one union — every piece stroked first, then every piece filled —
 * so internal seams disappear and only the outer contour keeps the outline.
 */
function cat(spec) {
    const sil = [BODY, ...EARS[spec.ears || 'up'], HEAD, ...FUR];
    const paths = sil.map(d => `<path d="${d}"/>`).join('');
    // Soft shadow where the head overlaps the body, then the head is refilled so only the body keeps it.
    const chin = `<g clip-path="url(#sil)"><path d="${HEAD}" fill="none" stroke="#e6dff0" stroke-width="26" filter="url(#rim)" transform="translate(0 12)"/>
<path d="${HEAD}" fill="${WHITE}"/></g>`;
    // Inner shadow along the lower-right of the outer contour, as if lit from the upper left.
    const shade = `<g filter="url(#inner)" fill="${WHITE}">${paths}</g>
<g clip-path="url(#sil)"><ellipse cx="256" cy="530" rx="240" ry="80" fill="${SHADE}" filter="url(#soft)" opacity="0.7"/></g>`;
    const face = [
        spec.blush === false ? '' : blush(spec.blush || {}),
        spec.brows ? brows[spec.brows]() : '',
        eyes[spec.eyes || 'happy'](spec.eyeOpts),
        mouths[spec.mouth || 'open'](),
    ].join('');
    const body = `<g ${spec.transform ? `transform="${spec.transform}"` : ''}>
<clipPath id="sil">${paths}</clipPath>
${spec.back || ''}
${spec.behind || ''}
<g fill="${INK}" stroke="${INK}" stroke-width="${OUT * 2}" stroke-linejoin="round">${paths}</g>
<g fill="${WHITE}">${paths}</g>
${chin}
${shade}
${INNER_EARS[spec.ears || 'up']}
${spec.tint ? `<g fill="${spec.tint}" opacity="0.22">${paths}</g>` : ''}
${face}
${spec.front || ''}
${spec.over || ''}
</g>`;
    const clipped = spec.clip ? `<clipPath id="cut"><path d="${spec.clip}"/></clipPath><g clip-path="url(#cut)">${body}</g>` : body;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
${defs}
<g filter="url(#sticker)">
${clipped}
${spec.top || ''}
</g>
</svg>`;
}

module.exports = {
    cat, props, paw, restPaws, raisedArm, sparkle, burst, ticks, heart, drop, angerMark, zee, question, exclaim, confetti, line,
};
