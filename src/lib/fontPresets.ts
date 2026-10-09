import type {CSSProperties} from 'react';

export const FONT_PRESETS = [
    {id: 'DEFAULT', label: 'Default'},
    {id: 'ROBOTO', label: 'Roboto'},
    {id: 'PETIT_FORMAL_SCRIPT', label: 'Petit Formal Script'},
    {id: 'ITALIANNO', label: 'Italianno'},
    {id: 'KABLAMMO', label: 'Kablammo'},
    {id: 'CRAFTY_GIRLS', label: 'Crafty Girls'},
    {id: 'EMILYS_CANDY', label: "Emily's Candy"},
    {id: 'EVELYNE', label: 'Evelyne'},
    {id: 'MESSY_HANDWRITTEN', label: 'Messy Handwritten'},
    {id: 'LOVE_LIGHT', label: 'Love Light'},
    {id: 'CLICKER_SCRIPT', label: 'Clicker Script'},
    {id: 'TANGERINE', label: 'Tangerine'},
    {id: 'SAHIR_YESTA', label: 'Sahir Yesta'},
    {id: 'GISTA_DANES', label: 'Gista Danes'},
    {id: 'A_YUMMY_APOLOGY', label: 'A Yummy Apology'},
    {id: 'PRINCESS_SOFIA', label: 'Princess Sofia'},
    {id: 'RAIN_KISS', label: 'Rain Kiss'},
] as const;

export type FontPreset = typeof FONT_PRESETS[number]['id'];

export interface FontSnapshot {
    usernameFont: FontPreset;
    messageFont: FontPreset;
    fontRevision: number;
}

export const DEFAULT_FONT_SNAPSHOT: Readonly<FontSnapshot> = Object.freeze({
    usernameFont: 'DEFAULT', messageFont: 'DEFAULT', fontRevision: 0,
});

export function isFontPreset(value: unknown): value is FontPreset {
    return FONT_PRESETS.some(preset => preset.id === value);
}

export function isFontSnapshot(value: Partial<FontSnapshot> | undefined | null): value is FontSnapshot {
    return !!value && isFontPreset(value.usernameFont) && isFontPreset(value.messageFont)
        && Number.isSafeInteger(value.fontRevision) && value.fontRevision! >= 0;
}

const FONT_FAMILIES: Record<Exclude<FontPreset, 'DEFAULT'>, string> = {
    ROBOTO: 'var(--font-vip-roboto)',
    PETIT_FORMAL_SCRIPT: 'var(--font-vip-petit-formal-script)',
    ITALIANNO: 'var(--font-vip-italianno)',
    KABLAMMO: 'var(--font-vip-kablammo)',
    CRAFTY_GIRLS: 'var(--font-vip-crafty-girls)',
    EMILYS_CANDY: 'var(--font-vip-emilys-candy)',
    EVELYNE: 'var(--font-vip-evelyne)',
    MESSY_HANDWRITTEN: 'var(--font-vip-messy-handwritten)',
    LOVE_LIGHT: 'var(--font-vip-love-light)',
    CLICKER_SCRIPT: 'var(--font-vip-clicker-script)',
    TANGERINE: 'var(--font-vip-tangerine)',
    SAHIR_YESTA: 'var(--font-vip-sahir-yesta)',
    GISTA_DANES: 'var(--font-vip-gista-danes)',
    A_YUMMY_APOLOGY: 'var(--font-vip-a-yummy-apology)',
    PRINCESS_SOFIA: 'var(--font-vip-princess-sofia)',
    RAIN_KISS: 'var(--font-vip-rain-kiss)',
};

/** Only allow shipped families; never interpolate CSS received from the API. */
export function fontPresetStyle(preset: unknown): CSSProperties {
    if (!isFontPreset(preset) || preset === 'DEFAULT') return {};
    return {
        fontFamily: `${FONT_FAMILIES[preset]}, ui-sans-serif, system-ui, sans-serif`,
        // Use the adjusted face's metrics so enlarged capitals and tails have room,
        // including inside truncated usernames and one-line message previews.
        lineHeight: 'normal',
    };
}

/** Expiry can resolve to default before the sweep increments the revision. */
export function resolveFontSnapshot(
    current: FontSnapshot | undefined,
    incoming: Partial<FontSnapshot> | undefined | null,
): FontSnapshot | undefined {
    if (!isFontSnapshot(incoming)) return current;
    if (current) {
        if (incoming.fontRevision < current.fontRevision) return current;
        if (incoming.fontRevision === current.fontRevision) {
            const expired = incoming.usernameFont === 'DEFAULT' && incoming.messageFont === 'DEFAULT';
            const unchanged = current.usernameFont === incoming.usernameFont && current.messageFont === incoming.messageFont;
            if (!expired || unchanged) return current;
        }
    }
    return {usernameFont: incoming.usernameFont, messageFont: incoming.messageFont, fontRevision: incoming.fontRevision};
}

/** Keep font ordering independent from the badge/billing revision on account responses. */
export function mergeOwnerFonts<T extends Partial<FontSnapshot>>(current: T, incoming: T): T {
    const resolved = resolveFontSnapshot(isFontSnapshot(current) ? current : undefined, incoming);
    return resolved ? {...incoming, usernameFont: resolved.usernameFont,
        messageFont: resolved.messageFont, fontRevision: resolved.fontRevision} : incoming;
}
