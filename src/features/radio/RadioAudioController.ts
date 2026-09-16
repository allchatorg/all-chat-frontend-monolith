import {normalizeRadioVolume, RadioStatus} from './types';

type PlaybackUpdate = (status: RadioStatus, error: string | null) => void;

/** One stream and one gain stage, independent of notification and attachment audio. */
export class RadioAudioController {
    private audio: HTMLAudioElement | null = null;
    private context: AudioContext | null = null;
    private source: MediaElementAudioSourceNode | null = null;
    private gain: GainNode | null = null;
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
            if (this.context?.state !== 'running') this.update('interrupted');
            else if (this.audio && !this.audio.paused && this.audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
                this.update('playing');
            } else this.fail('The radio connection timed out. Try again.');
        }, 20000);
    }

    private fail(message: string) {
        this.release();
        this.update('error', message);
    }

    private ensureGraph(volume: number, muted: boolean) {
        if (this.audio && this.context && this.gain) return;
        const AudioContextConstructor = window.AudioContext
            || (window as unknown as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext;
        if (!AudioContextConstructor) throw new Error('This browser cannot play radio with volume control.');

        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.preload = 'none';
        audio.volume = 1;
        audio.muted = false;
        const context = new AudioContextConstructor();
        this.audio = audio;
        this.context = context;
        this.source = context.createMediaElementSource(audio);
        this.gain = context.createGain();
        this.gain.gain.value = muted ? 0 : normalizeRadioVolume(volume) / 100;
        this.source.connect(this.gain);
        this.gain.connect(context.destination);

        audio.onplaying = () => {
            if (!this.wantsPlayback || audio.paused || audio.currentSrc !== this.currentUrl) return;
            this.clearTimeout();
            this.update(context.state === 'running' ? 'playing' : 'interrupted');
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
        context.onstatechange = () => {
            if (!this.wantsPlayback) return;
            if (context.state === 'running') {
                if (!audio.paused && audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
                    this.clearTimeout();
                    this.update('playing');
                }
            } else {
                this.clearTimeout();
                this.update('interrupted');
            }
        };
    }

    setVolume(volume: number, muted: boolean) {
        if (!this.gain || !this.context) return;
        const gain = this.gain.gain;
        const now = this.context.currentTime;
        const target = muted ? 0 : normalizeRadioVolume(volume) / 100;
        gain.cancelScheduledValues(now);
        if (!this.wantsPlayback || this.audio?.paused || this.context.state !== 'running') {
            // Apply the saved level before starting/resuming, including a muted
            // context that iOS suspended. Only smooth changes to audible audio.
            gain.setValueAtTime(target, now);
            return;
        }
        gain.setValueAtTime(gain.value, now);
        gain.linearRampToValueAtTime(target, now + 0.02);
    }

    // Both resume() and play() are invoked synchronously within the caller's
    // Play gesture. Awaiting metadata or resume() first loses activation on iOS.
    play(url: string, volume: number, muted: boolean) {
        if (this.disposed) return;
        try {
            this.ensureGraph(volume, muted);
        } catch {
            this.release();
            this.destroyGraph();
            this.update('error', 'This browser could not initialize radio audio. Try again.');
            return;
        }
        const audio = this.audio!;
        const context = this.context!;
        if (this.currentUrl === url && this.wantsPlayback && !audio.paused
            && context.state === 'running' && audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
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
            const resume = context.resume();
            const play = audio.play();
            void Promise.all([resume, play]).then(() => {
                if (attempt !== this.attempt || !this.wantsPlayback) return;
                if (context.state !== 'running' || audio.paused) {
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

    private destroyGraph() {
        if (this.audio) {
            this.audio.onplaying = this.audio.onwaiting = this.audio.onstalled = null;
            this.audio.onpause = this.audio.onerror = this.audio.onended = null;
        }
        this.source?.disconnect();
        this.gain?.disconnect();
        if (this.context) {
            this.context.onstatechange = null;
            void this.context.close().catch(() => undefined);
        }
        this.audio = null;
        this.source = null;
        this.context = null;
        this.gain = null;
    }

    dispose() {
        this.disposed = true;
        this.release();
        this.destroyGraph();
    }
}
