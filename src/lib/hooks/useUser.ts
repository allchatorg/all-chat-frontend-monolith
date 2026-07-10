import {User} from "@/models/User";
import {useSelector} from "react-redux";
import {selectIsUserLoading, selectUser} from "@/redux/user/userSelectors";
import {useThunk} from "@/lib/hooks/useThunk";
import {fetchMe} from "@/redux/user/usersThunk";
import {useEffect, useState} from "react";
import {getHasAccount, getSessionToken, removeSessionToken} from "@/lib/tokenManager";
import {registerGuestThunk} from "@/redux/auth/authThunk";
import {selectIsAuthLoading} from "@/redux/auth/authSelectors";
import {useIpDetails} from "@/lib/hooks/useIpDetails";

interface UseUserReturn {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    isInitializing: boolean;
}

export const useUser = (): UseUserReturn => {
    const user = useSelector(selectUser);
    const userIsLoading = useSelector(selectIsUserLoading);
    // registerGuestThunk sets auth.loading, so waiting on it serializes the
    // useUser mounts (AuthGuard + AppInitializer) — without it both can fire
    // their own register-guest before either sees the other's result.
    const authIsLoading = useSelector(selectIsAuthLoading);
    const [isInitializing, setIsInitializing] = useState(true);

    const {ipDetails, isLoading: ipDetailsLoading, error: ipDetailsError} = useIpDetails();

    const flaggedIp = ipDetails && (ipDetails.requiredVerification !== 'NONE');

    const [runFetchMe, loading, error] = useThunk(fetchMe);
    const [registerGuest, registerGuestIsLoading, registerGuestError] = useThunk(registerGuestThunk);

    useEffect(() => {
        const initUser = async () => {
            const hasToken = getSessionToken();
            const hasAccount = getHasAccount();
            // Don't wait on ipDetails forever if the ping call failed (e.g. it was
            // rejected with a ban 403) — proceed so the session can still hydrate.
            if (userIsLoading || authIsLoading || registerGuestIsLoading || ipDetailsLoading || (ipDetails === null && !ipDetailsError)) return;

            if (!hasToken) {
                // Attempt guest registration at most once: without the error
                // guard, a failed attempt (server down) re-runs this effect via
                // the registerGuestIsLoading toggle and loops forever.
                if (!hasAccount && !flaggedIp && !registerGuestError) {
                    try {
                        await registerGuest();
                    } catch {
                        // Recorded by useThunk as registerGuestError.
                    }
                }
                setIsInitializing(false);
                return;
            }

            // The !error guard stops a second fetchMe from firing in the render
            // before the error-effect below has removed the stale token.
            if (!user && !error) {
                try {
                    await runFetchMe();
                } catch {
                    // Recorded by useThunk as error.
                }
            }
        };

        void initUser();
    }, [user, userIsLoading, authIsLoading, registerGuestIsLoading, runFetchMe, registerGuest, ipDetails, ipDetailsLoading, ipDetailsError, error, registerGuestError, flaggedIp]);

    useEffect(() => {
        if (user || error) {
            setIsInitializing(false);
        }
    }, [user, error]);

    useEffect(() => {
        if (error) {
            removeSessionToken();
        }
        if (error || registerGuestError) {
            setIsInitializing(false);
        }
    }, [error, registerGuestError]);

    return {
        user,
        isLoading: userIsLoading || loading,
        error: error ? error.toString() : null,
        isInitializing
    };
}
