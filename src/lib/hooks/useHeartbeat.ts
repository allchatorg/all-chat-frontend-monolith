import {useEffect, useRef} from "react";
import {useSelector} from "react-redux";
import {selectUser} from "@/redux/user/userSelectors";
import {selectSelectedChatRoomState} from "@/redux/chatRoom/chatRoomSelectors";
import {sendHeartbeat} from "@/api/chatRoom/chatRoomInteractionAPI";
import {getRoleLevel, Role} from "@/models/Role";
import {startWorkerInterval} from "@/lib/workerInterval";

const HEARTBEAT_INTERVAL_MS = 15_000;

export function useHeartbeat() {
    const user = useSelector(selectUser);
    const chatRoom = useSelector(selectSelectedChatRoomState);
    const stopIntervalRef = useRef<(() => void) | null>(null);
    const activeRoomIdRef = useRef<number | null>(null);

    useEffect(() => {
        activeRoomIdRef.current = chatRoom?.id ?? null;
    }, [chatRoom?.id]);

    useEffect(() => {
        if (!user?.id) return;

        // Messaging locks site-wide when no staff member is online, so staff stay online with the
        // tab in the background. No room is sent then, which keeps them out of the "active" counts.
        const staysOnlineInBackground = getRoleLevel(user.role) >= getRoleLevel(Role.MODERATOR);

        const fire = () => {
            const activeRoomId = document.visibilityState === "visible" ? activeRoomIdRef.current : null;
            sendHeartbeat(activeRoomId).catch((err) =>
                console.warn("[Heartbeat] Failed to send:", err)
            );
        };

        // Send immediately on mount / reconnect
        fire();

        const startInterval = () => {
            stopInterval();
            stopIntervalRef.current = startWorkerInterval(fire, HEARTBEAT_INTERVAL_MS);
        };

        const stopInterval = () => {
            stopIntervalRef.current?.();
            stopIntervalRef.current = null;
        };

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fire(); // immediate heartbeat when tab becomes visible
                startInterval();
            } else if (staysOnlineInBackground) {
                fire();
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
    }, [user?.id, user?.role]);
}
