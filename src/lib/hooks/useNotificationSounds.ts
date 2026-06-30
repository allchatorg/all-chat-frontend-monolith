import {useCallback, useEffect, useRef} from "react";

export function useNotificationSounds() {
    const audioContextRef = useRef<AudioContext | null>(null);
    const ownSoundBufferRef = useRef<AudioBuffer | null>(null);
    const notificationBufferRef = useRef<AudioBuffer | null>(null);
    const reportBufferRef = useRef<AudioBuffer | null>(null);
    const privateSendBufferRef = useRef<AudioBuffer | null>(null);
    const privateReceiveBufferRef = useRef<AudioBuffer | null>(null);
    const unlockedRef = useRef(false);

    // Load audio files as ArrayBuffers (works without user gesture)
    useEffect(() => {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const load = async (url: string): Promise<AudioBuffer | null> => {
            try {
                const res = await fetch(url);
                const buf = await res.arrayBuffer();
                return await ctx.decodeAudioData(buf);
            } catch (err) {
                console.warn("Failed to load sound:", url, err);
                return null;
            }
        };

        load("/sounds/send_message_notification.mp3").then(b => ownSoundBufferRef.current = b);
        load("/sounds/receive_message_notification.mp3").then(b => notificationBufferRef.current = b);
        load("/sounds/report_staff_notification.mp3").then(b => reportBufferRef.current = b);
        load("/sounds/send_message_private_notification.mp3").then(b => privateSendBufferRef.current = b);
        load("/sounds/receive_message_private_notification.mp3").then(b => privateReceiveBufferRef.current = b);

        return () => {
            ctx.close();
        };
    }, []);

    // Unlock AudioContext on the first user interaction (required for Safari/iOS)
    const unlockAudio = useCallback(() => {
        const ctx = audioContextRef.current;
        if (!ctx || unlockedRef.current) return;
        if (ctx.state === "suspended") {
            ctx.resume().then(() => {
                unlockedRef.current = true;
            });
        } else {
            unlockedRef.current = true;
        }
    }, []);

    useEffect(() => {
        document.addEventListener("click", unlockAudio, {once: true});
        document.addEventListener("touchstart", unlockAudio, {once: true});
        return () => {
            document.removeEventListener("click", unlockAudio);
            document.removeEventListener("touchstart", unlockAudio);
        };
    }, [unlockAudio]);

    const playBuffer = useCallback((buffer: AudioBuffer | null) => {
        const ctx = audioContextRef.current;
        if (!ctx || !buffer) return;
        // Ensure context is running before playing
        if (ctx.state === "suspended") {
            ctx.resume().catch(() => {
            });
        }
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start(0);
    }, []);

    const playNotificationSound = useCallback((isOwn: boolean) => {
        playBuffer(isOwn ? ownSoundBufferRef.current : notificationBufferRef.current);
    }, [playBuffer]);

    const playReportNotificationSound = useCallback(() => {
        playBuffer(reportBufferRef.current);
    }, [playBuffer]);

    const playPrivateNotificationSound = useCallback((isOwn: boolean) => {
        playBuffer(isOwn ? privateSendBufferRef.current : privateReceiveBufferRef.current);
    }, [playBuffer]);

    return {playNotificationSound, playReportNotificationSound, playPrivateNotificationSound};
}
