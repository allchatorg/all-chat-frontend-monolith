import {useCallback, useEffect, useMemo} from "react";
import {useDispatch, useSelector} from "react-redux";
import {User} from "@/models/User";
import {Message} from "@/models/message";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {getUserAdminDetailsThunk, getUserMessagesThunk} from "@/redux/modPanel/modPanelThunk";
import {
    selectModPanelChatRoomMessages,
    selectModPanelLoadedUser,
    selectModPanelUserError,
    selectModPanelUserInfo,
    selectModPanelUserLoading
} from "@/redux/modPanel/modPanelSelector";
import {selectSelectedChatRoomState} from "@/redux/chatRoom/chatRoomSelectors";
import {useThunk} from "@/lib/hooks/useThunk";
import {AppDispatch} from "@/redux/store";
import {useRoleAccess} from "@/lib/hooks/useRoleAccess";

const PAGE_SIZE = 10;

interface UseModPanelHook {
    selectedUserId: number | null;
    selectedUser: User | null;
    chatRoomMessages: PaginatedResponse<Message>;
    loading: boolean;
    membershipLoading: boolean;
    membershipError: boolean;
    error: unknown | null;
    refreshMembership: () => Promise<void>;
    refreshData: () => Promise<void>;
}

export const useModPanelHook = (isOpen = true): UseModPanelHook => {
    const dispatch = useDispatch<AppDispatch>();
    const isStaff = useRoleAccess().isStaffMember();
    const selectedUserInfo = useSelector(selectModPanelUserInfo);
    const chatRoomMessages = useSelector(selectModPanelChatRoomMessages);

    const loadedUser = useSelector(selectModPanelLoadedUser);
    const userDetailsLoading = useSelector(selectModPanelUserLoading);
    const userDetailsError = useSelector(selectModPanelUserError);

    const selectedChatRoom = useSelector(selectSelectedChatRoomState);

    const [fetchMessages, messagesLoading, messagesError] = useThunk(getUserMessagesThunk);

    const loading = useMemo(() => userDetailsLoading || messagesLoading, [userDetailsLoading, messagesLoading]);
    const error = useMemo(() => userDetailsError || messagesError, [userDetailsError, messagesError]);

    const userId = selectedUserInfo.selectedUserId;
    const username = selectedUserInfo.selectedUserName;
    const chatRoomId = selectedChatRoom?.id;

    const refreshMembership = useCallback(async (): Promise<void> => {
        if (isOpen && isStaff && userId) await dispatch(getUserAdminDetailsThunk(userId));
    }, [dispatch, isOpen, isStaff, userId]);

    const refreshMessages = useCallback(async (): Promise<void> => {
        if (!isOpen || !isStaff || !userId || !username || !chatRoomId) return;
        await fetchMessages({
            chatRoomId,
            senderUsername: username,
            content: "",
            page: 0,
            size: PAGE_SIZE,
        });
    }, [isOpen, isStaff, userId, username, chatRoomId, fetchMessages]);

    const refreshData = useCallback(async (): Promise<void> => {
        await Promise.all([refreshMembership(), refreshMessages()]);
    }, [refreshMembership, refreshMessages]);

    useEffect(() => {
        if (!isOpen || !isStaff || !userId) return;
        const refresh = () => { void refreshMembership(); };
        refresh();
        window.addEventListener("focus", refresh);
        return () => window.removeEventListener("focus", refresh);
    }, [isOpen, isStaff, userId, selectedUserInfo, refreshMembership]);

    useEffect(() => {
        void refreshMessages().catch(() => { /* Reported through messagesError. */ });
    }, [selectedUserInfo, refreshMessages]);

    return {
        selectedUserId: selectedUserInfo?.selectedUserId ?? null,
        selectedUser: isStaff ? loadedUser : null,
        chatRoomMessages,
        loading,
        membershipLoading: userDetailsLoading || (isOpen && isStaff && !!userId && !loadedUser && !userDetailsError),
        membershipError: userDetailsError,
        error,
        refreshMembership,
        refreshData,
    };
};
