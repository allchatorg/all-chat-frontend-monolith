import {ChatRoom} from "@/models/ChatRoom";
import {useThunk} from "@/lib/hooks/useThunk";
import {UserChatRoom} from "@/models/UserChatRoom";
import {updateLastReadMessageThunk} from "@/redux/chatRoom/chatRoomThunk";
import {MutableRefObject} from "react";

export const useLastReadMessage = (
    chatRoom: ChatRoom,
    selectedUserChatRoom: UserChatRoom | null | undefined,
    isLastMessageVisible: MutableRefObject<boolean>
) => {
    const [updateLastReadMessage] = useThunk(updateLastReadMessageThunk);

    const updateLastReadMessageFunc = () => {
        if (!selectedUserChatRoom || !chatRoom) return;

        const lastMessage = [...chatRoom.messages].reverse().find(message => !message.advert);
        if (!lastMessage) return;

        if (!selectedUserChatRoom.lastReadMessage) {
            updateLastReadMessage({
                roomId: chatRoom.id,
                messageId: lastMessage.id,
            });
            return;
        }

        if (selectedUserChatRoom.lastReadMessage.id >= lastMessage.id) return;
        if (!isLastMessageVisible.current || chatRoom.hasNext) return;

        updateLastReadMessage({
            roomId: chatRoom.id,
            messageId: lastMessage.id,
        });
    };

    return {updateLastReadMessageFunc};
};
