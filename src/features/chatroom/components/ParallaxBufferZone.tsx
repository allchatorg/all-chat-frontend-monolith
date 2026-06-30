import React, {useEffect, useRef, useState} from "react";
import {MessageSkeletons} from "./MessageSkeletons";

interface ParallaxBufferZoneProps {
    /** The height of the viewport. Defaults to 250 if not specified or unable to measure. */
    viewportHeight?: number;
    /** The scrollable container to manipulate its scroll position */
    scrollElement: HTMLElement | null;
}

export const ParallaxBufferZone: React.FC<ParallaxBufferZoneProps> = ({
                                                                          viewportHeight: initialViewportHeight = 250,
                                                                          scrollElement,
                                                                      }) => {
    const triggerRef = useRef<HTMLDivElement>(null);
    const [viewportHeight, setViewportHeight] = useState(initialViewportHeight);

    useEffect(() => {
        // Attempt to dynamically get viewport height from the scroll container
        if (scrollElement) {
            const height = scrollElement.clientHeight;
            if (height > 0) {
                setViewportHeight(height);
            }
        }

        // Optional: resize listener to adapt to window changes
        const handleResize = () => {
            if (scrollElement) {
                const height = scrollElement.clientHeight;
                if (height > 0) {
                    setViewportHeight(height);
                }
            }
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [scrollElement]);

    const containerHeight = viewportHeight * 3;

    useEffect(() => {
        const triggerElement = triggerRef.current;

        if (!triggerElement || !scrollElement) return;

        const handleIntersect = (entries: IntersectionObserverEntry[]) => {
            const entry = entries[0];
            if (entry.isIntersecting) {
                // When we hit the trigger point (scrolling up),
                // we push the scroll position exactly 1 viewport height down
                // to simulate infinite scrolling.
                scrollElement.scrollTop = scrollElement.scrollTop + viewportHeight;
            }
        };

        const observer = new IntersectionObserver(handleIntersect, {
            root: scrollElement,
            rootMargin: "0px",
            threshold: 0,
        });

        observer.observe(triggerElement);

        return () => {
            observer.disconnect();
        };
    }, [viewportHeight, scrollElement]);

    return (
        <div
            data-buffer-zone
            style={{
                height: `${containerHeight}px`,
                position: "relative",
                overflow: "hidden",
            }}
            className="flex flex-col justify-end pb-4 mask-image-top"
        >
            {/*
        Intersection trigger placed exactly 1 viewport height from the top.
        When user scrolls up and hits this line, the jump triggers.
      */}
            <div
                ref={triggerRef}
                style={{
                    position: "absolute",
                    top: `${viewportHeight}px`,
                    height: "1px",
                    width: "100%",
                }}
            />

            {/* Repeating pattern of skeletons that will look seamless when we jump */}
            <MessageSkeletons count={15} className="opacity-50"/>
        </div>
    );
};

export default ParallaxBufferZone;
