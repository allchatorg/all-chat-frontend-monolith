import {getSticker} from './catalog';

/** Reserved inline identities are parsed separately from URLs and formatting. */
export const CUSTOM_EMOJI_TOKEN_PATTERN = /:allchat:([a-zA-Z0-9_-]+):/g;

export function isCustomEmojiId(id: unknown): id is string {
    return typeof id === 'string' && /^[a-zA-Z0-9_-]+$/.test(id);
}

export function toCustomEmojiToken(id: unknown): string {
    return isCustomEmojiId(id) ? `:allchat:${id}:` : '';
}

export function getCustomEmojiLabel(id?: string | null): string {
    const emoji = getSticker(id);
    return emoji ? `:${emoji.name}:` : ':Unavailable emoji:';
}
