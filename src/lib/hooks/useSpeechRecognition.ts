import {useCallback, useEffect, useRef, useState} from "react";

interface UseSpeechRecognitionOptions {
    onResult: (text: string) => void;
    onInterim?: (text: string) => void;
    onError?: (code: string) => void;
    lang?: string;
}

interface UseSpeechRecognition {
    isSupported: boolean;
    isListening: boolean;
    start: () => void;
    stop: () => void;
    toggle: () => void;
}

const getSpeechRecognition = (): typeof SpeechRecognition | null => {
    if (typeof window === "undefined") return null;
    const w = window as unknown as {
        SpeechRecognition?: typeof SpeechRecognition;
        webkitSpeechRecognition?: typeof SpeechRecognition;
    };
    return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

/**
 * Browser-native speech-to-text via the Web Speech API.
 *
 * Continuous recognition that streams live, not-yet-final words through
 * `onInterim` (updated on every recognition tick) and emits finalized chunks
 * through `onResult`. Not supported in Firefox — callers should hide their
 * trigger when `isSupported` is false. Restarts itself on `end` (mobile
 * browsers stop the stream periodically) until the caller stops it.
 */
export function useSpeechRecognition(
    {onResult, onInterim, onError, lang}: UseSpeechRecognitionOptions
): UseSpeechRecognition {
    const [isSupported, setIsSupported] = useState(false);
    const [isListening, setIsListening] = useState(false);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const shouldListenRef = useRef(false);

    // Keep the latest callbacks without re-creating the recognition instance.
    const onResultRef = useRef(onResult);
    const onInterimRef = useRef(onInterim);
    const onErrorRef = useRef(onError);
    onResultRef.current = onResult;
    onInterimRef.current = onInterim;
    onErrorRef.current = onError;

    useEffect(() => {
        const SR = getSpeechRecognition();
        if (!SR) return;

        setIsSupported(true);

        const recognition = new SR();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang || (typeof navigator !== "undefined" ? navigator.language : "en-US") || "en-US";

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let finalText = "";
            let interimText = "";
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalText += result[0].transcript;
                } else {
                    interimText += result[0].transcript;
                }
            }
            // Stream the live, still-changing words first so the composer
            // updates on every tick, then commit any finalized chunk.
            onInterimRef.current?.(interimText.trim());
            const trimmed = finalText.trim();
            if (trimmed) onResultRef.current(trimmed);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            // `no-speech`/`aborted` fire routinely and shouldn't surface to the user.
            if (event.error === "no-speech" || event.error === "aborted") return;
            // A hard failure (e.g. permission denied) — stop trying to restart.
            shouldListenRef.current = false;
            setIsListening(false);
            onErrorRef.current?.(event.error);
        };

        recognition.onend = () => {
            // The engine stops on its own; restart while the user wants to keep going.
            if (shouldListenRef.current) {
                try {
                    recognition.start();
                } catch {
                    // start() throws if already started — safe to ignore.
                }
            } else {
                setIsListening(false);
            }
        };

        recognitionRef.current = recognition;

        return () => {
            shouldListenRef.current = false;
            recognition.onresult = null;
            recognition.onerror = null;
            recognition.onend = null;
            try {
                recognition.stop();
            } catch {
                // Ignore — nothing to stop.
            }
            recognitionRef.current = null;
        };
    }, [lang]);

    const start = useCallback(() => {
        const recognition = recognitionRef.current;
        if (!recognition || shouldListenRef.current) return;
        shouldListenRef.current = true;
        try {
            recognition.start();
            setIsListening(true);
        } catch {
            // start() throws if already started — keep the listening state in sync.
            setIsListening(true);
        }
    }, []);

    const stop = useCallback(() => {
        const recognition = recognitionRef.current;
        shouldListenRef.current = false;
        setIsListening(false);
        if (!recognition) return;
        try {
            recognition.stop();
        } catch {
            // Ignore — already stopped.
        }
    }, []);

    const toggle = useCallback(() => {
        if (shouldListenRef.current) stop();
        else start();
    }, [start, stop]);

    return {isSupported, isListening, start, stop, toggle};
}
