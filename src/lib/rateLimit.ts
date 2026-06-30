export type RateLimitEvent = {
    message: string;
    retryAfterSeconds?: number | null;
};

type Listener = (e: RateLimitEvent) => void;

class RateLimitBus {
    private listeners = new Set<Listener>();
    private open = false;

    subscribe(fn: Listener) {
        this.listeners.add(fn);
        return () => this.listeners.delete(fn);
    }

    emit(e: RateLimitEvent) {
        // prevent spamming if a dialog is already open
        if (this.open) return;
        this.open = true;
        this.listeners.forEach((l) => l(e));
    }

    reset() {
        this.open = false;
    }
}

export const rateLimitBus = new RateLimitBus();

export function showRateLimit(message: string, retryAfterSeconds?: number | null) {
    rateLimitBus.emit({message, retryAfterSeconds: retryAfterSeconds ?? null});
}

export function clearRateLimitOpenFlag() {
    rateLimitBus.reset();
}
