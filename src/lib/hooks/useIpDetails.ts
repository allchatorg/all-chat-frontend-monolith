import {useDispatch, useSelector} from "react-redux";
import {useCallback, useEffect} from "react";
import {pingServerThunk} from "@/redux/auth/authThunk";
import {selectIpDetails, selectPingError, selectPingLoading} from "@/redux/auth/authSelectors";
import {IpDetails} from "@/models/IpDetails";
import {AppDispatch, RootState} from '@/redux/store';
import {ApiError} from '@/models/ApiError';

interface UseIpDetailsReturn {
    ipDetails: IpDetails | null;
    isLoading: boolean;
    error: string | null;
    errorDetails: ApiError | null;
    retry: () => Promise<void>;
}

export const useIpDetails = (): UseIpDetailsReturn => {
    const ipDetails = useSelector(selectIpDetails);
    const pingLoading = useSelector(selectPingLoading);
    // Read the error from the store, not from useThunk's local state: when the
    // thunk's condition cancels a dispatch (already loading / already resolved),
    // unwrap() rejects with a ConditionError that is not a real failure.
    const pingError = useSelector(selectPingError);
    const dispatch = useDispatch<AppDispatch>();
    const errorDetails = useSelector((state: RootState) => state.auth.pingErrorDetails);
    const retry = useCallback(async () => {
        await dispatch(pingServerThunk({force: true}));
    }, [dispatch]);

    useEffect(() => {
        if (pingLoading || ipDetails || pingError) return;
        void dispatch(pingServerThunk());
    }, [dispatch, pingLoading, ipDetails, pingError]);

    return {
        ipDetails,
        isLoading: pingLoading,
        error: pingError,
        errorDetails,
        retry,
    };
};
