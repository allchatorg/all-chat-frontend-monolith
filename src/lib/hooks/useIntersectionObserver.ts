import {useCallback, useEffect, useRef} from 'react';

export function useIntersectionObserver(
    callback: (entry: IntersectionObserverEntry) => void,
    options?: IntersectionObserverInit
) {
    const observer = useRef<IntersectionObserver | null>(null);
    const timeoutId = useRef<NodeJS.Timeout | null>(null);
    // Latest callback/options live in refs so `elementRef` keeps a stable identity.
    // Otherwise React re-runs the ref callback every render, tearing down and
    // re-arming the observer (with the delay below) and sentinels never fire
    // during render bursts (reconnect refetch, pull-to-refresh, ad placement).
    const callbackRef = useRef(callback);
    const optionsRef = useRef(options);
    const DELAY_MS = 275;

    callbackRef.current = callback;
    optionsRef.current = options;

    const elementRef = useCallback((node: HTMLElement | null) => {
        if (observer.current) {
            observer.current.disconnect();
            observer.current = null;
        }

        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
        }

        if (node) {
            timeoutId.current = setTimeout(() => {
                observer.current = new IntersectionObserver(
                    (entries) => {
                        entries.forEach(entry => callbackRef.current(entry));
                    },
                    optionsRef.current
                );
                observer.current.observe(node);
            }, DELAY_MS);
        }
    }, []);

    const cleanup = useCallback(() => {
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
            timeoutId.current = null;
        }

        if (observer.current) {
            observer.current.disconnect();
            observer.current = null;
        }
    }, []);

    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return {elementRef, cleanup};
}
