'use client';

import {usePathname, useRouter} from 'next/navigation';
import {useEffect} from 'react';
import {useUser} from "@/lib/hooks/useUser";
import {isAuthFlowRoute, isProtectedRoute, isStaffRoute, ROUTES} from "@/routes";
import {isStaff, Role} from "@/models/Role";
import {Spinner} from './Spinner';
import {useIpDetails} from "@/lib/hooks/useIpDetails";

export default function AuthGuard({children}: { children: React.ReactNode }) {
    const {user, error, isInitializing} = useUser();
    const {ipDetails, isLoading: isIpDetailsLoading} = useIpDetails();
    const pathname = usePathname();
    const router = useRouter();

    const isAuthenticated = !!user;
    const hasFlaggedIp = ipDetails?.requiredVerification !== 'NONE';
    const isGuest = user?.role === Role.GUEST;
    const isVerified = user?.verified === true;

    useEffect(() => {
        if (isInitializing) return;

        const redirectConfig = getRedirectPath({
            isAuthenticated,
            hasFlaggedIp,
            isGuest,
            isVerified,
            pathname,
            userRole: user?.role
        });

        if (redirectConfig) {
            router.push(redirectConfig);
        }
    }, [isInitializing, user, pathname, router, ipDetails]);

    const isLoading = isInitializing || isIpDetailsLoading || (isProtectedRoute(pathname) && !user && !error);

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
                             hasFlaggedIp,
                             isGuest,
                             isVerified,
                             pathname,
                             userRole
                         }: {
    isAuthenticated: boolean;
    hasFlaggedIp: boolean;
    isGuest: boolean;
    isVerified: boolean;
    pathname: string;
    userRole?: Role;
}): string | null {
    // Unauthenticated users
    if (!isAuthenticated) {
        if (isProtectedRoute(pathname)) {
            return ROUTES.REGISTER;
        }
        if (pathname === ROUTES.REGISTER_ANONYMOUS && hasFlaggedIp) {
            return ROUTES.REGISTER;
        }
        return null;
    }

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
        return ROUTES.HOME;
    }

    if (isStaffRoute(pathname) && userRole && !isStaff(userRole)) {
        return ROUTES.HOME;
    }

    return null;
}