import {useSelector} from "react-redux";
import {useEffect} from "react";
import {useThunk} from "@/lib/hooks/useThunk";
import {pingServerThunk} from "@/redux/auth/authThunk";
import {selectIpDetails, selectPingError, selectPingLoading} from "@/redux/auth/authSelectors";
import {IpDetails} from "@/models/IpDetails";

interface UseIpDetailsReturn {
    ipDetails: IpDetails | null;
    isLoading: boolean;
    error: string | null;
}

export const useIpDetails = (): UseIpDetailsReturn => {
    const ipDetails = useSelector(selectIpDetails);
    const pingLoading = useSelector(selectPingLoading);
    // Read the error from the store, not from useThunk's local state: when the
    // thunk's condition cancels a dispatch (already loading / already resolved),
    // unwrap() rejects with a ConditionError that is not a real failure.
    const pingError = useSelector(selectPingError);
    const [runPingServer] = useThunk(pingServerThunk);

    useEffect(() => {
        if (pingLoading || ipDetails || pingError) return;
        runPingServer().catch(() => {
            // Outcome is tracked in the auth slice (ipDetails / pingError).
        });
    }, [runPingServer, pingLoading, ipDetails, pingError]);

    return {
        ipDetails,
        isLoading: pingLoading,
        error: pingError,
    };
};
