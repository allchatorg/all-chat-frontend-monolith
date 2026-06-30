import {useSelector} from "react-redux";
import {useEffect} from "react";
import {useThunk} from "@/lib/hooks/useThunk";
import {pingServerThunk} from "@/redux/auth/authThunk";
import {selectIpDetails, selectPingLoading} from "@/redux/auth/authSelectors";
import {IpDetails} from "@/models/IpDetails";

interface UseIpDetailsReturn {
    ipDetails: IpDetails | null;
    isLoading: boolean;
    error: string | null;
}

export const useIpDetails = (): UseIpDetailsReturn => {
    const ipDetails = useSelector(selectIpDetails);
    const pingLoading = useSelector(selectPingLoading);
    const [runPingServer, , error] = useThunk(pingServerThunk);

    useEffect(() => {
        if (pingLoading) return;
        runPingServer();
    }, [runPingServer]);

    return {
        ipDetails,
        isLoading: pingLoading,
        error: error ? error.toString() : null,
    };
};
