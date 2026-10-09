"use client";

import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";

/** A participation restriction must never disable reading, media, or reporting. */
export function useRoomParticipation(roomId?: number, vipOnly?: boolean) {
    return useSelector((state: RootState) => {
        const mode = vipOnly ?? state.chatRoom.loadedChatRooms.find(room => room.id === roomId)?.vipOnly
            ?? state.chatRoom.joinedUserChatRooms.find(room => room.chatRoomId === roomId)?.vipOnly;
        return Boolean(mode && !state.user.user?.vipActive);
    });
}
