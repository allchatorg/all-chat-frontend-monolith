import {createAsyncThunk} from "@reduxjs/toolkit";

import {ChatRoom} from "@/models/ChatRoom";
import {UserChatRoom} from "@/models/UserChatRoom";
import {CreateChatRoomRequest} from "@/models/CreateChatRoomRequest";
import {
    createAndJoinChatRoom,
    deleteReaction,
    getAllUserChatRooms,
    getChatRoomDetails,
    getChatRoomMessages,
    getReactionsByEmoji,
    getTopOnlineRoomsPaginated,
    getTopReactedMessages,
    joinChatRoom,
    joinRandomChatRoom,
    leaveChatRoom,
    reactToMessage,
    reportMessage,
    searchChatRoomMessages,
    searchChatRoomsByName,
    setActiveChatRoom,
    updateLastReadMessage
} from "@/api/chatRoom/chatRoomInteractionAPI";
import {RootState} from "@/redux/store";
import {RoomPopulation} from "@/models/roomPopulation";
import {MessagePage} from "@/models/MessagePage";
import {FetchMessagesParams} from "@/models/fetchMessagesParams";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {Message} from "@/models/message";
import {SearchMessageRequest} from "@/models/SearchMessageRequest";
import {CreateMessageRequest} from "@/models/CreateMessageRequest";
import {deleteMessage, editMessage, getMessageHistory, saveAndBroadcastMessage} from "@/api/chatting/chattingAPI";
import {ReportRequest} from "@/models/ReportRequest";
import {Reaction} from "@/models/Reaction";
import {ReactionRequest} from "@/models/ReactionRequest";
import {
    removeStaleChatRoomId,
    resetChatRoomUiStateOnRoomChange,
    setEditingMessage
} from "@/redux/chatRoom/chatRoomUiSlice";
import {EditMessageRequest} from "@/models/EditMessageRequest";
import {
    selectChatRoomsTopMostVisibleMessageId,
    selectLoadedChatRooms,
    selectSelectedChatRoomState,
    selectSelectedUserChatRoomState,
    selectStaleChatRoomIds
} from "@/redux/chatRoom/chatRoomSelectors";
import {removeLoadedChatRoom, setSelectedChatRoom, setSelectedUserChatRoom} from "@/redux/chatRoom/chatRoomSlice";
import {archiveChatRoom, unarchiveChatRoom} from "@/api/admin/adminAPI";

