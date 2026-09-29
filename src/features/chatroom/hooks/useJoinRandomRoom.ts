import {useCallback, useRef} from "react";
import {toast} from "sonner";
import {useThunk} from "@/lib/hooks/useThunk";
import {joinRandomAndSelectChatRoomThunk} from "@/redux/chatRoom/chatRoomThunk";

export const useJoinRandomRoom = () => {
    const [runJoinRandomChatRoom, joinRandomRoomIsLoading] = useThunk(joinRandomAndSelectChatRoomThunk);
    const inFlightRequest = useRef<ReturnType<typeof runJoinRandomChatRoom> | null>(null);

    const handleJoinRandomRoom = useCallback(() => {
        if (inFlightRequest.current) return inFlightRequest.current;

        const request = runJoinRandomChatRoom()
            .then((joinedRoom) => {
                toast.success(`Joined ${joinedRoom.chatRoomName}`);
                return joinedRoom;
            })
            .catch((err) => {
                toast.error(err?.message || "Failed to join a random chatroom.");
                throw err;
            })
            .finally(() => {
                inFlightRequest.current = null;
            });

        inFlightRequest.current = request;
        return request;
    }, [runJoinRandomChatRoom]);

    return {handleJoinRandomRoom, joinRandomRoomIsLoading};
};
