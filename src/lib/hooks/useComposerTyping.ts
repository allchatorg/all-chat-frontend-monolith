import {useCallback, useEffect, useRef, useSyncExternalStore} from 'react';
import {
    getServerTypingConnection, getTypingConnection, publishTyping, subscribeTypingConnection,
    TYPING_IDLE_MS, TYPING_REFRESH_MS,
} from '@/lib/typingStore';

export function useComposerTyping(roomId: number | undefined, enabled: boolean) {
    const connection = useSyncExternalStore(subscribeTypingConnection, getTypingConnection, getServerTypingConnection);
    const available = enabled && connection.connected && roomId !== undefined;
    const availableRef = useRef(available);
    availableRef.current = available;
    const activeRoom = useRef<number | null>(null);
    const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const lastPublished = useRef(0);

    const stop = useCallback(() => {
        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = null;
        if (activeRoom.current !== null) publishTyping(activeRoom.current, false);
        activeRoom.current = null;
        lastPublished.current = 0;
    }, []);

    const activity = useCallback((hasContent: boolean) => {
        if (!hasContent || !availableRef.current || roomId === undefined
            || document.visibilityState !== 'visible' || !document.hasFocus()) {
            stop();
            return;
        }
        const now = Date.now();
        if (activeRoom.current !== roomId || now - lastPublished.current >= TYPING_REFRESH_MS) {
            if (publishTyping(roomId, true)) {
                activeRoom.current = roomId;
                lastPublished.current = now;
            }
        }
        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(stop, TYPING_IDLE_MS);
    }, [roomId, stop]);

    useEffect(() => {
        stop();
        const visibilityChanged = () => { if (document.visibilityState !== 'visible') stop(); };
        document.addEventListener('visibilitychange', visibilityChanged);
        window.addEventListener('blur', stop);
        window.addEventListener('pagehide', stop);
        return () => {
            stop();
            document.removeEventListener('visibilitychange', visibilityChanged);
            window.removeEventListener('blur', stop);
            window.removeEventListener('pagehide', stop);
        };
    }, [roomId, available, connection.generation, stop]);

    return {activity, stop};
}
