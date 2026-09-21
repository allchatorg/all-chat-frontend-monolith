export interface ProSticker {
    id: string;
    name: string;
    src: string;
    tags: readonly string[];
}

/** IDs are persisted on messages. Keep them in sync with the server allowlist. */
export const PRO_STICKERS: readonly ProSticker[] = [
    {id: 'wojak', name: 'Wojak', tags: ['feels', 'sad', 'feeling']},
    {id: 'soyjak', name: 'Soyjak', tags: ['surprised', 'excited', 'glasses']},
    {id: 'chud', name: 'Chud', tags: ['angry', 'grumpy']},
    {id: 'chad-1', name: 'Chad (Jock)', tags: ['chad_1', 'jock', 'strong', 'confident']},
    {id: 'chad-2', name: 'Chad (Blonde beard)', tags: ['chad_2', 'blond', 'beard', 'yes']},
    {id: 'virgin', name: 'Virgin', tags: ['shy', 'awkward']},
    {id: 'doomer', name: 'Doomer', tags: ['tired', 'night', 'beanie']},
    {id: 'coomer', name: 'Coomer', tags: ['messy', 'frazzled']},
    {id: 'bloomer', name: 'Bloomer', tags: ['happy', 'positive', 'sunshine']},
    {id: 'zoomer', name: 'Zoomer', tags: ['young', 'headphones']},
    {id: 'npc', name: 'NPC', tags: ['neutral', 'grey', 'blank']},
    {id: 'grug', name: 'Grug', tags: ['caveman', 'confused', 'hmm']},
    {id: 'pepe', name: 'Pepe', tags: ['frog', 'feels', 'green']},
    {id: 'apu-apustaja', name: 'Apu Apustaja', tags: ['apu', 'helper', 'frog', 'cute']},
    {id: 'honkler', name: 'Honkler', tags: ['clown', 'frog', 'honk']},
    {id: 'spurdo', name: 'Spurdo', tags: ['bear', 'funny']},
    {id: 'gondola', name: 'Gondola', tags: ['quiet', 'calm', 'observer']},
].map(sticker => ({...sticker, src: `/stickers/pro/${sticker.id}.png`}));

const stickersById = new Map(PRO_STICKERS.map(sticker => [sticker.id, sticker]));

export function getStickerById(id?: string | null): ProSticker | undefined {
    return id ? stickersById.get(id) : undefined;
}

export function getStickerLabel(id?: string | null): string | undefined {
    return getStickerById(id)?.name;
}
