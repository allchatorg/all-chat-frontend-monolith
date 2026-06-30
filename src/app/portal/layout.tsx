"use client";

import React, {useEffect} from "react";
import {useRouter} from "next/navigation";
import {SidebarInset, SidebarProvider} from "@ads/components/ui/sidebar";
import {AppSidebar} from "@ads/components/app-sidebar";
import {DialogProvider} from "@ads/components/providers/DialogProvider";
import {Toaster} from "@ads/components/ui/sonner";
import {useUser} from "@/lib/hooks/useUser";
import {Spinner} from "@/components/Spinner";

/**
 * Layout for the Ads Portal section of the merged monolith.
 *
 * Auth is the shared chat session: `useUser` hydrates the current user from the
 * backend. While that resolves we show a spinner; if there is no authenticated
 * user we send the visitor to the shared login. The portal renders its own
 * dashboard chrome (sidebar) instead of the chat navbar/footer (AppShell skips
 * those for /portal routes).
 */
export default function PortalLayout({children}: { children: React.ReactNode }) {
    const {user, isInitializing} = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isInitializing && !user) {
            router.replace("/auth?view=login");
        }
    }, [isInitializing, user, router]);

    if (isInitializing) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center">
                <Spinner/>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <DialogProvider>
            <SidebarProvider
                style={
                    {
                        "--sidebar-width": "calc(var(--spacing, 0.25rem) * 72)",
                        "--header-height": "calc(var(--spacing, 0.25rem) * 12)",
                    } as React.CSSProperties
                }
            >
                <AppSidebar variant="inset"/>
                <SidebarInset className="bg-brand">
                    <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
                </SidebarInset>
            </SidebarProvider>
            <Toaster/>
        </DialogProvider>
    );
}
