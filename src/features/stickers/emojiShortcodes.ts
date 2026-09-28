import data from '@emoji-mart/data';
import {getCustomEmojiShortcode} from './customEmoji';
import type {EmojiSelection} from './emojiTypes';

interface UnicodeEmoji {
    id: string;
    skins: {native: string}[];
}

const emojiData = data as {
    emojis: Record<string, UnicodeEmoji>;
    aliases: Record<string, string>;
};
const emojisByName = new Map(Object.entries(emojiData.emojis));
for (const [alias, id] of Object.entries(emojiData.aliases)) {
    const emoji = emojisByName.get(id);
    if (emoji) emojisByName.set(alias, emoji);
}

const tonedEmojisByNative = new Map(Object.values(emojiData.emojis)
    .filter(emoji => emoji.skins.length > 1)
    .flatMap(emoji => emoji.skins.map(skin => [skin.native, emoji] as const)));
const nativeLengths = [...new Set([...tonedEmojisByNative.keys()].map(native => native.length))]
    .sort((a, b) => b - a);
const SHORTCODE_PATTERN = /:([a-zA-Z0-9_+-]+):(?::skin-tone-([2-6]):)?/g;

/** Use the exact selected native variant, including a skin-tone suffix when needed. */
export function getEmojiShortcode(selection: EmojiSelection): string {
    if (selection.kind === 'custom') return getCustomEmojiShortcode(selection.id);
    const emoji = emojisByName.get(selection.id);
    const skin = emoji?.skins.findIndex(variant => variant.native === selection.native) ?? -1;
    return `:${emoji?.id ?? selection.id}:${skin > 0 ? `:skin-tone-${skin + 1}:` : ''}`;
}

export interface UnicodeShortcodeMatch {
    from: number;
    to: number;
    native: string;
}

/** Match one text run; the editor separately excludes its enclosing URL spans. */
export function findUnicodeEmojiShortcodes(text: string): UnicodeShortcodeMatch[] {
    const matches: UnicodeShortcodeMatch[] = [];
    for (const match of text.matchAll(SHORTCODE_PATTERN)) {
        const name = match[1];
        const emoji = emojisByName.get(name);
        if (emoji) {
            const variant = match[2] ? emoji.skins[Number(match[2]) - 1] : emoji.skins[0];
            matches.push({
                from: match.index,
                to: match.index + (variant ? match[0].length : name.length + 2),
                native: (variant ?? emoji.skins[0]).native,
            });
            continue;
        }

        // The base code is converted as soon as its closing colon is typed.
        // A following tone suffix must therefore also work after a native emoji.
        const tone = /^skin-tone-([2-6])$/.exec(name);
        if (!tone) continue;
        for (const length of nativeLengths) {
            const from = match.index - length;
            if (from < 0 || text[from - 1] === '\u200D') continue;
            const previous = tonedEmojisByNative.get(text.slice(from, match.index));
            const skin = previous?.skins[Number(tone[1]) - 1];
            if (!skin) continue;
            matches.push({from, to: match.index + match[0].length, native: skin.native});
            break;
        }
    }
    return matches;
}
