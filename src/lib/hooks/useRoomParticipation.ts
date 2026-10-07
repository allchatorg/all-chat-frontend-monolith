"use client";

import {useSelector} from "react-redux";
import {RootState} from "@/redux/store";

/** A participation restriction must never disable reading, media, or reporting. */
export function useRoomParticipation(roomId?: number, proOnly?: boolean) {
    return useSelector((state: RootState) => {
        const mode = proOnly ?? state.chatRoom.loadedChatRooms.find(room => room.id === roomId)?.proOnly
            ?? state.chatRoom.joinedUserChatRooms.find(room => room.chatRoomId === roomId)?.proOnly;
        return Boolean(mode && !state.user.user?.proActive);
    });
}
