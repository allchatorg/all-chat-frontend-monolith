import {useCallback, useEffect, useRef, useState} from 'react';

interface UsePullToRefreshOptions {
    /** The scrollable container element */
    scrollElement: HTMLElement | null;
    /** Callback fired when pull threshold is exceeded and released */
    onRefresh: () => Promise<void>;
    /** Whether pull-to-refresh is enabled */
    enabled: boolean;
    /** Pull distance (px) required to trigger refresh */
    threshold?: number;
}

interface PullToRefreshState {
    /** Current pull distance in pixels (0 when idle) */
    pullDistance: number;
    /** Whether user is actively pulling */
    isPulling: boolean;
    /** Whether refresh callback is running */
    isRefreshing: boolean;
}

const DEFAULT_THRESHOLD = 150;
const DAMPEN_FACTOR = 0.45;
const MAX_PULL = 150;
const WHEEL_DAMPEN = 0.15; // Halved to require more deliberate scrolling on trackpads
const WHEEL_DECAY_MS = 800;

export function usePullToRefresh({
                                     scrollElement,
                                     onRefresh,
                                     enabled,
                                     threshold = DEFAULT_THRESHOLD,
                                 }: UsePullToRefreshOptions): PullToRefreshState {
    const [pullDistance, setPullDistance] = useState(0);
    const [isPulling, setIsPulling] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const startY = useRef(0);
    const currentPull = useRef(0);
    const pulling = useRef(false);
    const refreshing = useRef(false);
    const wheelAccumulator = useRef(0);
    const wheelDecayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const rafRef = useRef<number | null>(null);
    const onRefreshRef = useRef(onRefresh);

    useEffect(() => {
        onRefreshRef.current = onRefresh;
    }, [onRefresh]);

    const dampen = useCallback((raw: number) => {
        return Math.min(raw * DAMPEN_FACTOR, MAX_PULL);
    }, []);

    const updatePullDistance = useCallback((distance: number) => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = requestAnimationFrame(() => {
            setPullDistance(distance);
        });
    }, []);

    const triggerRefresh = useCallback(() => {
        if (refreshing.current) return;
        refreshing.current = true;
        pulling.current = false;
        currentPull.current = threshold * 0.6;
        setIsRefreshing(true);
        setIsPulling(false);

        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        setPullDistance(threshold * 0.6); // hold indicator visible during refresh

        onRefreshRef.current().finally(() => {
            refreshing.current = false;
            pulling.current = false;
            currentPull.current = 0;
            wheelAccumulator.current = 0;
            setIsRefreshing(false);
            setIsPulling(false);

            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            setPullDistance(0);
        });
    }, [threshold]);

    const resetPull = useCallback(() => {
        if (refreshing.current) return;

        if (currentPull.current >= threshold) {
            triggerRefresh();
        } else {
            pulling.current = false;
            currentPull.current = 0;
            setIsPulling(false);

            if (rafRef.current) cancelAnimationFrame(rafRef.current);
            setPullDistance(0);
        }
    }, [threshold, triggerRefresh]);

    useEffect(() => {
        if (!scrollElement || !enabled) return;

        // --- Touch handlers ---
        const handleTouchStart = (e: TouchEvent) => {
            if (refreshing.current || scrollElement.scrollTop > 0) return;
            startY.current = e.touches[0].clientY;
            pulling.current = true;
            setIsPulling(true);
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!pulling.current || refreshing.current) return;
            if (scrollElement.scrollTop > 0) {
                // User scrolled back down, cancel pull
                pulling.current = false;
                currentPull.current = 0;
                setIsPulling(false);
                updatePullDistance(0);
                return;
            }

            const deltaY = e.touches[0].clientY - startY.current;
            if (deltaY > 0) {
                e.preventDefault();
                currentPull.current = dampen(deltaY);
                updatePullDistance(currentPull.current);
            }
        };

        const handleTouchEnd = () => {
            if (!pulling.current) return;
            resetPull();
        };

        // --- Mouse drag handlers ---
        let mouseDown = false;

        const handleMouseDown = (e: MouseEvent) => {
            if (refreshing.current || scrollElement.scrollTop > 0) return;
            // Only primary button
            if (e.button !== 0) return;
            mouseDown = true;
            startY.current = e.clientY;
            pulling.current = true;
            setIsPulling(true);
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!mouseDown || !pulling.current || refreshing.current) return;
            if (scrollElement.scrollTop > 0) {
                mouseDown = false;
                pulling.current = false;
                currentPull.current = 0;
                setIsPulling(false);
                updatePullDistance(0);
                return;
            }

            const deltaY = e.clientY - startY.current;
            if (deltaY > 0) {
                e.preventDefault();
                currentPull.current = dampen(deltaY);
                updatePullDistance(currentPull.current);
            }
        };

        const handleMouseUp = () => {
            if (!mouseDown) return;
            mouseDown = false;
            if (!pulling.current) return;
            resetPull();
        };

        // --- Wheel handler ---
        const handleWheel = (e: WheelEvent) => {
            if (refreshing.current) return;
            // Only care about upward scroll (negative deltaY) when at top
            if (scrollElement.scrollTop > 0 || e.deltaY >= 0) {
                // User scrolling down or not at top — reset accumulator
                if (wheelAccumulator.current > 0) {
                    wheelAccumulator.current = 0;
                    pulling.current = false;
                    currentPull.current = 0;
                    setIsPulling(false);
                    updatePullDistance(0);
                }
                return;
            }

            // Accumulate upward wheel distance
            e.preventDefault();
            const increment = Math.abs(e.deltaY) * WHEEL_DAMPEN;
            wheelAccumulator.current = Math.min(wheelAccumulator.current + increment, MAX_PULL);
            currentPull.current = wheelAccumulator.current;
            pulling.current = true;
            setIsPulling(true);
            updatePullDistance(currentPull.current);

            // Auto-trigger if past threshold
            if (wheelAccumulator.current >= threshold) {
                if (wheelDecayTimer.current) clearTimeout(wheelDecayTimer.current);
                triggerRefresh();
                return;
            }

            // Decay: if user stops scrolling, retract the indicator
            if (wheelDecayTimer.current) clearTimeout(wheelDecayTimer.current);
            wheelDecayTimer.current = setTimeout(() => {
                wheelAccumulator.current = 0;
                currentPull.current = 0;
                pulling.current = false;
                setIsPulling(false);
                updatePullDistance(0);
            }, WHEEL_DECAY_MS);
        };

        scrollElement.addEventListener('touchstart', handleTouchStart, {passive: true});
        scrollElement.addEventListener('touchmove', handleTouchMove, {passive: false});
        scrollElement.addEventListener('touchend', handleTouchEnd, {passive: true});
        scrollElement.addEventListener('mousedown', handleMouseDown);
        scrollElement.addEventListener('mousemove', handleMouseMove);
        scrollElement.addEventListener('mouseup', handleMouseUp);
        scrollElement.addEventListener('mouseleave', handleMouseUp);
        scrollElement.addEventListener('wheel', handleWheel, {passive: false});

        return () => {
            scrollElement.removeEventListener('touchstart', handleTouchStart);
            scrollElement.removeEventListener('touchmove', handleTouchMove);
            scrollElement.removeEventListener('touchend', handleTouchEnd);
            scrollElement.removeEventListener('mousedown', handleMouseDown);
            scrollElement.removeEventListener('mousemove', handleMouseMove);
            scrollElement.removeEventListener('mouseup', handleMouseUp);
            scrollElement.removeEventListener('mouseleave', handleMouseUp);
            scrollElement.removeEventListener('wheel', handleWheel);
            if (wheelDecayTimer.current) clearTimeout(wheelDecayTimer.current);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [scrollElement, enabled, dampen, resetPull, triggerRefresh, threshold]);

    return {pullDistance, isPulling, isRefreshing};
}
