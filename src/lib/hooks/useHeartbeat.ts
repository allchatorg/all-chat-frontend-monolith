import {useEffect, useRef} from "react";
import {useSelector} from "react-redux";
import {selectUser} from "@/redux/user/userSelectors";
import {selectSelectedChatRoomState} from "@/redux/chatRoom/chatRoomSelectors";
import {sendHeartbeat} from "@/api/chatRoom/chatRoomInteractionAPI";

const HEARTBEAT_INTERVAL_MS = 15_000;

export function useHeartbeat() {
    const user = useSelector(selectUser);
    const chatRoom = useSelector(selectSelectedChatRoomState);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const activeRoomIdRef = useRef<number | null>(null);

    useEffect(() => {
        activeRoomIdRef.current = chatRoom?.id ?? null;
    }, [chatRoom?.id]);

    useEffect(() => {
        if (!user?.id) return;

        const fire = () => {
            sendHeartbeat(activeRoomIdRef.current).catch((err) =>
                console.warn("[Heartbeat] Failed to send:", err)
            );
        };

        // Send immediately on mount / reconnect
        fire();

        const startInterval = () => {
            stopInterval();
            intervalRef.current = setInterval(fire, HEARTBEAT_INTERVAL_MS);
        };

        const stopInterval = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fire(); // immediate heartbeat when tab becomes visible
                startInterval();
            } else {
                stopInterval();
            }
        };

        startInterval();

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            stopInterval();
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [user?.id]);
}
