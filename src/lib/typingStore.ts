import type {TypingUpdate} from '@/models/TypingUpdate';

export const TYPING_REFRESH_MS = 4_000;
export const TYPING_IDLE_MS = 5_000;
const MAX_LEASE_MS = 10_000;

interface TypingTransport {
    publish: (roomId: number, typing: boolean) => void;
    subscribe: (roomId: number, receive: (data: unknown) => void) => () => void;
}

export interface TypingParticipant {
    userId: number;
    username: string;
}

// This store is deliberately separate from messages and persisted Redux state.
const EMPTY: readonly TypingParticipant[] = [];
const participants = new Map<number, TypingParticipant & {expiresAt: number}>();
const listeners = new Set<() => void>();
const connectionListeners = new Set<() => void>();
let snapshot = EMPTY;
let connectionSnapshot = {connected: false, generation: 0};
const SERVER_CONNECTION = connectionSnapshot;
let transport: TypingTransport | null = null;
let transportOwner: symbol | null = null;
let observation: {owner: symbol; roomId: number} | null = null;
let subscribedRoom: number | null = null;
let watchOwner: symbol | null = null;
let unsubscribe: (() => void) | null = null;
let expiryTimer: ReturnType<typeof setTimeout> | null = null;
let scheduledExpiry = Infinity;
let localTypingRoom: number | null = null;

function updateSnapshot() {
    const next = [...participants.values()].sort((a, b) => a.userId - b.userId)
        .map(({userId, username}) => ({userId, username}));
    // A heartbeat only renews the lease. It must not rerender or announce the same names.
    if (next.length === snapshot.length && next.every((user, i) =>
        user.userId === snapshot[i].userId && user.username === snapshot[i].username)) return;
    snapshot = next.length ? next : EMPTY;
    listeners.forEach(listener => listener());
}

function scheduleExpiry(candidate = Infinity) {
    // Renewals can leave the earlier timer in place; it will calculate the next deadline when it fires.
    if (participants.size && expiryTimer && candidate >= scheduledExpiry) return;
    if (expiryTimer) clearTimeout(expiryTimer);
    expiryTimer = null;
    scheduledExpiry = Infinity;
    if (!participants.size) return;
    let expiry = Infinity;
    participants.forEach(user => { expiry = Math.min(expiry, user.expiresAt); });
    scheduledExpiry = expiry;
    expiryTimer = setTimeout(() => {
        expiryTimer = null;
        scheduledExpiry = Infinity;
        const now = Date.now();
        participants.forEach((user, id) => { if (user.expiresAt <= now) participants.delete(id); });
        updateSnapshot();
        scheduleExpiry();
    }, Math.max(0, expiry - Date.now()));
}

function clearParticipants() {
    participants.clear();
    if (expiryTimer) clearTimeout(expiryTimer);
    expiryTimer = null;
    scheduledExpiry = Infinity;
    updateSnapshot();
}

function receive(roomId: number, owner: symbol, data: unknown) {
    if (watchOwner !== owner || subscribedRoom !== roomId || !data || typeof data !== 'object') return;
    const event = data as Partial<TypingUpdate>;
    if (event.chatRoomId !== roomId || typeof event.userId !== 'number' || !Number.isSafeInteger(event.userId) || event.userId <= 0
        || typeof event.username !== 'string' || !event.username.trim() || typeof event.typing !== 'boolean'
        || typeof event.expiresInMs !== 'number' || !Number.isFinite(event.expiresInMs)) return;
    const previous = participants.get(event.userId);
    if (!event.typing || event.expiresInMs <= 0) {
        if (participants.delete(event.userId)) updateSnapshot();
        scheduleExpiry();
    } else {
        const expiresAt = Date.now() + Math.min(MAX_LEASE_MS, event.expiresInMs);
        participants.set(event.userId, {userId: event.userId, username: event.username, expiresAt});
        if (!previous || previous.username !== event.username) updateSnapshot();
        scheduleExpiry(expiresAt);
    }
}

export function publishTyping(roomId: number, typing: boolean): boolean {
    if (!transport || (typing && subscribedRoom !== roomId)) return false;
    if (!typing && localTypingRoom !== roomId) return false;
    try {
        if (typing && localTypingRoom !== null && localTypingRoom !== roomId) {
            transport.publish(localTypingRoom, false);
        }
        transport.publish(roomId, typing);
        localTypingRoom = typing ? roomId : null;
        return true;
    } catch {
        localTypingRoom = null;
        return false;
    }
}

function stopWatching() {
    if (localTypingRoom !== null) publishTyping(localTypingRoom, false);
    subscribedRoom = null;
    watchOwner = null;
    const cleanup = unsubscribe;
    unsubscribe = null;
    try { cleanup?.(); } catch { /* The socket may already have closed. */ }
    clearParticipants();
}

function watchVisibleRoom() {
    const roomId = observation?.roomId;
    if (!transport || !transportOwner || roomId === undefined || document.visibilityState !== 'visible') return;
    const owner = Symbol('typing-subscription');
    watchOwner = owner;
    subscribedRoom = roomId;
    try {
        unsubscribe = transport.subscribe(roomId, data => receive(roomId, owner, data));
    } catch {
        subscribedRoom = null;
    }
}

/** Installed once by the existing app-level socket. Old connection cleanup cannot clear a newer one. */
export function connectTypingTransport(next: TypingTransport): () => void {
    stopWatching();
    const owner = Symbol('typing-connection');
    transport = next;
    transportOwner = owner;
    localTypingRoom = null;
    watchVisibleRoom();
    connectionSnapshot = {connected: true, generation: connectionSnapshot.generation + 1};
    connectionListeners.forEach(listener => listener());
    return () => {
        if (transportOwner !== owner) return;
        stopWatching();
        transport = null;
        transportOwner = null;
        localTypingRoom = null;
        connectionSnapshot = {connected: false, generation: connectionSnapshot.generation + 1};
        connectionListeners.forEach(listener => listener());
    };
}

/** Only the mounted, visible conversation owns the ephemeral subscription. */
export function observeTypingRoom(roomId: number): () => void {
    stopWatching();
    const owner = Symbol('typing-view');
    observation = {owner, roomId};
    watchVisibleRoom();
    const visibilityChanged = () => {
        if (observation?.owner !== owner) return;
        stopWatching();
        watchVisibleRoom();
    };
    document.addEventListener('visibilitychange', visibilityChanged);
    return () => {
        document.removeEventListener('visibilitychange', visibilityChanged);
        if (observation?.owner !== owner) return;
        stopWatching();
        observation = null;
    };
}

export function subscribeTyping(listener: () => void) {
    listeners.add(listener);
    return () => { listeners.delete(listener); };
}
export const getTypingSnapshot = (roomId: number) => subscribedRoom === roomId ? snapshot : EMPTY;
export const getServerTypingSnapshot = () => EMPTY;
export function subscribeTypingConnection(listener: () => void) {
    connectionListeners.add(listener);
    return () => { connectionListeners.delete(listener); };
}
export const getTypingConnection = () => connectionSnapshot;
export const getServerTypingConnection = () => SERVER_CONNECTION;