export const fetchJoinedUserChatRoomsThunk = createAsyncThunk<UserChatRoom[], void, { state: RootState }>(
    "chat/fetchJoinedUserChatRooms",
    async (_, {rejectWithValue}) => {
        try {
            return await getAllUserChatRooms();
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    },
    {
        condition: (_, {getState}) => {
            const state = getState();
            return !state.chatRoom.joinedChatRoomsLoading
        }
    }
);

export const createChatRoomThunk = createAsyncThunk<UserChatRoom, CreateChatRoomRequest>(
    "chat/createChatRoom",
    async (data, {rejectWithValue}) => {
        try {
            return await createAndJoinChatRoom(data);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const archiveChatRoomThunk = createAsyncThunk<number, number>(
    "chat/archiveChatRoom",
    async (roomId, {rejectWithValue}) => {
        try {
            await archiveChatRoom(roomId);
            return roomId;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const unarchiveChatRoomThunk = createAsyncThunk<number, number>(
    "chat/unarchiveChatRoom",
    async (roomId, {rejectWithValue}) => {
        try {
            await unarchiveChatRoom(roomId);
            return roomId;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const fetchChatRoomDetailsThunk = createAsyncThunk<ChatRoom, number, { state: RootState }>(
    "chat/fetchChatRoomDetails",
    async (roomId, {rejectWithValue}) => {
        try {
            return await getChatRoomDetails(roomId);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    },
    {
        condition: (_, {getState}) => {
            const state = getState();
            return !state.chatRoom.chatRoomDetailsLoading;
        }
    }
);

export const joinChatRoomThunk = createAsyncThunk<UserChatRoom, number, { state: RootState }>(
    "chat/joinChatRoom",
    async (roomId, {getState, rejectWithValue}) => {
        try {
            return joinChatRoom(roomId);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const joinRandomChatRoomThunk = createAsyncThunk<UserChatRoom, void, { state: RootState }>(
    "chat/joinRandomChatRoom",
    async (_, {rejectWithValue}) => {
        try {
            return joinRandomChatRoom();
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const leaveChatRoomThunk = createAsyncThunk<number, number, { state: RootState }>(
    "chat/leaveChatRoom",
    async (roomId, {getState, rejectWithValue}) => {
        try {
            await leaveChatRoom(roomId);
            return roomId;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const searchChatRoomsByNameThunk = createAsyncThunk<RoomPopulation[], string>(
    "chat/searchChatRoomsByName",
    async (name, {rejectWithValue}) => {
        try {
            return await searchChatRoomsByName(name);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const fetchChatRoomMessagesThunk = createAsyncThunk<
    MessagePage,
    FetchMessagesParams,
    { rejectValue: any }
>(
    "chat/fetchChatRoomMessages",
    async ({roomId, afterMessageId, beforeMessageId, aroundMessageId}, {rejectWithValue}) => {
        try {
            return await getChatRoomMessages(roomId, afterMessageId, beforeMessageId, aroundMessageId);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const searchChatRoomMessagesThunk = createAsyncThunk<
    PaginatedResponse<Message>,
    { roomId: number; request: SearchMessageRequest },
    { rejectValue: any }
>(
    "chat/searchChatRoomMessages",
    async ({roomId, request}, {rejectWithValue}) => {
        try {
            return await searchChatRoomMessages(roomId, request);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const updateLastReadMessageThunk = createAsyncThunk<Message, { roomId: number; messageId: number }>(
    "chat/updateLastReadMessage",
    async ({roomId, messageId}, {rejectWithValue}) => {
        try {
            return await updateLastReadMessage(roomId, messageId);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const saveAndBroadcastMessageThunk = createAsyncThunk<Message, CreateMessageRequest>(
    "chat/saveAndBroadcastMessageThunk",
    async (message, {rejectWithValue}) => {
        try {
            return await saveAndBroadcastMessage(message);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const deleteMessageThunk = createAsyncThunk<void, number>(
    "chat/deleteMessage",
    async (messageId, {rejectWithValue}) => {
        try {
            deleteMessage(messageId);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const reportMessageThunk = createAsyncThunk<void, ReportRequest>(
    "chat/reportMessage",
    async (reportRequest, {rejectWithValue}) => {
        try {
            reportMessage(reportRequest)
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const fetchMessageReactionDetailsThunk = createAsyncThunk<
    Reaction,
    { messageId: number; emoji: string; limit?: number }
>(
    "chat/fetchMessageReaction",
    async ({messageId, emoji, limit}, {rejectWithValue}) => {
        try {
            return await getReactionsByEmoji(messageId, emoji, limit);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const reactToMessageThunk = createAsyncThunk<void, ReactionRequest>(
    "chat/reactToMessage",
    async (request, {rejectWithValue}) => {
        try {
            await reactToMessage(request);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const deleteReactionThunk = createAsyncThunk<void, ReactionRequest>(
    "chat/deleteReaction",
    async (request, {rejectWithValue}) => {
        try {
            await deleteReaction(request);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const setActiveChatRoomThunk = createAsyncThunk<RoomPopulation, {
    currentRoomId: number;
    previousActiveRoomId?: number
}>(
    "chat/setActiveChatRoom",
    async ({currentRoomId, previousActiveRoomId}, {rejectWithValue}) => {
        try {
            return await setActiveChatRoom(currentRoomId, previousActiveRoomId);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const fetchTopOnlineRoomsPaginatedThunk = createAsyncThunk<
    PaginatedResponse<RoomPopulation>,
    { page?: number; pageSize?: number; popularitySort?: string; chatRoomNoiseLevel?: string }>(
    "chat/fetchTopOnlineRoomsPaginated",
    async ({page = 0, pageSize = 2, popularitySort, chatRoomNoiseLevel} = {}, {rejectWithValue}) => {
        try {
            return await getTopOnlineRoomsPaginated(page, pageSize, popularitySort, chatRoomNoiseLevel);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const fetchTopReactedMessagesThunk = createAsyncThunk<
    PaginatedResponse<Message>,
    { roomId: number; page?: number; size?: number }>(
    "chat/fetchTopReactedMessages",
    async ({roomId, page = 0, size = 10}, {rejectWithValue}) => {
        try {
            return await getTopReactedMessages(roomId, page, size);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const editMessageThunk = createAsyncThunk<Message, {
    messageId: number;
    editMessageRequest: EditMessageRequest
}>(
    "chat/editMessage",
    async ({messageId, editMessageRequest}, {dispatch, rejectWithValue}) => {
        try {
            const updatedMessage = await editMessage(
                messageId,
                editMessageRequest
            );
            dispatch(setEditingMessage(null));

            return updatedMessage;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const fetchMessageHistoryThunk = createAsyncThunk<Message[], number>(
    "chat/fetchMessageHistory",
    async (messageId, {rejectWithValue}) => {
        try {
            return await getMessageHistory(messageId);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// ─── Orchestrating Thunks ────────────────────────────────────────────
// These thunks consolidate multi-step flows that were previously spread
// across multiple useEffect hooks in useChatRooms.ts.  They use
// getState() to read fresh Redux state instead of stale React closures.

/**
 * Helper: given a chatRoomId, either set the selected room from cache
 * or fetch it fresh.  Also handles stale-room refresh.
 */
const loadOrFetchChatRoom = async (
    chatRoomId: number,
    dispatch: any,
    getState: () => RootState
) => {
    dispatch(resetChatRoomUiStateOnRoomChange());

    const state = getState();
    const loadedChatRooms = selectLoadedChatRooms(state);
    const staleChatRoomIds = selectStaleChatRoomIds(state);
    const topmostVisibleMessageIds = selectChatRoomsTopMostVisibleMessageId(state);

    let jumpTargetMessageId: number | undefined = undefined;
    if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('chatRoomId') === chatRoomId.toString() && urlParams.get('jumpTo')) {
            jumpTargetMessageId = Number(urlParams.get('jumpTo'));
        }
    }

    const isLoaded = loadedChatRooms.some(room => room.id === chatRoomId);
    const isStale = staleChatRoomIds.includes(chatRoomId);

    if (isLoaded) {
        if (isStale || jumpTargetMessageId) {
            const fetchAroundId = jumpTargetMessageId || topmostVisibleMessageIds?.[chatRoomId];
            if (fetchAroundId) {
                const loadedRoom = loadedChatRooms.find(room => room.id === chatRoomId);
                if (loadedRoom) {
                    dispatch(setSelectedChatRoom(loadedRoom));
                }
                await dispatch(fetchChatRoomMessagesThunk({
                    roomId: chatRoomId,
                    aroundMessageId: fetchAroundId
                }));
            } else {
                dispatch(removeLoadedChatRoom(chatRoomId));
                await dispatch(fetchChatRoomDetailsThunk(chatRoomId));
            }
            dispatch(removeStaleChatRoomId(chatRoomId));
        } else {
            const loadedRoom = loadedChatRooms.find(room => room.id === chatRoomId);
            if (loadedRoom) {
                dispatch(setSelectedChatRoom(loadedRoom));
            }
        }
    } else {
        await dispatch(fetchChatRoomDetailsThunk(chatRoomId));
    }
};

/**
 * Consolidates room selection with clear priority:
 *  1. URL-specified room (join if needed)
 *  2. Keep current selection if still valid
 *  3. Fall back to first joined room
 *
 * Replaces: URL-navigation effect, "select first room" effect,
 *           and the selectedUserChatRoom-change effect.
 */
export const resolveSelectedRoomThunk = createAsyncThunk<
    void,
    { urlRoomId?: number } | void,
    { state: RootState }
>(
    "chat/resolveSelectedRoom",
    async (params, {getState, dispatch}) => {
        const urlRoomId = params && 'urlRoomId' in params ? params.urlRoomId : undefined;
        const state = getState();
        const rooms = state.chatRoom.joinedUserChatRooms;
        const currentSelected = selectSelectedUserChatRoomState(state);
        const currentChatRoom = selectSelectedChatRoomState(state);

        if (rooms.length === 0) return;

        // Priority 1: URL-specified room
        if (urlRoomId) {
            const existing = rooms.find(r => r.chatRoomId === urlRoomId);
            if (existing) {
                // Already a member — just select it
                if (currentSelected?.id !== existing.id) {
                    dispatch(setSelectedUserChatRoom(existing));
                    await loadOrFetchChatRoom(existing.chatRoomId, dispatch, getState as () => RootState);
                    dispatch(setActiveChatRoomThunk({
                        currentRoomId: existing.chatRoomId,
                        previousActiveRoomId: currentChatRoom?.id
                    }));
                }
            } else {
                // Not a member — join first, then the fulfilled reducer selects it
                await dispatch(joinChatRoomThunk(urlRoomId)).unwrap();
                // After joining, the room is now in state; load its details
                const freshState = getState();
                const joined = freshState.chatRoom.joinedUserChatRooms.find(
                    r => r.chatRoomId === urlRoomId
                );
                if (joined) {
                    await loadOrFetchChatRoom(joined.chatRoomId, dispatch, getState as () => RootState);
                    dispatch(setActiveChatRoomThunk({currentRoomId: joined.chatRoomId}));
                }
            }
            return;
        }

        // Priority 2: Keep current selection if still valid
        if (currentSelected && rooms.some(r => r.id === currentSelected.id)) {
            // If the chat room details haven't been loaded yet, load them
            if (!currentChatRoom || currentChatRoom.id !== currentSelected.chatRoomId) {
                await loadOrFetchChatRoom(currentSelected.chatRoomId, dispatch, getState as () => RootState);
                dispatch(setActiveChatRoomThunk({
                    currentRoomId: currentSelected.chatRoomId,
                    previousActiveRoomId: currentChatRoom?.id
                }));
            }
            return;
        }

        // Priority 3: Select first room
        const firstRoom = rooms[0];
        dispatch(setSelectedUserChatRoom(firstRoom));
        await loadOrFetchChatRoom(firstRoom.chatRoomId, dispatch, getState as () => RootState);
        dispatch(setActiveChatRoomThunk({currentRoomId: firstRoom.chatRoomId}));
    }
);

/**
 * Handles reconnection (browser online event or STOMP reconnect).
 * Reads all state via getState() to avoid stale closures.
 *
 * Replaces: the reconnection useEffect in useChatRooms.ts
 */
export const handleReconnectionThunk = createAsyncThunk<
    void,
    void,
    { state: RootState }
>(
    "chat/handleReconnection",
    async (_, {getState, dispatch}) => {
        // Re-fetch the room list
        await dispatch(fetchJoinedUserChatRoomsThunk());

        const state = getState();
        const chatRoom = selectSelectedChatRoomState(state);

        if (chatRoom) {
            const staleChatRoomIds = selectStaleChatRoomIds(state);
            const isStale = staleChatRoomIds.includes(chatRoom.id);

            if (isStale) {
                const topmostVisibleMessageIds = selectChatRoomsTopMostVisibleMessageId(state);
                const topmostId = topmostVisibleMessageIds?.[chatRoom.id];
                if (topmostId) {
                    await dispatch(fetchChatRoomMessagesThunk({
                        roomId: chatRoom.id,
                        aroundMessageId: topmostId
                    }));
                } else {
                    dispatch(removeLoadedChatRoom(chatRoom.id));
                    await dispatch(fetchChatRoomDetailsThunk(chatRoom.id));
                }
                dispatch(removeStaleChatRoomId(chatRoom.id));
            }

            dispatch(setActiveChatRoomThunk({currentRoomId: chatRoom.id}));
        }
    }
);

/**
 * Handles manual room selection: sets the selected room, loads/fetches
 * its details, and notifies the backend of the active room change.
 *
 * Replaces: handleSelectRoom + the selectedUserChatRoom-change effect
 *           + runFetchOrLoadChatRoomDetails callback
 */
export const selectAndLoadChatRoomThunk = createAsyncThunk<
    void,
    UserChatRoom,
    { state: RootState }
>(
    "chat/selectAndLoadChatRoom",
    async (userChatRoom, {getState, dispatch}) => {
        const state = getState();
        const currentChatRoom = selectSelectedChatRoomState(state);

        dispatch(setSelectedUserChatRoom(userChatRoom));

        if (userChatRoom.chatRoomId === currentChatRoom?.id) {
            return;
        }

        await loadOrFetchChatRoom(userChatRoom.chatRoomId, dispatch, getState as () => RootState);

        dispatch(setActiveChatRoomThunk({
            currentRoomId: userChatRoom.chatRoomId,
            previousActiveRoomId: currentChatRoom?.id
        }));
    }
);

/**
 * Handles joining a room from outside the sidebar (e.g. Popular Rooms).
 * Joins the room, loads its details, and notifies the backend of the
 * active room change so the previous room's active count is decremented.
 */
export const joinAndSelectChatRoomThunk = createAsyncThunk<
    void,
    number,
    { state: RootState }
>(
    "chat/joinAndSelectChatRoom",
    async (chatRoomId, {getState, dispatch}) => {
        const state = getState();
        const currentChatRoom = selectSelectedChatRoomState(state);

        // Join the room (the fulfilled reducer adds it to joinedUserChatRooms
        // and sets selectedUserChatRoom)
        await dispatch(joinChatRoomThunk(chatRoomId)).unwrap();

        // Load room details
        await loadOrFetchChatRoom(chatRoomId, dispatch, getState as () => RootState);

        // Notify backend of the room switch so active counts update
        dispatch(setActiveChatRoomThunk({
            currentRoomId: chatRoomId,
            previousActiveRoomId: currentChatRoom?.id
        }));
    }
);

export const joinRandomAndSelectChatRoomThunk = createAsyncThunk<
    UserChatRoom,
    void,
    { state: RootState }
>(
    "chat/joinRandomAndSelectChatRoom",
    async (_, {getState, dispatch}) => {
        const state = getState();
        const currentChatRoom = selectSelectedChatRoomState(state);

        const joinedRoom = await dispatch(joinRandomChatRoomThunk()).unwrap();

        await loadOrFetchChatRoom(joinedRoom.chatRoomId, dispatch, getState as () => RootState);

        dispatch(setActiveChatRoomThunk({
            currentRoomId: joinedRoom.chatRoomId,
            previousActiveRoomId: currentChatRoom?.id
        }));

        return joinedRoom;
    }
);
