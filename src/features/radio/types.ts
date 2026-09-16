export type RadioStationKey = 'daybreak' | 'nightwave';
export type RadioStationMode = 'theme' | RadioStationKey;

export interface RadioStationDefinition {
    key: RadioStationKey;
    name: string;
    description: string;
    shortcode: string;
}

export interface AzuraCastStation {
    id: number;
    name: string;
    shortcode: string;
    listen_url: string;
}

export interface RadioNowPlaying {
    station: AzuraCastStation;
    is_online: boolean;
    now_playing: {
        song: {title: string; artist: string; text: string};
    } | null;
}

export type RadioStatus = 'idle' | 'loading' | 'buffering' | 'playing' | 'paused'
    | 'offline' | 'unavailable' | 'error' | 'interrupted' | 'suspended';

export const RADIO_STATIONS: Record<RadioStationKey, RadioStationDefinition> = {
    daybreak: {
        key: 'daybreak',
        name: 'Daybreak',
        description: 'Upbeat indie, funk and chill pop.',
        shortcode: 'allchat_radio',
    },
    nightwave: {
        key: 'nightwave',
        name: 'Nightwave',
        description: 'Lo-fi, ambient and downtempo electronic.',
        shortcode: 'nightwave',
    },
};

export const DEFAULT_RADIO_VOLUME = 35;

export function normalizeRadioVolume(value: number): number {
    return Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : DEFAULT_RADIO_VOLUME;
}
