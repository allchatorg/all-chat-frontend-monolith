import {AzuraCastStation, RadioNowPlaying} from './types';

const BASE_URL = 'https://radio.allchat.org';

// Public radio requests must never use AllChat's authenticated Axios client.
async function request(path: string, signal: AbortSignal): Promise<unknown> {
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal.addEventListener('abort', abort, {once: true});
    if (signal.aborted) controller.abort();
    const timeout = window.setTimeout(abort, 10000);
    try {
        const response = await fetch(`${BASE_URL}${path}`, {
            credentials: 'omit',
            signal: controller.signal,
            headers: {Accept: 'application/json'},
        });
        if (!response.ok) throw new Error('Radio information is temporarily unavailable.');
        return await response.json();
    } finally {
        window.clearTimeout(timeout);
        signal.removeEventListener('abort', abort);
    }
}

function isStation(value: unknown): value is AzuraCastStation {
    if (!value || typeof value !== 'object') return false;
    const station = value as Partial<AzuraCastStation>;
    return typeof station.id === 'number' && Number.isInteger(station.id)
        && typeof station.name === 'string' && typeof station.shortcode === 'string'
        && typeof station.listen_url === 'string' && station.listen_url.startsWith('https://');
}

export async function getRadioStations(signal: AbortSignal): Promise<AzuraCastStation[]> {
    const response = await request('/api/stations', signal);
    if (!Array.isArray(response)) throw new Error('Radio information is temporarily unavailable.');
    return response.filter(isStation);
}

export async function getRadioNowPlaying(stationId: number, signal: AbortSignal): Promise<RadioNowPlaying> {
    const response = await request(`/api/nowplaying/${stationId}`, signal);
    if (!response || typeof response !== 'object') throw new Error('Radio information is temporarily unavailable.');
    const value = response as Partial<RadioNowPlaying>;
    if (!isStation(value.station) || value.station.id !== stationId || typeof value.is_online !== 'boolean') {
        throw new Error('Radio information is temporarily unavailable.');
    }
    const song = value.now_playing?.song;
    return {
        station: value.station,
        is_online: value.is_online,
        now_playing: song ? {song: {
            title: typeof song.title === 'string' ? song.title : '',
            artist: typeof song.artist === 'string' ? song.artist : '',
            text: typeof song.text === 'string' ? song.text : '',
        }} : null,
    };
}
