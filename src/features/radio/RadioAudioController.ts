import {normalizeRadioVolume, RadioStatus} from './types';

type PlaybackUpdate = (status: RadioStatus, error: string | null) => void;

export async function supportsRadioVolume(): Promise<boolean> {
    const audio = new Audio();
    try {
        // WebKit exposes this even before loading media. Newer iPads support
        // element volume, so detecting iOS from the user agent is insufficient.
        return !audio.matches(':volume-locked');
    } catch {
        // Older browsers do not recognize this selector. A locked element can
        // briefly echo a volume write before reverting it in a queued task.
        audio.volume = 0.5;
        await new Promise<void>(resolve => window.setTimeout(resolve, 0));
        return audio.volume === 0.5;
    }
}

/** One native stream, independent of notification and attachment audio. */
export class RadioAudioController {
    private audio: HTMLAudioElement | null = null;
    private wantsPlayback = false;
    private attempt = 0;
    private timeout: number | undefined;
    private disposed = false;
    private currentUrl: string | null = null;

    constructor(private readonly onUpdate: PlaybackUpdate) {}

    get sourceUrl(): string | null {
        return this.currentUrl;
    }

    private update(status: RadioStatus, error: string | null = null) {
        if (!this.disposed) this.onUpdate(status, error);
    }

    private clearTimeout() {
        window.clearTimeout(this.timeout);
        this.timeout = undefined;
    }

    private watchBuffering() {
        if (this.timeout !== undefined) return;
        this.timeout = window.setTimeout(() => {
            this.timeout = undefined;
            if (!this.wantsPlayback) return;
            if (this.audio?.paused) this.update('interrupted');
            else if (this.audio && !this.audio.paused && this.audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
                this.update('playing');
            } else this.fail('The radio connection timed out. Try again.');
        }, 20000);
    }

    private fail(message: string) {
        this.release();
        this.update('error', message);
    }

    private ensureAudio() {
        if (this.audio) return;
        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.preload = 'none';
        this.audio = audio;

        audio.onplaying = () => {
            if (!this.wantsPlayback || audio.paused || audio.currentSrc !== this.currentUrl) return;
            this.clearTimeout();
            this.update('playing');
        };
        audio.onwaiting = () => {
            if (!this.wantsPlayback) return;
            this.update('buffering');
            this.watchBuffering();
        };
        audio.onstalled = () => {
            if (this.wantsPlayback && audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) {
                this.update('buffering');
                this.watchBuffering();
            }
        };
        audio.onpause = () => {
            if (this.wantsPlayback && audio.paused && audio.currentSrc === this.currentUrl) {
                this.clearTimeout();
                this.update('interrupted');
            }
        };
        audio.onerror = () => {
            if (this.wantsPlayback && audio.error) this.fail('The radio stream could not connect. Try again.');
        };
        audio.onended = () => {
            if (this.wantsPlayback) this.fail('The radio stream ended. Try again.');
        };
    }

    setVolume(volume: number, muted: boolean) {
        if (!this.audio) return;
        const level = normalizeRadioVolume(volume) / 100;
        // Safari can play live MP3 outside a MediaElementAudioSourceNode, so a
        // GainNode cannot reliably attenuate or mute it (WebKit bug 180696).
        // Native mute also handles zero volume on devices with locked volume.
        this.audio.volume = level;
        this.audio.muted = muted || level === 0;
    }

    // Invoke play() synchronously within the caller's gesture. Awaiting
    // metadata first loses activation on iOS.
    play(url: string, volume: number, muted: boolean) {
        if (this.disposed) return;
        try {
            this.ensureAudio();
        } catch {
            this.release();
            this.update('error', 'This browser could not initialize radio audio. Try again.');
            return;
        }
        const audio = this.audio!;
        if (this.currentUrl === url && this.wantsPlayback && !audio.paused
            && audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
            this.setVolume(volume, muted);
            this.update('playing');
            return;
        }
        if (this.currentUrl !== url) {
            this.release();
            this.currentUrl = url;
            audio.src = url;
        }
        this.setVolume(volume, muted);
        const attempt = ++this.attempt;
        this.wantsPlayback = true;
        this.update('buffering');
        this.watchBuffering();

        try {
            const play = audio.play();
            void play.then(() => {
                if (attempt !== this.attempt || !this.wantsPlayback) return;
                if (audio.paused) {
                    this.clearTimeout();
                    this.update('interrupted');
                } else if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
                    this.clearTimeout();
                    this.update('playing');
                }
            }).catch((error: unknown) => {
                if (attempt !== this.attempt || !this.wantsPlayback) return;
                this.clearTimeout();
                if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'AbortError')) {
                    this.update('interrupted');
                } else {
                    this.fail('The radio stream could not connect. Try again.');
                }
            });
        } catch {
            this.fail('The radio stream could not connect. Try again.');
        }
    }

    release() {
        this.wantsPlayback = false;
        this.attempt++;
        this.clearTimeout();
        this.currentUrl = null;
        if (this.audio) {
            this.audio.pause();
            this.audio.removeAttribute('src');
            this.audio.load();
        }
    }

    dispose() {
        this.disposed = true;
        this.release();
        if (this.audio) {
            this.audio.onplaying = this.audio.onwaiting = this.audio.onstalled = null;
            this.audio.onpause = this.audio.onerror = this.audio.onended = null;
        }
        this.audio = null;
    }
}
