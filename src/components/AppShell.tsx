"use client";

import React, {useEffect} from "react";
import {usePathname} from "next/navigation";
import {Navbar} from "@/components/Navbar";
import AuthGuard from "@/components/AuthGuard";
import {Toaster} from "@/components/ui/sonner";
import AppInitializer from "@/components/AppInitializer";
import RateLimitDialog from "@/components/RateLimitDialog";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import {Footer} from "@/components/Footer";
import {ROUTES} from "@/routes";

export function AppShell({children}: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdPreviewRoute = pathname.startsWith(ROUTES.AD_PREVIEW);
    const isPortalRoute = pathname.startsWith("/portal");

    // The Ads Portal has its own opaque, themed chrome and should not show the
    // chat's full-screen background image (`.app-background` on <body>). Chat's
    // AppInitializer normally toggles `data-app-background`, but it isn't rendered
    // on /portal routes, so hide the image here and restore it on the way out.
    // We also tag the body with `data-portal` so globals.css can scope the
    // portal's solid-surface tokens (card/popover/border) — including for
    // body-portaled overlays (dialogs, dropdowns, toasts) — without touching
    // chat's shared theme.
    useEffect(() => {
        if (!isPortalRoute) return;
        document.body.dataset.appBackground = "hidden";
        document.body.dataset.portal = "true";
        return () => {
            document.body.removeAttribute("data-app-background");
            document.body.removeAttribute("data-portal");
        };
    }, [isPortalRoute]);

    // The Ads Portal renders its own dashboard chrome (sidebar) via
    // src/app/portal/layout.tsx, so skip the chat navbar/footer here. AuthGuard
    // still wraps it so the shared session is hydrated (the portal layout
    // redirects to /auth if there is no authenticated user).
    if (isPortalRoute) {
        return (
            <AuthGuard>
                {children}
                <RateLimitDialog/>
                <GoogleAnalytics/>
            </AuthGuard>
        );
    }

    if (isAdPreviewRoute) {
        return (
            <>
                <main className="flex min-h-screen flex-1 overflow-auto">
                    <div className="w-full overflow-x-hidden">
                        {children}
                    </div>
                </main>
                <Toaster/>
            </>
        );
    }

    return (
        <AuthGuard>
            <AppInitializer>
                <Navbar/>
                <div className="flex flex-1 overflow-auto">
                    <div className="min-h-0 flex-1 overflow-x-hidden pt-2 md:pt-4">
                        {children}
                    </div>
                </div>
                <Footer/>
                <Toaster/>
                <RateLimitDialog/>
                <GoogleAnalytics/>
            </AppInitializer>
        </AuthGuard>
    );
}
