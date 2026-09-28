import {FontSnapshot, resolveFontSnapshot} from './fontPresets';

const fonts = new Map<number, FontSnapshot>();
const listeners = new Map<number, Set<() => void>>();
let sessionGeneration = 0;

export function getFontStoreGeneration(): number {
    return sessionGeneration;
}

export function getFontSnapshot(userId?: number): FontSnapshot | undefined {
    return userId === undefined ? undefined : fonts.get(userId);
}

export function applyFontUpdate(update: Partial<FontSnapshot> & {userId?: number}): void {
    if (!update || !Number.isSafeInteger(update.userId) || update.userId! <= 0) return;
    const userId = update.userId!;
    const current = fonts.get(userId);
    const next = resolveFontSnapshot(current, update);
    if (!next || next === current) return;
    fonts.set(userId, next);
    listeners.get(userId)?.forEach(listener => listener());
}

export function subscribeFonts(userId: number | undefined, listener: () => void): () => void {
    if (!Number.isSafeInteger(userId) || userId! <= 0) return () => {};
    const id = userId!;
    const userListeners = listeners.get(id) ?? new Set<() => void>();
    userListeners.add(listener);
    listeners.set(id, userListeners);
    return () => {
        userListeners.delete(listener);
        if (!userListeners.size) listeners.delete(id);
    };
}

export function clearFontStore(): void {
    sessionGeneration += 1;
    fonts.clear();
    listeners.forEach(userListeners => userListeners.forEach(listener => listener()));
}

/** Ingest JSON DTOs even when the new message/identity is in a hidden view. */
export function ingestFontSnapshots(data: unknown, expectedGeneration = sessionGeneration): void {
    if (expectedGeneration !== sessionGeneration) return;
    const pending: unknown[] = [data];
    const seen = new Set<object>();
    while (pending.length) {
        const item = pending.pop();
        if (!item || typeof item !== 'object' || seen.has(item)) continue;
        seen.add(item);
        const dto = item as Record<string, unknown>;
        if ('fontRevision' in dto) {
            applyFontUpdate({
                ...(dto as Partial<FontSnapshot>),
                userId: (dto.userId ?? dto.id) as number | undefined,
            });
        }
        if ('senderFontRevision' in dto) {
            applyFontUpdate({
                userId: dto.senderId as number | undefined,
                usernameFont: dto.senderUsernameFont as FontSnapshot['usernameFont'],
                messageFont: dto.senderMessageFont as FontSnapshot['messageFont'],
                fontRevision: dto.senderFontRevision as number,
            });
        }
        for (const value of Object.values(dto)) {
            if (value && typeof value === 'object') pending.push(value);
        }
    }
}
