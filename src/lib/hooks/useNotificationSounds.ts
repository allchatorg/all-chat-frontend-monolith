import {useCallback, useEffect, useRef} from "react";

export function useNotificationSounds() {
    const audioContextRef = useRef<AudioContext | null>(null);
    const ownSoundBufferRef = useRef<AudioBuffer | null>(null);
    const notificationBufferRef = useRef<AudioBuffer | null>(null);
    const reportBufferRef = useRef<AudioBuffer | null>(null);
    const privateSendBufferRef = useRef<AudioBuffer | null>(null);
    const privateReceiveBufferRef = useRef<AudioBuffer | null>(null);

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

    // Unlock the AudioContext on user interaction (required for Safari/iOS).
    // The listeners stay attached for the hook's lifetime: browsers can
    // re-suspend an idle context, and a one-shot listener whose resume() was
    // rejected would leave the context suspended forever.
    const unlockAudio = useCallback(() => {
        const ctx = audioContextRef.current;
        if (!ctx || ctx.state !== "suspended") return;
        ctx.resume().catch(() => {
        });
    }, []);

    useEffect(() => {
        document.addEventListener("click", unlockAudio);
        document.addEventListener("touchstart", unlockAudio);
        return () => {
            document.removeEventListener("click", unlockAudio);
            document.removeEventListener("touchstart", unlockAudio);
        };
    }, [unlockAudio]);

    const playBuffer = useCallback((buffer: AudioBuffer | null) => {
        const ctx = audioContextRef.current;
        if (!ctx || !buffer) return;
        const start = () => {
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            source.start(0);
        };
        if (ctx.state === "suspended") {
            // Starting a source on a suspended context swallows the sound when
            // the resume is rejected by autoplay policy (a websocket handler is
            // not a user gesture); start only once the context is running.
            ctx.resume().then(start).catch(() => {
            });
        } else {
            start();
        }
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
