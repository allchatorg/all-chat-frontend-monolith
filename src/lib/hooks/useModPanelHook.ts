import {useEffect, useMemo} from "react";
import {useSelector} from "react-redux";
import {User} from "@/models/User";
import {Message} from "@/models/message";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {getUserAdminDetailsThunk, getUserMessagesThunk} from "@/redux/modPanel/modPanelThunk";
import {
    selectModPanelChatRoomMessages,
    selectModPanelLoadedUser,
    selectModPanelUserInfo
} from "@/redux/modPanel/modPanelSelector";
import {selectSelectedChatRoomState} from "@/redux/chatRoom/chatRoomSelectors";
import {useThunk} from "@/lib/hooks/useThunk";

const PAGE_SIZE = 10;

interface UseModPanelHook {
    selectedUserId: number | null;
    selectedUser: User | null;
    chatRoomMessages: PaginatedResponse<Message>;
    loading: boolean;
    error: unknown | null;
    refreshData: () => Promise<void>;
}

export const useModPanelHook = (): UseModPanelHook => {
    const selectedUserInfo = useSelector(selectModPanelUserInfo);
    const chatRoomMessages = useSelector(selectModPanelChatRoomMessages);

    const loadedUser = useSelector(selectModPanelLoadedUser);

    const selectedChatRoom = useSelector(selectSelectedChatRoomState);

    const [fetchUserDetails, userDetailsLoading, userDetailsError] = useThunk(getUserAdminDetailsThunk);
    const [fetchMessages, messagesLoading, messagesError] = useThunk(getUserMessagesThunk);

    const loading = useMemo(() => userDetailsLoading || messagesLoading, [userDetailsLoading, messagesLoading]);
    const error = useMemo(() => userDetailsError || messagesError, [userDetailsError, messagesError]);

    const refreshData = async (): Promise<void> => {
        if (!selectedUserInfo?.selectedUserId || !selectedUserInfo?.selectedUserName || !selectedChatRoom) return;

        await Promise.all([
            fetchUserDetails(selectedUserInfo.selectedUserId),
            fetchMessages({
                chatRoomId: selectedChatRoom.id,
                senderUsername: selectedUserInfo.selectedUserName,
                content: "",
                page: 0,
                size: PAGE_SIZE,
            }),
        ]);
    };

    useEffect(() => {
        if (selectedUserInfo && selectedChatRoom) {
            refreshData();
        }
    }, [selectedUserInfo, selectedChatRoom]);

    return {
        selectedUserId: selectedUserInfo?.selectedUserId ?? null,
        selectedUser: loadedUser,
        chatRoomMessages,
        loading,
        error,
        refreshData,
    };
};
