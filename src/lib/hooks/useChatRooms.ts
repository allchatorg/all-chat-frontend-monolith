import {UserChatRoom} from "@/models/UserChatRoom";
import {AppDispatch} from "@/redux/store";
import {useDispatch, useSelector} from "react-redux";
import {useCallback, useEffect, useRef} from "react";
import {useConnection} from "@/lib/hooks/useConnection";
import {
    createChatRoomThunk,
    fetchJoinedUserChatRoomsThunk,
    handleReconnectionThunk,
    joinAndSelectChatRoomThunk,
    joinChatRoomThunk,
    leaveChatRoomThunk,
    resolveSelectedRoomThunk,
    selectAndLoadChatRoomThunk,
} from "@/redux/chatRoom/chatRoomThunk";
import {
    selectChatRoomDetailsLoading,
    selectCreateChatRoomLoading,
    selectJoinChatRoomLoading,
    selectJoinedUserChatIsLoading,
    selectJoinedUserChatRoomsState,
    selectLeaveChatRoomLoading,
    selectSelectedChatRoomState,
    selectSelectedUserChatRoomState,
    selectStompReconnected,
} from "@/redux/chatRoom/chatRoomSelectors";
// @ts-ignore
import {ChatRoom} from "@/models/ChatRoom";
import {CreateChatRoomRequest} from "@/models/CreateChatRoomRequest";
import {User} from "@/models/User";
import {ApiError} from "@/models/ApiError";
import {useThunk} from "@/lib/hooks/useThunk";

interface UseChatRooms {
    userChatRooms: UserChatRoom[];
    loading: boolean;
    error: string | null;

    selectedUserChatRoom: UserChatRoom | null | undefined;
    chatRoom: ChatRoom | null;
    chatRoomLoading: boolean;
    chatRoomError: string | null;

    joinLoading: boolean;
    joinError: string | null;
    leaveLoading: boolean;
    leaveError: string | null;
    createLoading: boolean;
    createError: Error | ApiError | null;

    handleSelectRoom: (userChatRoom: UserChatRoom) => void;
    handleJoinRoom: (chatRoomId: number) => void;
    handleLeaveRoom: (userChatRoomToLeave: UserChatRoom) => void;
    handleCreateRoom: (createChatRoomRequest: CreateChatRoomRequest) => Promise<void>;
}

export const useChatRooms = (user: User | null, chatRoomId?: number): UseChatRooms => {
    const dispatch = useDispatch<AppDispatch>();

    // ── Selectors ──────────────────────────────────────────────────────
    const userChatRooms = useSelector(selectJoinedUserChatRoomsState);
    const userChatRoomsIsLoading = useSelector(selectJoinedUserChatIsLoading);
    const selectedUserChatRoom = useSelector(selectSelectedUserChatRoomState);
    const chatRoom = useSelector(selectSelectedChatRoomState);
    const chatRoomLoading = useSelector(selectChatRoomDetailsLoading);
    const joinLoading = useSelector(selectJoinChatRoomLoading);
    const leaveLoading = useSelector(selectLeaveChatRoomLoading);
    const createLoading = useSelector(selectCreateChatRoomLoading);
    const stompReconnected = useSelector(selectStompReconnected);

    const {justReconnected} = useConnection();

    // useThunk is still used for create/join/leave to get the error state,
    // and for the initial fetch loading/error.
    const [runFetchUserChatRooms, fetchLoading, fetchError] = useThunk(fetchJoinedUserChatRoomsThunk);
    const [runJoinChatRoom, , joinError] = useThunk(joinChatRoomThunk);
    const [runLeaveChatRoom, , leaveError] = useThunk(leaveChatRoomThunk);
    const [runCreateAndJoin, , createError] = useThunk(createChatRoomThunk);

    // Track whether the initial resolve has run for this chatRoomId
    const resolvedUrlRoomRef = useRef<number | undefined>(undefined);

    // ── Effect 1: Initial fetch of joined rooms ──────────────────────
    useEffect(() => {
        if (!!user && !userChatRoomsIsLoading && !userChatRooms.length) {
            runFetchUserChatRooms();
        }
    }, [user?.id, runFetchUserChatRooms]);

    // ── Effect 2: Reconnection ───────────────────────────────────────
    // Just a trigger — all logic lives in the thunk with fresh getState()
    useEffect(() => {
        if (justReconnected || stompReconnected) {
            if (user) {
                dispatch(handleReconnectionThunk());
            }
        }
    }, [justReconnected, stompReconnected, user, dispatch]);

    // ── Effect 3: Resolve selected room ──────────────────────────────
    // Single entry point for URL-nav, first-room selection, and room details loading.
    useEffect(() => {
        if (!user || userChatRooms.length === 0) return;

        // For URL-based room IDs, only resolve once per chatRoomId value
        if (chatRoomId && resolvedUrlRoomRef.current === chatRoomId) return;

        if (chatRoomId) {
            resolvedUrlRoomRef.current = chatRoomId;
        }

        dispatch(resolveSelectedRoomThunk({urlRoomId: chatRoomId}));
    }, [user?.id, userChatRooms.length, chatRoomId, dispatch]);

    // ── Handlers exposed to consumers ────────────────────────────────

    const handleSelectRoom = useCallback((userChatRoom: UserChatRoom) => {
        if (!userChatRoom || !user || userChatRoom.id === selectedUserChatRoom?.id) {
            return;
        }
        dispatch(selectAndLoadChatRoomThunk(userChatRoom));
    }, [user, selectedUserChatRoom?.id, dispatch]);

    const handleJoinRoom = useCallback((chatRoomId: number) => {
        dispatch(joinAndSelectChatRoomThunk(chatRoomId));
    }, [dispatch]);

    const handleLeaveRoom = useCallback((userChatRoomToLeave: UserChatRoom) => {
        runLeaveChatRoom(userChatRoomToLeave.chatRoomId);
    }, [runLeaveChatRoom]);

    const handleCreateRoom = useCallback(async (createChatRoomRequest: CreateChatRoomRequest): Promise<void> => {
        await runCreateAndJoin(createChatRoomRequest);
    }, [runCreateAndJoin]);

    // ── Return ───────────────────────────────────────────────────────

    const formatError = (err: unknown) => (err ? String(err) : null);

    return {
        userChatRooms,
        loading: fetchLoading,
        error: formatError(fetchError),

        selectedUserChatRoom,
        chatRoom,
        chatRoomLoading,
        chatRoomError: null,

        joinLoading,
        joinError: joinError ? joinError.toString() : null,
        leaveLoading,
        leaveError: formatError(leaveError),
        createLoading,
        createError: createError,

        handleSelectRoom,
        handleJoinRoom,
        handleLeaveRoom,
        handleCreateRoom
    };

}