export interface ProReaction {
    id: string;
    name: string;
    src: string;
    tags: readonly string[];
}

/** Shared paid artwork for stickers, inline emoji and reactions; IDs remain stable in saved messages. */
export const PRO_REACTIONS: readonly ProReaction[] = [
    {id: 'wojak', name: 'Wojak', tags: ['feels', 'sad', 'feeling']},
    {id: 'big-brain-wojak', name: 'Big Brain Wojak', tags: ['smart', 'thinking', 'genius', 'brain']},
    {id: 'dumb-wojak', name: 'Dumb Wojak', tags: ['goofy', 'silly', 'drool']},
    {id: 'smug-wojak', name: 'Smug Wojak', tags: ['smirk', 'confident', 'knowing']},
    {id: 'soyjak', name: 'Soyjak 1', tags: ['soyjak-1', 'soyjak_1', 'surprised', 'excited', 'glasses']},
    {id: 'soyjak-2', name: 'Soyjak 2', tags: ['soyjak_2', 'surprised', 'excited', 'glasses']},
    {id: 'chud', name: 'Chudjak', tags: ['chudjak', 'angry', 'grumpy']},
    {id: 'chad-1', name: 'Chad (Jock)', tags: ['chad_1', 'jock', 'strong', 'confident']},
    {id: 'chad-2', name: 'Chad (Blonde beard)', tags: ['chad_2', 'blond', 'beard', 'yes']},
    {id: 'gigachad', name: 'Gigachad', tags: ['giga chad', 'strong', 'confident', 'muscles']},
    {id: 'virgin', name: 'Virgin', tags: ['shy', 'awkward']},
    {id: 'doomer', name: 'Doomer', tags: ['tired', 'night', 'beanie']},
    {id: 'coomer', name: 'Coomer', tags: ['messy', 'frazzled']},
    {id: 'bloomer', name: 'Bloomer', tags: ['happy', 'positive', 'sunshine']},
    {id: 'zoomer', name: 'Zoomer', tags: ['young', 'glasses', 'hair']},
    {id: 'npc', name: 'NPC', tags: ['neutral', 'grey', 'blank']},
    {id: 'grug', name: 'Grug', tags: ['caveman', 'confused', 'hmm']},
    {id: 'pepe', name: 'Pepe', tags: ['frog', 'feels', 'green']},
    {id: 'rage-pepe', name: 'Rage Pepe', tags: ['frog', 'angry', 'screaming', 'rage']},
    {id: 'smug-pepe', name: 'Smug Pepe', tags: ['frog', 'smirk', 'knowing', 'green']},
    {id: 'apu-apustaja', name: 'Apu Apustaja', tags: ['apu', 'helper', 'frog', 'cute']},
    {id: 'honkler', name: 'Honkler', tags: ['clown', 'frog', 'honk']},
    {id: 'spurdo', name: 'Spurdo', tags: ['bear', 'funny']},
    {id: 'gondola', name: 'Gondola', tags: ['quiet', 'calm', 'observer']},
].map(reaction => ({...reaction, src: `/stickers/pro/${reaction.id}.png`}));

const reactionPrefix = 'allchat:';
const reactionsByToken = new Map(PRO_REACTIONS.map(reaction => [toCustomReactionToken(reaction.id), reaction]));
const stickersById = new Map(PRO_REACTIONS.map(sticker => [sticker.id, sticker]));

/** Sticker messages use a short catalog ID, never a URL or a reaction token. */
export function getSticker(id?: string | null): ProReaction | undefined {
    return id ? stickersById.get(id) : undefined;
}

export function getStickerLabel(id?: string | null): string {
    const sticker = getSticker(id);
    return sticker ? `${sticker.name} sticker` : 'Unavailable sticker';
}

export function toCustomReactionToken(id: string): string {
    return `${reactionPrefix}${id}`;
}

/** Recognize even unavailable reserved tokens so they never render as URLs or raw IDs. */
export function isCustomReactionToken(emoji?: string | null): boolean {
    return Boolean(emoji?.startsWith(reactionPrefix));
}

/** Only an exact allowlisted identity may resolve an image. */
export function getCustomReaction(emoji?: string | null): ProReaction | undefined {
    return emoji ? reactionsByToken.get(emoji) : undefined;
}

export function getReactionLabel(emoji: string, emojiId?: string): string {
    const reaction = getCustomReaction(emoji);
    if (reaction) return reaction.name;
    if (isCustomReactionToken(emoji) || isCustomReactionToken(emojiId)) return 'Unavailable reaction';
    return emojiId?.replaceAll('_', ' ') || emoji;
}
