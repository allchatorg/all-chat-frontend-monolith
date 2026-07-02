"use client";

import React, {Suspense, useCallback, useEffect, useRef, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

// Thin nprogress-style bar shown while an App Router navigation is in flight
// (e.g. chat -> /portal/*). The App Router has no route-change events, so the
// bar starts from two signals — internal <a>/<Link> clicks (captured on
// document) and router.push/replace (the shared router instance is patched
// once below) — and completes when the pathname/search params actually change.

const DONE_DELAY_MS = 250; // let the bar reach 100% before fading out
const FADE_MS = 200;
const SAFETY_TIMEOUT_MS = 15_000; // hide even if a navigation never commits

// Module-level indirection so the router patch (applied once, never undone)
// always reaches the currently mounted bar, surviving dev-mode remounts.
let startProgress: (() => void) | null = null;

function navigatesAway(href: string): boolean {
    const url = new URL(href, window.location.href);
    return (
        url.origin === window.location.origin &&
        (url.pathname !== window.location.pathname || url.search !== window.location.search)
    );
}

export default function RouteProgressBar() {
    return (
        // useSearchParams() must live under a Suspense boundary.
        <Suspense fallback={null}>
            <RouteProgressBarInner/>
        </Suspense>
    );
}

function RouteProgressBarInner() {
    const [progress, setProgress] = useState(0);
    const [visible, setVisible] = useState(false);
    const activeRef = useRef(false);
    const timersRef = useRef<ReturnType<typeof setTimeout | typeof setInterval>[]>([]);

    const pathname = usePathname();
    const search = useSearchParams().toString();
    const router = useRouter();

    const clearTimers = useCallback(() => {
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
    }, []);

    const done = useCallback(() => {
        if (!activeRef.current) return;
        activeRef.current = false;
        clearTimers();
        setProgress(100);
        timersRef.current.push(
            setTimeout(() => setVisible(false), DONE_DELAY_MS),
            setTimeout(() => setProgress(0), DONE_DELAY_MS + FADE_MS),
        );
    }, [clearTimers]);

    const start = useCallback(() => {
        if (activeRef.current) return;
        activeRef.current = true;
        clearTimers();
        setVisible(true);
        setProgress(10);
        timersRef.current.push(
            // trickle toward (but never past) 90% while the navigation is pending
            setInterval(() => {
                setProgress(p => Math.min(90, p + Math.max(0.5, (90 - p) * 0.1)));
            }, 200),
            setTimeout(done, SAFETY_TIMEOUT_MS),
        );
    }, [clearTimers, done]);

    useEffect(() => {
        startProgress = start;
        return () => {
            startProgress = null;
        };
    }, [start]);

    // A committed navigation is the App Router's only reliable "done" signal.
    useEffect(() => {
        done();
    }, [pathname, search, done]);

    // Internal link clicks (covers <Link> — capture phase runs before Next's
    // own click handler calls preventDefault).
    useEffect(() => {
        const onClick = (event: MouseEvent) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            const anchor = (event.target as HTMLElement | null)?.closest?.("a");
            if (!anchor || anchor.hasAttribute("download")) return;
            if (anchor.target && anchor.target !== "_self") return;
            const href = anchor.getAttribute("href");
            if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
            if (navigatesAway(anchor.href)) start();
        };
        document.addEventListener("click", onClick, true);
        return () => document.removeEventListener("click", onClick, true);
    }, [start]);

    // Programmatic navigations (router.push in Navbar, post-submit redirects).
    // useRouter() hands every consumer the same instance, so patching it here
    // covers the whole app; the flag keeps it single-patched across remounts.
    useEffect(() => {
        const patched = router as typeof router & { __progressPatched?: boolean };
        if (patched.__progressPatched) return;
        patched.__progressPatched = true;
        (["push", "replace"] as const).forEach(method => {
            const original = router[method].bind(router);
            router[method] = (href, options) => {
                if (navigatesAway(href)) startProgress?.();
                return original(href, options);
            };
        });
    }, [router]);

    return (
        <div
            aria-hidden
            className={`pointer-events-none fixed inset-x-0 top-0 z-[9999] h-0.5 transition-opacity ${
                visible ? "opacity-100" : "opacity-0"
            }`}
            style={{transitionDuration: `${FADE_MS}ms`}}
        >
            <div
                className={`h-full bg-primary shadow-[0_0_8px_hsl(var(--primary))] ${
                    visible ? "transition-[width] duration-200 ease-out" : "transition-none"
                }`}
                style={{width: `${progress}%`}}
            />
        </div>
    );
}
