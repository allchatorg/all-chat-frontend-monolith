import {User} from '@/models/User';
import {useDispatch, useSelector} from 'react-redux';
import {fetchMe} from '@/redux/user/usersThunk';
import {useCallback, useEffect, useState} from 'react';
import {getHasAccount, getSessionToken} from '@/lib/tokenManager';
import {registerGuestThunk} from '@/redux/auth/authThunk';
import {useIpDetails} from '@/lib/hooks/useIpDetails';
import {AppDispatch, RootState} from '@/redux/store';
import {ApiError} from '@/models/ApiError';
import {normalizeApiError} from '@/lib/apiError';
import {usePathname, useSearchParams} from 'next/navigation';
import {isAuthFlowRoute, isBillingRoute} from '@/routes';

interface UseUserReturn {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    errorDetails: ApiError | null;
    isInitializing: boolean;
    needsRetry: boolean;
    retry: () => Promise<void>;
}

export const useUser = (): UseUserReturn => {
    const dispatch = useDispatch<AppDispatch>();
    const {user, loading, errorDetails} = useSelector((state: RootState) => state.user);
    const authLoading = useSelector((state: RootState) => state.auth.loading);
    const [isInitializing, setIsInitializing] = useState(true);
    const [guestError, setGuestError] = useState<ApiError | null>(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const allowGuest = !isAuthFlowRoute(pathname) && !isBillingRoute(pathname, searchParams);
    const {ipDetails, isLoading: ipLoading, errorDetails: ipError, error: ipErrorMessage, retry: retryPing} = useIpDetails();

    useEffect(() => {
        if (user || errorDetails || guestError) {
            setIsInitializing(false);
            return;
        }
        if (loading || authLoading) return;

        // Existing sessions hydrate independently of ping. A ping outage is not
        // evidence that the account session is invalid.
        if (getSessionToken()) {
            void dispatch(fetchMe());
            return;
        }

        if (!allowGuest || getHasAccount()) {
            setIsInitializing(false);
            return;
        }
        if (ipLoading || (!ipDetails && !ipErrorMessage)) return;
        if (ipErrorMessage || ipDetails?.requiredVerification !== 'NONE') {
            setIsInitializing(false);
            return;
        }

        void dispatch(registerGuestThunk()).unwrap().catch(error => {
            setGuestError(normalizeApiError(error, 'bootstrap'));
        }).finally(() => setIsInitializing(false));
    }, [dispatch, user, errorDetails, guestError, loading, authLoading, allowGuest, ipLoading, ipDetails, ipErrorMessage]);

    const retry = useCallback(async () => {
        setGuestError(null);
        if (getSessionToken()) {
            await dispatch(fetchMe());
        } else {
            await retryPing();
        }
    }, [dispatch, retryPing]);

    const failure = errorDetails ?? guestError ?? (!user && allowGuest ? ipError : null);
    // A failed profile refresh must retain the token and render recovery, rather
    // than allowing a signed-out guard to redirect or create a new guest.
    const needsRetry = !user && !!failure && !failure.sessionInvalid;

    return {
        user,
        isLoading: loading || authLoading,
        error: failure?.message ?? null,
        errorDetails: failure,
        isInitializing,
        needsRetry,
        retry,
    };
};
