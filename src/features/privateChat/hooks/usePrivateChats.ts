import {useCallback, useEffect, useRef} from "react";
import {useDispatch, useSelector} from "react-redux";
import {useRouter} from "next/navigation";
import {toast} from "sonner";
import {AppDispatch} from "@/redux/store";
import {User} from "@/models/User";
import {PrivateChatDTO} from "@/models/PrivateChatDTO";
import {ChatRoom} from "@/models/ChatRoom";
import {
    closePrivateChatTabThunk,
    fetchPrivateChatsThunk,
    handlePrivateChatReconnectionThunk,
    hidePrivateChatThunk,
    openOrCreateAndSelectPrivateChatThunk,
    resolveSelectedPrivateChatThunk,
    selectAndLoadPrivateChatThunk,
} from "@/redux/privateChat/privateChatThunk";
import {
    selectPrivateConversations,
    selectPrivateConversationsLoading,
    selectPrivateCreateOrOpenLoading,
    selectPrivateHideChatLoading,
    selectPrivateSelectedChatLoading,
    selectSelectedPrivateChatId,
    selectSelectedPrivateChatRoom,
    selectSelectedPrivateConversation,
} from "@/redux/privateChat/privateChatSelectors";
import {selectStompReconnected} from "@/redux/chatRoom/chatRoomSelectors";
import {useConnection} from "@/lib/hooks/useConnection";
import {fetchMe} from "@/redux/user/usersThunk";
import {ROUTES} from "@/routes";

export interface UsePrivateChats {
    conversations: PrivateChatDTO[];
    conversationsLoading: boolean;

    selectedConversation: PrivateChatDTO | null;
    selectedChatId: number | null;
    selectedChatRoom: ChatRoom | null;
    selectedChatLoading: boolean;

    createOrOpenLoading: boolean;
    hideChatLoading: boolean;

    handleSelectChat: (conversation: PrivateChatDTO) => void;
    handleStartChatWithUser: (userId: number) => Promise<PrivateChatDTO | undefined>;
    handleHideChat: (roomId: number) => Promise<void>;
    handleCloseTab: (roomId: number) => void;
}

export const usePrivateChats = (user: User | null, urlRoomId?: number): UsePrivateChats => {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const handleClaimRevoked = useCallback(async () => {
        try {
            const fresh = await dispatch(fetchMe()).unwrap();
            if (!fresh.claimed) {
                toast.error("Private messaging is no longer available for your account.");
                router.replace(ROUTES.HOME);
            }
        } catch {
            router.replace(ROUTES.HOME);
        }
    }, [dispatch, router]);

    const conversations = useSelector(selectPrivateConversations);
    const conversationsLoading = useSelector(selectPrivateConversationsLoading);
    const selectedChatId = useSelector(selectSelectedPrivateChatId);
    const selectedConversation = useSelector(selectSelectedPrivateConversation);
    const selectedChatRoom = useSelector(selectSelectedPrivateChatRoom);
    const selectedChatLoading = useSelector(selectPrivateSelectedChatLoading);
    const createOrOpenLoading = useSelector(selectPrivateCreateOrOpenLoading);
    const hideChatLoading = useSelector(selectPrivateHideChatLoading);
    const stompReconnected = useSelector(selectStompReconnected);

    const {justReconnected} = useConnection();

    const initialFetchRef = useRef(false);
    const resolvedUrlRoomRef = useRef<number | undefined>(undefined);

    // 1) Initial fetch of conversations once per claimed user
    useEffect(() => {
        if (!user || !user.claimed) return;
        if (initialFetchRef.current) return;

        initialFetchRef.current = true;
        dispatch(fetchPrivateChatsThunk())
            .unwrap()
            .catch((err: any) => {
                if (err?.status === 403) {
                    void handleClaimRevoked();
                }
            });
    }, [user?.id, user?.claimed, dispatch, handleClaimRevoked]);

    // 2) Reconnection
    useEffect(() => {
        if (!user || !user.claimed) return;
        if (justReconnected || stompReconnected) {
            dispatch(handlePrivateChatReconnectionThunk());
        }
    }, [justReconnected, stompReconnected, user, dispatch]);

    // 3) URL/state resolution — runs once per urlRoomId value, and after conversations load
    useEffect(() => {
        if (!user || !user.claimed) return;

        if (urlRoomId && resolvedUrlRoomRef.current === urlRoomId) return;
        if (urlRoomId) {
            resolvedUrlRoomRef.current = urlRoomId;
        }

        // Wait until the initial list has loaded before resolving the URL,
        // otherwise we'd hit the openPrivateChat fallback even for known rooms.
        if (conversationsLoading) return;

        dispatch(resolveSelectedPrivateChatThunk({urlRoomId}));
    }, [user?.id, user?.claimed, urlRoomId, conversationsLoading, dispatch]);

    const handleSelectChat = useCallback((conversation: PrivateChatDTO) => {
        if (!conversation) return;
        if (selectedChatId === conversation.id) return;
        dispatch(selectAndLoadPrivateChatThunk(conversation.id));
    }, [dispatch, selectedChatId]);

    const handleStartChatWithUser = useCallback(async (userId: number) => {
        try {
            return await dispatch(openOrCreateAndSelectPrivateChatThunk(userId)).unwrap();
        } catch (err: any) {
            if (err?.status === 403) {
                void handleClaimRevoked();
            } else if (err?.status === 400) {
                toast.error(err?.message || "User not available.");
            } else {
                toast.error(err?.message || "Failed to open conversation.");
            }
            return undefined;
        }
    }, [dispatch, handleClaimRevoked]);

    const handleHideChat = useCallback(async (roomId: number) => {
        try {
            await dispatch(hidePrivateChatThunk(roomId)).unwrap();
        } catch (err: any) {
            if (err?.status === 403) {
                void handleClaimRevoked();
            } else {
                toast.error(err?.message || "Failed to hide conversation.");
            }
        }
    }, [dispatch, handleClaimRevoked]);

    const handleCloseTab = useCallback((roomId: number) => {
        void dispatch(closePrivateChatTabThunk(roomId));
    }, [dispatch]);

    return {
        conversations,
        conversationsLoading,

        selectedConversation,
        selectedChatId,
        selectedChatRoom,
        selectedChatLoading,

        createOrOpenLoading,
        hideChatLoading,

        handleSelectChat,
        handleStartChatWithUser,
        handleHideChat,
        handleCloseTab,
    };
};
