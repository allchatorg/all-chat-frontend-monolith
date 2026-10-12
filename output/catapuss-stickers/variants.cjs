'use strict';

const {
    cat, props: P, paw, restPaws, raisedArm, sparkle, burst, ticks, heart, drop, angerMark, zee, question, exclaim, confetti,
} = require('./cat-art.cjs');

/** Scale the cat about its centre (and optionally nudge it) to make room for props. */
const fit = (s, dx = 0, dy = 0) => `translate(${256 + dx} ${266 + dy}) scale(${s}) translate(-256 -266)`;

const floatingHearts = (list = [[66, 112, 30, -16], [446, 140, 24, 14], [462, 330, 18, 10], [44, 300, 16, -10]]) =>
    list.map(([x, y, r, rot]) => heart(x, y, r, {rot, w: 7})).join('');

/** IDs are stored in messages and allowlisted by the backend (VipCharacterCatalog). */
const VARIANTS = [
    {
        id: 'catapuss-cheer', name: 'Cheering Catapuss', tags: ['yay', 'hooray', 'celebrate', 'happy', 'excited'],
        spec: {
            transform: fit(0.84, 0, 20),
            front: raisedArm('left') + raisedArm('right'),
            top: burst(98, 138, [-78, -50, -22], {r1: 18, r2: 64}) + burst(414, 138, [78, 50, 22], {r1: 18, r2: 64}),
        },
    },
    {
        id: 'catapuss-typing', name: 'Typing Catapuss', tags: ['laptop', 'typing', 'working', 'busy', 'computer'],
        spec: {
            transform: fit(0.88, 34, 6),
            front: P.laptop(),
            top: sparkle(52, 110, 26, {rot: -8}) + sparkle(36, 182, 13) + sparkle(470, 150, 26, {rot: 8}) + sparkle(484, 226, 13)
                + ticks(178, 296, [-40, -10], {len: 18, gap: 24}) + ticks(420, 360, [80, 50], {len: 20, gap: 28}),
        },
    },
    {
        id: 'catapuss-love', name: 'Heart Hug Catapuss', tags: ['love', 'heart', 'hug', 'cute', 'thanks'],
        spec: {transform: fit(0.9, 0, 6), front: P.heartHug(), top: floatingHearts()},
    },
    {
        id: 'catapuss-heart-eyes', name: 'Heart Eyes Catapuss', tags: ['love', 'crush', 'adore', 'heart eyes'],
        spec: {transform: fit(0.92, 0, 8), eyes: 'heart', mouth: 'open', front: restPaws(), top: floatingHearts([[60, 110, 28, -16], [452, 116, 24, 14], [470, 300, 16, 10]])},
    },
    {
        id: 'catapuss-laugh', name: 'Laughing Catapuss', tags: ['lol', 'lmao', 'funny', 'joy', 'haha'],
        spec: {
            transform: fit(0.92, 0, 8), eyes: 'squint', mouth: 'big', front: restPaws(), over: P.joyTears(),
            top: ticks(70, 150, [-60, -30, 0], {len: 26, gap: 10}) + ticks(442, 150, [60, 30, 0], {len: 26, gap: 10}),
        },
    },
    {
        id: 'catapuss-cry', name: 'Crying Catapuss', tags: ['sob', 'tears', 'sad', 'feels'],
        spec: {transform: fit(0.94, 0, 6), ears: 'down', brows: 'sad', eyes: 'cry', mouth: 'wail', front: restPaws(), over: P.tearsStream()},
    },
    {
        id: 'catapuss-sad', name: 'Sad Catapuss', tags: ['sad', 'down', 'gloomy', 'feels', 'rain'],
        spec: {transform: fit(0.88, -22, 30), ears: 'down', brows: 'sad', eyes: 'sad', mouth: 'frown', blush: {scale: 0.85}, front: restPaws(), top: P.rainCloud()},
    },
    {
        id: 'catapuss-angry', name: 'Angry Catapuss', tags: ['mad', 'grumpy', 'annoyed', 'hmph'],
        spec: {transform: fit(0.94, 0, 6), ears: 'down', brows: 'angry', eyes: 'angry', mouth: 'frown', blush: {strong: true}, front: restPaws(), top: angerMark(404, 104, 1.3)},
    },
    {
        id: 'catapuss-rage', name: 'Rage Catapuss', tags: ['furious', 'screaming', 'rage', 'fire'],
        spec: {
            transform: fit(0.82, 0, 34), back: P.flames(), ears: 'down', brows: 'angry', eyes: 'angry', mouth: 'scream', blush: {strong: true},
            tint: '#ff5a4d', front: restPaws(), top: angerMark(364, 232, 0.95),
        },
    },
    {
        id: 'catapuss-shock', name: 'Shocked Catapuss', tags: ['surprised', 'omg', 'wow', 'gasp'],
        spec: {
            transform: fit(0.9, -10, 14), eyes: 'wide', mouth: 'o', blush: {scale: 0.8}, front: restPaws(), over: P.shockLines() + drop(404, 196, 0.9, {rot: 12}),
            top: exclaim(450, 92, 1, 14) + exclaim(486, 132, 0.7, 24),
        },
    },
    {
        id: 'catapuss-think', name: 'Thinking Catapuss', tags: ['hmm', 'thinking', 'wonder', 'pondering'],
        spec: {transform: fit(0.86, -30, 26), brows: 'raised', eyes: 'up', mouth: 'w', front: P.chin(), top: P.thoughtBubble()},
    },
    {
        id: 'catapuss-smart', name: 'Big Brain Catapuss', tags: ['smart', 'genius', 'idea', 'nerd', 'glasses'],
        spec: {transform: fit(0.86, -22, 30), eyes: 'open', mouth: 'w', front: restPaws(), over: P.glasses(), top: P.bulb()},
    },
    {
        id: 'catapuss-smug', name: 'Smug Catapuss', tags: ['smirk', 'knowing', 'sly'],
        spec: {transform: fit(0.92, 0, 8), eyes: 'smug', mouth: 'smirk', front: restPaws(), top: sparkle(452, 112, 24, {rot: 10}) + sparkle(478, 168, 13)},
    },
    {
        id: 'catapuss-cool', name: 'Cool Catapuss', tags: ['sunglasses', 'chill', 'swag', 'confident'],
        spec: {transform: fit(0.92, 0, 8), eyes: 'open', mouth: 'smirk', front: restPaws(), over: P.sunglasses(), top: sparkle(64, 120, 24, {rot: -10}) + sparkle(452, 108, 20, {rot: 10})},
    },
    {
        id: 'catapuss-strong', name: 'Strong Catapuss', tags: ['muscles', 'gym', 'strong', 'workout', 'lift'],
        spec: {
            transform: fit(0.8, 0, 26), front: P.headband() + raisedArm('left', {to: [42, 218]}) + raisedArm('right', {to: [42, 218]}),
            brows: 'determined', eyes: 'open', mouth: 'grin', over: P.dumbbell(40, 196, 84) + P.dumbbell(472, 196, -84) + drop(396, 300, 0.6, {rot: 20}),
        },
    },
    {
        id: 'catapuss-shy', name: 'Shy Catapuss', tags: ['blush', 'awkward', 'embarrassed', 'nervous'],
        spec: {transform: fit(0.92, 0, 8), eyes: 'look', mouth: 'w', blush: {strong: true, scale: 1.15}, front: P.cheeks(), over: drop(400, 186, 0.8, {rot: 14}), top: heart(70, 128, 18, {rot: -14, w: 6})},
    },
    {
        id: 'catapuss-sleepy', name: 'Sleepy Catapuss', tags: ['tired', 'sleep', 'zzz', 'night', 'bored'],
        spec: {
            transform: fit(0.9, 14, 18), ears: 'down', eyes: 'sleep', mouth: 'w', blush: {scale: 0.85}, front: restPaws(), over: P.nightcap() + P.snot(),
            top: zee(44, 152, 1) + zee(76, 92, 0.75) + zee(108, 46, 0.55),
        },
    },
    {
        id: 'catapuss-party', name: 'Party Catapuss', tags: ['party', 'birthday', 'confetti', 'celebrate'],
        spec: {
            transform: fit(0.86, 0, 34), eyes: 'happy', mouth: 'open', front: restPaws(), over: P.partyHat(),
            top: confetti([[60, 96, -20, 0], [120, 50, 30, 1, true], [40, 210, 40, 2], [452, 70, 20, 3], [412, 30, -30, 4, true], [476, 196, -40, 1], [180, 30, 10, 2]]),
        },
    },
    {
        id: 'catapuss-confused', name: 'Confused Catapuss', tags: ['huh', 'what', 'question', 'dizzy'],
        spec: {transform: `${fit(0.88, -12, 22)} rotate(-8 256 300)`, eyes: 'swirl', mouth: 'wobbly', front: restPaws(), top: question(438, 92, 1.15, 14) + question(484, 170, 0.7, 24)},
    },
    {
        id: 'catapuss-blank', name: 'Blank Stare Catapuss', tags: ['neutral', 'meh', 'blank', 'unimpressed'],
        spec: {transform: fit(0.86, -14, 30), eyes: 'dot', mouth: 'flat', blush: {scale: 0.75}, front: restPaws(), top: P.dots()},
    },
    {
        id: 'catapuss-silly', name: 'Silly Catapuss', tags: ['wink', 'tongue', 'playful', 'goofy'],
        spec: {transform: fit(0.92, 0, 8), eyes: 'wink', mouth: 'tongue', front: restPaws(), top: sparkle(452, 112, 24, {rot: 10}) + sparkle(62, 128, 16)},
    },
    {
        id: 'catapuss-thumbs-up', name: 'Thumbs Up Catapuss', tags: ['yes', 'ok', 'agree', 'like', 'approve'],
        spec: {transform: fit(0.92, 0, 8), eyes: 'happy', mouth: 'grin', front: P.thumb(), top: sparkle(452, 300, 22, {rot: 10}) + sparkle(470, 236, 12)},
    },
    {
        id: 'catapuss-wave', name: 'Waving Catapuss', tags: ['hi', 'hello', 'bye', 'wave'],
        spec: {
            transform: fit(0.86, -18, 22), eyes: 'happy', mouth: 'open',
            front: paw(196, 468, {r: 40}) + raisedArm('right', {to: [54, 214], rot: -24}), top: P.waveLines(),
        },
    },
    {
        id: 'catapuss-please', name: 'Pleading Catapuss', tags: ['please', 'beg', 'puppy eyes', 'pretty please'],
        spec: {transform: fit(0.92, 0, 8), brows: 'worried', eyes: 'sparkle', mouth: 'small', front: P.pray(), top: sparkle(60, 130, 22, {rot: -10}) + sparkle(452, 120, 26, {rot: 10}) + sparkle(470, 190, 12)},
    },
    {
        id: 'catapuss-peek', name: 'Peeking Catapuss', tags: ['peek', 'lurk', 'watching', 'observer', 'quiet'],
        spec: {
            transform: 'translate(0 92)', clip: 'M0 0 H512 V420 H0Z', eyes: 'dot', mouth: 'w', blush: {scale: 0.85},
            top: P.ledge() + paw(190, 404, {r: 36}) + paw(322, 404, {r: 36}),
        },
    },
];

module.exports = {VARIANTS};
