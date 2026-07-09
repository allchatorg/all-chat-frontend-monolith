import {User} from "@/models/User";
import {useSelector} from "react-redux";
import {selectIsUserLoading, selectUser} from "@/redux/user/userSelectors";
import {useThunk} from "@/lib/hooks/useThunk";
import {fetchMe} from "@/redux/user/usersThunk";
import {useEffect, useState} from "react";
import {getHasAccount, getSessionToken, removeSessionToken} from "@/lib/tokenManager";
import {registerGuestThunk} from "@/redux/auth/authThunk";
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
            if (userIsLoading || registerGuestIsLoading || ipDetailsLoading || (ipDetails === null && !ipDetailsError)) return;

            if (!hasToken) {
                if (!hasAccount && !flaggedIp) {
                    await registerGuest();
                }
                setIsInitializing(false);
                return;
            }

            if (!user) {
                await runFetchMe();
            }
        };

        initUser();
    }, [user, userIsLoading, registerGuestIsLoading, runFetchMe, registerGuest, ipDetails, ipDetailsLoading, ipDetailsError]);

    useEffect(() => {
        if (user || error) {
            setIsInitializing(false);
        }
    }, [user, error]);

    useEffect(() => {
        if (error) {
            removeSessionToken();
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