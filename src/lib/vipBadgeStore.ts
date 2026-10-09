import api from "@/lib/api";
import {VipBadgeUpdate} from "@/models/VipBadgeUpdate";
import {applyFontUpdate, clearFontStore} from '@/lib/fontStore';
export type {VipBadgeUpdate} from "@/models/VipBadgeUpdate";

const badges = new Map<number, VipBadgeUpdate>();
const listeners = new Map<number, Set<() => void>>();
const refreshedGeneration = new Map<number, number>();
const queuedIds = new Set<number>();
let generation = 1;
let sessionGeneration = 0;
let refreshTimer: ReturnType<typeof setTimeout> | undefined;

export function getVipBadge(userId?: number): VipBadgeUpdate | undefined {
    return userId === undefined ? undefined : badges.get(userId);
}

export function applyVipBadgeUpdate(update: VipBadgeUpdate): void {
    // Fonts have their own revision. A duplicate badge can still carry new fonts.
    applyFontUpdate(update);
    if (!update || !Number.isSafeInteger(update.userId) || update.userId <= 0 ||
        typeof update.vipBadgeVisible !== "boolean" ||
        !Number.isSafeInteger(update.vipBadgeRevision) || update.vipBadgeRevision < 0) return;
    const current = badges.get(update.userId);
    // Expiry can make an identity false before the scheduled revision update.
    // At the same revision, a stale visible snapshot must never resurrect it.
    if (current && (current.vipBadgeRevision > update.vipBadgeRevision ||
        (current.vipBadgeRevision === update.vipBadgeRevision &&
            (!current.vipBadgeVisible || current.vipBadgeVisible === update.vipBadgeVisible)))) {
        return;
    }
    badges.set(update.userId, update);
    listeners.get(update.userId)?.forEach(listener => listener());
}

export function applyVipBadgeUpdates(updates: VipBadgeUpdate[]): void {
    updates.forEach(applyVipBadgeUpdate);
}

function queueRefresh(userId: number): void {
    queuedIds.add(userId);
    if (refreshTimer) return;
    refreshTimer = setTimeout(() => {
        refreshTimer = undefined;
        void flushRefreshQueue();
    }, 50);
}

async function flushRefreshQueue(): Promise<void> {
    const ids = [...queuedIds];
    queuedIds.clear();
    const requestSession = sessionGeneration;
    const requestGeneration = generation;
    for (let offset = 0; offset < ids.length; offset += 100) {
        const batch = ids.slice(offset, offset + 100);
        try {
            const {data} = await api.post<VipBadgeUpdate[]>("/vip/badges", batch);
            if (requestSession !== sessionGeneration) return;
            applyVipBadgeUpdates(data);
            batch.forEach(id => refreshedGeneration.set(id, requestGeneration));
        } catch {
            // Keep existing identities usable while offline. The next reconnect
            // or mount retries any identity that was not refreshed successfully.
        }
    }
}

export function subscribeVipBadge(userId: number | undefined, listener: () => void): () => void {
    if (userId === undefined || !Number.isSafeInteger(userId) || userId <= 0) return () => {};
    const userListeners = listeners.get(userId) ?? new Set<() => void>();
    userListeners.add(listener);
    listeners.set(userId, userListeners);
    if ((refreshedGeneration.get(userId) ?? 0) < generation) queueRefresh(userId);
    return () => {
        userListeners.delete(listener);
        if (userListeners.size === 0) listeners.delete(userId);
    };
}

/** Refresh mounted identities and defer hidden/cached identities until mounted. */
export function refreshRegisteredVipBadges(): void {
    generation += 1;
    listeners.forEach((_, userId) => queueRefresh(userId));
}

export function clearVipBadgeStore(): void {
    sessionGeneration += 1;
    generation = 1;
    clearFontStore();
    badges.clear();
    refreshedGeneration.clear();
    queuedIds.clear();
    if (refreshTimer) clearTimeout(refreshTimer);
    refreshTimer = undefined;
    listeners.forEach(userListeners => userListeners.forEach(listener => listener()));
}
