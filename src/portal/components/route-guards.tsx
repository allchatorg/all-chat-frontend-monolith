"use client";

import {useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useAppSelector} from '@ads/store/hooks';
import {selectCurrentToken, selectIsAdmin, selectIsAuthenticated} from '@ads/store/slices/authSlice';
import {selectIsUserLoading} from '@/redux/user/userSelectors';

interface UseAuthReturn {
    isAuthenticated: boolean;
    isAdmin: boolean;
    isLoading: boolean;
    token: string | null;
}

/**
 * Auth state for the merged monolith, sourced from the shared chat session.
 * "Loading" stays true while a session token exists but the current user has
 * not yet been hydrated into the store, so guards don't redirect prematurely.
 */
export function useAuth(): UseAuthReturn {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isAdminUser = useAppSelector(selectIsAdmin);
    const token = useAppSelector(selectCurrentToken);
    const userLoading = useAppSelector(selectIsUserLoading);

    const isLoading = userLoading || (!!token && !isAuthenticated);

    return {
        isAuthenticated,
        isAdmin: isAdminUser,
        isLoading,
        token,
    };
}

interface RouteGuardProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    redirectTo?: string;
}

/**
 * Component to protect routes that require authentication
 */
export function ProtectedRoute({children, fallback = null}: RouteGuardProps) {
    const router = useRouter();
    const {isAuthenticated, isLoading} = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/auth?view=login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading) {
        return <>{fallback}</>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}

/**
 * Component to protect admin-only routes
 */
export function AdminRoute({children, fallback = null}: RouteGuardProps) {
    const router = useRouter();
    const {isAuthenticated, isAdmin, isLoading} = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.replace('/auth?view=login');
            } else if (!isAdmin) {
                router.replace('/portal/dashboard');
            }
        }
    }, [isAuthenticated, isAdmin, isLoading, router]);

    if (isLoading) {
        return <>{fallback}</>;
    }

    if (!isAuthenticated || !isAdmin) {
        return null;
    }

    return <>{children}</>;
}

/**
 * Component to protect auth routes (login, register)
 * Redirects to dashboard if user is already authenticated
 */
export function AuthRoute({children, fallback = null, redirectTo}: RouteGuardProps) {
    const router = useRouter();
    const {isAuthenticated, isAdmin, isLoading} = useAuth();

    const HOME_ROUTE = isAdmin ? '/portal/admin/dashboard' : (redirectTo ?? '/portal/dashboard');

    useEffect(() => {
        if (!isLoading && isAuthenticated) {

            router.replace(HOME_ROUTE);
        }
    }, [isAuthenticated, isLoading, router, HOME_ROUTE]);

    if (isLoading) {
        return <>{fallback}</>;
    }

    if (isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
