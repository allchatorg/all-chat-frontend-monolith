'use client';

import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import {useEffect} from 'react';
import {useUser} from "@/lib/hooks/useUser";
import {isAuthFlowRoute, isBillingRoute, isProtectedRoute, isStaffRoute, ROUTES, sanitizeRedirectParam} from "@/routes";
import {isStaff, Role} from "@/models/Role";
import {Spinner} from './Spinner';
import {useIpDetails} from "@/lib/hooks/useIpDetails";
import {useTimeZoneSync} from "@/lib/hooks/useTimeZoneSync";

export default function AuthGuard({children}: { children: React.ReactNode }) {
    const {user, error, isInitializing} = useUser();
    const {ipDetails, isLoading: isIpDetailsLoading} = useIpDetails();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    useTimeZoneSync(isBillingRoute(pathname, searchParams) ? null : user);
    const router = useRouter();
    const redirectAfterAuth = sanitizeRedirectParam(searchParams.get("redirect"));
    const returnPath = `${pathname}${searchParams.size ? `?${searchParams.toString()}` : ''}`;

    const isAuthenticated = !!user;
    const hasFlaggedIp = ipDetails?.requiredVerification !== 'NONE';
    const isGuest = user?.role === Role.GUEST;
    const isVerified = user?.verified === true;

    useEffect(() => {
        if (isInitializing) return;

        const redirectConfig = getRedirectPath({
            isAuthenticated,
            isBanned: user?.banned === true,
            hasFlaggedIp,
            isGuest,
            isVerified,
            pathname,
            userRole: user?.role,
            redirectAfterAuth,
            returnPath
        });

        if (redirectConfig) {
            router.push(redirectConfig);
        }
    }, [isInitializing, user, pathname, router, ipDetails, redirectAfterAuth, returnPath]);

    // Do not mount Home while sending a signed-out billing return to login:
    // its own unauthenticated redirect would otherwise discard the return URL.
    const isLoading = isInitializing || isIpDetailsLoading ||
        (isBillingRoute(pathname, searchParams) && !user) || (isProtectedRoute(pathname) && !user && !error);

    if (isLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center">
                <Spinner/>
            </div>
        );
    }

    return <>{children}</>;
}

function getRedirectPath({
                             isAuthenticated,
                             isBanned,
                             hasFlaggedIp,
                             isGuest,
                             isVerified,
                             pathname,
                             userRole,
                             redirectAfterAuth,
                             returnPath
                         }: {
    isAuthenticated: boolean;
    isBanned: boolean;
    hasFlaggedIp: boolean;
    isGuest: boolean;
    isVerified: boolean;
    pathname: string;
    userRole?: Role;
    redirectAfterAuth?: string | null;
    returnPath: string;
}): string | null {
    const billingRoute = isBillingRoute(pathname, new URLSearchParams(returnPath.split('?')[1] ?? ''));
    // Unauthenticated users
    if (!isAuthenticated) {
        if (billingRoute) {
            return `${ROUTES.LOGIN}&redirect=${encodeURIComponent(returnPath)}`;
        }
        if (isProtectedRoute(pathname)) {
            return ROUTES.REGISTER;
        }
        if (pathname === ROUTES.REGISTER_ANONYMOUS && hasFlaggedIp) {
            return ROUTES.REGISTER;
        }
        return null;
    }

    // Banned users are corralled to the ban info / appeal pages; the backend
    // enforces the same boundary via the AccessRestrictionFilter whitelist.
    if (isBanned) {
        if (pathname === ROUTES.AUTH && redirectAfterAuth && isBillingRoute(redirectAfterAuth.split('?')[0], new URLSearchParams(redirectAfterAuth.split('?')[1] ?? ''))) return redirectAfterAuth;
        return pathname.startsWith(ROUTES.BANNED) || billingRoute ? null : ROUTES.BANNED;
    }

    // Existing subscribers must retain access to invoices and cancellation.
    if (billingRoute) return null;

    // Authenticated users
    if (hasFlaggedIp && isGuest) {
        return ROUTES.REGISTER;
    }

    if (pathname === ROUTES.APPLY_MODERATOR) {
        if (userRole !== Role.USER || !isVerified) {
            return ROUTES.HOME;
        }
    }

    if (isAuthFlowRoute(pathname) && !isGuest) {
        // Honor a sanitized ?redirect= param (e.g. back to the ads portal
        // campaign the visitor picked before registering).
        return redirectAfterAuth ?? ROUTES.HOME;
    }

    if (isStaffRoute(pathname) && userRole && !isStaff(userRole)) {
        return ROUTES.HOME;
    }

    return null;
}
