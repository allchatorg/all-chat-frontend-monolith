import {useCallback, useEffect, useRef} from 'react';

export function useIntersectionObserver(
    callback: (entry: IntersectionObserverEntry) => void,
    options?: IntersectionObserverInit
) {
    const observer = useRef<IntersectionObserver | null>(null);
    const timeoutId = useRef<NodeJS.Timeout | null>(null);
    const DELAY_MS = 275;

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
                        entries.forEach(callback);
                    },
                    options
                );
                observer.current.observe(node);
            }, DELAY_MS);
        }
    }, [callback, options]);

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
