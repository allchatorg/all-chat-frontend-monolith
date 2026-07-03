"use client";

import React, {useEffect} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {SidebarInset, SidebarProvider} from "@ads/components/ui/sidebar";
import {AppSidebar} from "@ads/components/app-sidebar";
import {DialogProvider} from "@ads/components/providers/DialogProvider";
import {Toaster} from "@ads/components/ui/sonner";
import {useUser} from "@/lib/hooks/useUser";
import {useRoleAccess} from "@/lib/hooks/useRoleAccess";
import {Role} from "@/models/Role";
import {Spinner} from "@/components/Spinner";
import {ClaimAccountGate} from "@/app/portal/components/ClaimAccountGate";

/**
 * Where the current visitor belongs, or null to stay on `pathname`.
 *
 * Redirect matrix:
 *   /portal/admin/*: null (admin pages keep their own guards).
 *   /portal (landing):
 *     guest / not-logged-in -> null (public landing)
 *     staff                 -> super admin ? /portal/admin/dashboard : /portal/admin/ads
 *     user with >=1 ad      -> /portal/dashboard
 *     user with no ads      -> /portal/campaign
 *   inner routes:
 *     guest / not-logged-in                            -> register (returning here after auth)
 *     unclaimed (throwaway) account                    -> null (layout renders ClaimAccountGate)
 *     non-staff, no ads, not campaign/payment-methods  -> /portal/campaign
 *     otherwise                                        -> null
 */
function resolvePortalRedirect(
    pathname: string,
    {isGuestOrAnon, isUnclaimed, isStaff, isSuperAdmin, hasAd, returnTo}: {
        isGuestOrAnon: boolean;
        isUnclaimed: boolean;
        isStaff: boolean;
        isSuperAdmin: boolean;
        hasAd: boolean;
        returnTo: string;
    }
): string | null {
    if (pathname.startsWith("/portal/admin")) return null;
    if (pathname === "/portal") {
        if (isGuestOrAnon) return null;
        if (isStaff) return isSuperAdmin ? "/portal/admin/dashboard" : "/portal/admin/ads";
        return hasAd ? "/portal/dashboard" : "/portal/campaign";
    }
    // Send visitors through registration and back to where they were headed
    // (e.g. /portal/campaign?formatId=X from a landing-page CTA or deep link).
    if (isGuestOrAnon) return `/auth?view=register&redirect=${encodeURIComponent(returnTo)}`;
    // Throwaway accounts stay put and get a "claim your account" notice instead
    // of a confusing bounce to the campaign page.
    if (isUnclaimed) return null;
    // Payment methods is exempt from the no-ads funnel: cards can be managed
    // before the first campaign is purchased (and right after claiming).
    if (
        !isStaff && !hasAd &&
        pathname !== "/portal/campaign" &&
        pathname !== "/portal/payment-methods"
    ) return "/portal/campaign";
    return null;
}

/**
 * Layout for the Ads Portal section of the merged monolith.
 *
 * Auth is the shared chat session (`useUser` hydrates the current user). This
 * layout also gates portal access by account maturity — see
 * {@link resolvePortalRedirect} for the full redirect matrix.
 *
 * The `/portal` landing renders as a clean public page (no sidebar); inner
 * routes render the dashboard chrome (sidebar).
 */
export default function PortalLayout({children}: { children: React.ReactNode }) {
    const {user, isInitializing} = useUser();
    const {isStaffMember, currentRole} = useRoleAccess();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const isLanding = pathname === "/portal";
    const isUnclaimed = user?.role === Role.UNCLAIMED_USER;
    const search = searchParams.toString();
    const redirectTarget = resolvePortalRedirect(pathname, {
        isGuestOrAnon: !user || user.role === Role.GUEST,
        isUnclaimed,
        isStaff: isStaffMember(),
        isSuperAdmin: currentRole === Role.SUPER_ADMIN,
        hasAd: (user?.purchasedAdsCount ?? 0) > 0,
        returnTo: search ? `${pathname}?${search}` : pathname,
    });

    // Throwaway accounts see the claim notice instead of inner-page content.
    // The campaign page is exempt: unclaimed users may browse ad formats there
    // (it gates the later steps itself), and admin routes keep their own guards.
    const showClaimGate =
        isUnclaimed &&
        !isLanding &&
        pathname !== "/portal/campaign" &&
        !pathname.startsWith("/portal/admin");

    useEffect(() => {
        if (isInitializing || !redirectTarget) return;
        router.replace(redirectTarget);
    }, [isInitializing, redirectTarget, router]);

    if (isInitializing) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center">
                <Spinner/>
            </div>
        );
    }

    // Suppress content while a redirect is pending to avoid flashes.
    if (redirectTarget) {
        return null;
    }

    return (
        <DialogProvider>
            {isLanding ? (
                // body is a fixed-height flex column, so the landing needs its
                // own viewport-bounded scroll region.
                <div className="h-svh overflow-y-auto">{children}</div>
            ) : (
                <SidebarProvider
                    // h-svh caps the wrapper (component default is min-h-svh
                    // only) so the inner overflow-y-auto div actually scrolls.
                    className="h-svh"
                    style={
                        {
                            "--sidebar-width": "calc(var(--spacing, 0.25rem) * 72)",
                            "--header-height": "calc(var(--spacing, 0.25rem) * 12)",
                        } as React.CSSProperties
                    }
                >
                    <AppSidebar variant="inset"/>
                    <SidebarInset className="bg-background overflow-hidden">
                        <div className="min-h-0 flex-1 overflow-y-auto">
                            {showClaimGate ? <ClaimAccountGate/> : children}
                        </div>
                    </SidebarInset>
                </SidebarProvider>
            )}
            <Toaster/>
        </DialogProvider>
    );
}
