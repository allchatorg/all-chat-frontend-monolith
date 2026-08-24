import {useCallback, useEffect, useRef} from 'react';

export function useIntersectionObserver(
    callback: (entry: IntersectionObserverEntry) => void,
    options?: IntersectionObserverInit
) {
    const observer = useRef<IntersectionObserver | null>(null);
    const timeoutId = useRef<NodeJS.Timeout | null>(null);
    const nodeRef = useRef<HTMLElement | null>(null);
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

        nodeRef.current = node;

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

    // Re-observing delivers a fresh initial entry with the current intersection
    // state. The observer otherwise only reports transitions, so a sentinel that
    // is already on screen when its guard conditions become true would never fire.
    const recheck = useCallback(() => {
        const node = nodeRef.current;
        if (!observer.current || !node) return;
        observer.current.unobserve(node);
        observer.current.observe(node);
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
        nodeRef.current = null;
    }, []);

    useEffect(() => {
        return cleanup;
    }, [cleanup]);

    return {elementRef, recheck, cleanup};
}
