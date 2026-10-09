import {useLayoutEffect, useState} from 'react';

/** Tracks an element's rendered width; null until the element is measured. */
export const useElementWidth = (element: HTMLElement | null) => {
    const [width, setWidth] = useState<number | null>(null);

    useLayoutEffect(() => {
        if (!element) {
            setWidth(null);
            return;
        }

        // Measure synchronously so the first paint already uses the real width.
        const measure = () => setWidth(element.clientWidth);
        measure();

        const observer = new ResizeObserver(measure);
        observer.observe(element);
        return () => observer.disconnect();
    }, [element]);

    return width;
};
