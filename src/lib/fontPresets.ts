import type {CSSProperties} from 'react';

export const FONT_PRESETS = [
    {id: 'DEFAULT', label: 'Default'},
    {id: 'INTER', label: 'Inter'},
    {id: 'OPEN_SANS', label: 'Open Sans'},
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
    return value === 'DEFAULT' || value === 'INTER' || value === 'OPEN_SANS';
}

export function isFontSnapshot(value: Partial<FontSnapshot> | undefined | null): value is FontSnapshot {
    return !!value && isFontPreset(value.usernameFont) && isFontPreset(value.messageFont)
        && Number.isSafeInteger(value.fontRevision) && value.fontRevision! >= 0;
}

/** Only allow shipped families; never interpolate CSS received from the API. */
export function fontPresetStyle(preset: unknown): CSSProperties {
    if (preset === 'INTER') return {fontFamily: 'var(--font-pro-inter), ui-sans-serif, system-ui, sans-serif'};
    if (preset === 'OPEN_SANS') return {fontFamily: 'var(--font-pro-open-sans), ui-sans-serif, system-ui, sans-serif'};
    return {};
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
