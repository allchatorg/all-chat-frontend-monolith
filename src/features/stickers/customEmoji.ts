import {getSticker} from './catalog';

/** Reserved inline identities are parsed separately from URLs and formatting. */
export const CUSTOM_EMOJI_TOKEN_PATTERN = /:allchat:([a-zA-Z0-9_-]+):/g;

export function isCustomEmojiId(id: unknown): id is string {
    return typeof id === 'string' && /^[a-zA-Z0-9_-]+$/.test(id);
}

export function toCustomEmojiToken(id: unknown): string {
    return isCustomEmojiId(id) ? `:allchat:${id}:` : '';
}

/** Short names are for typing; stored messages retain their canonical identities. */
export function getCustomEmojiShortcode(id: string): string {
    return getSticker(id) ? `:${id}:` : '';
}

export function findCustomEmojiShortcodes(text: string): {from: number; to: number; id: string}[] {
    const matches = Array.from(text.matchAll(CUSTOM_EMOJI_TOKEN_PATTERN), match => ({
        from: match.index,
        to: match.index + match[0].length,
        id: match[1],
    }));
    for (const match of text.matchAll(/:([a-zA-Z0-9_-]+):/g)) {
        const from = match.index;
        const to = from + match[0].length;
        if (!getSticker(match[1]) || matches.some(token => from < token.to && to > token.from)) continue;
        matches.push({from, to, id: match[1]});
    }
    return matches.sort((a, b) => a.from - b.from);
}

export function getCustomEmojiLabel(id?: string | null): string {
    const emoji = getSticker(id);
    return emoji ? `:${emoji.name}:` : ':Unavailable emoji:';
}
