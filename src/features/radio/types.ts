// Persisted preference keys stay stable when station names or URL stubs change.
export type RadioStationKey = 'daybreak' | 'nightwave';
export type RadioStationMode = 'theme' | RadioStationKey;

export interface RadioStationDefinition {
    key: RadioStationKey;
    id: number;
    name: string;
    description: string;
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
        id: 1,
        name: 'Frutiger Aero',
        description: 'Frutiger Aero for light mode.',
    },
    nightwave: {
        key: 'nightwave',
        id: 2,
        name: 'Synthwave',
        description: 'Synthwave for dark mode.',
    },
};

export const DEFAULT_RADIO_VOLUME = 35;

export function normalizeRadioVolume(value: number): number {
    return Number.isFinite(value) ? Math.min(100, Math.max(0, Math.round(value))) : DEFAULT_RADIO_VOLUME;
}
