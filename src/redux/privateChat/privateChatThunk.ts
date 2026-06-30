import {createAsyncThunk} from "@reduxjs/toolkit";
import {RootState} from "@/redux/store";
import {PrivateChatDTO} from "@/models/PrivateChatDTO";
import {UserMinimalDTO} from "@/models/UserMinimalDTO";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {Message} from "@/models/message";
import {MessagePage} from "@/models/MessagePage";
import {FetchMessagesParams} from "@/models/fetchMessagesParams";
import {SearchMessageRequest} from "@/models/SearchMessageRequest";
import {CreateMessageRequest} from "@/models/CreateMessageRequest";
import {EditMessageRequest} from "@/models/EditMessageRequest";
import {
    hidePrivateChat,
    listPrivateChats,
    openOrCreatePrivateChat,
    openPrivateChat,
    searchUsers,
} from "@/api/privateChat/privateChatAPI";
import {
    getChatRoomMessages,
    searchChatRoomMessages,
    updateLastReadMessage,
} from "@/api/chatRoom/chatRoomInteractionAPI";
import {deleteMessage, editMessage, saveAndBroadcastMessage,} from "@/api/chatting/chattingAPI";
import {
    addOpenPrivateChatTab,
    removeOpenPrivateChatTab,
    removeStalePrivateRoomId,
    setPrivateEditingMessage,
} from "@/redux/privateChat/privateChatUiSlice";
import {removeLoadedPrivateChatRoom, setSelectedPrivateChat,} from "@/redux/privateChat/privateChatSlice";
import {
    selectLoadedPrivateRooms,
    selectOpenPrivateChatTabs,
    selectPrivateConversations,
    selectPrivateStaleRoomIds,
    selectSelectedPrivateChatId,
} from "@/redux/privateChat/privateChatSelectors";

export const fetchPrivateChatsThunk = createAsyncThunk<PrivateChatDTO[], void, { state: RootState }>(
    "privateChat/fetchPrivateChats",
    async (_, {rejectWithValue}) => {
        try {
            return await listPrivateChats();
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    },
    {
        condition: (_, {getState}) => {
            const state = getState();
            return !state.privateChat.conversationsLoading;
        }
    }
);

export const openOrCreatePrivateChatThunk = createAsyncThunk<PrivateChatDTO, number, { state: RootState }>(
    "privateChat/openOrCreate",
    async (otherUserId, {rejectWithValue}) => {
        try {
            return await openOrCreatePrivateChat(otherUserId);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const openPrivateChatThunk = createAsyncThunk<PrivateChatDTO, number, { state: RootState }>(
    "privateChat/open",
    async (roomId, {rejectWithValue}) => {
        try {
            return await openPrivateChat(roomId);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const hidePrivateChatThunk = createAsyncThunk<number, number, { state: RootState }>(
    "privateChat/hide",
    async (roomId, {rejectWithValue}) => {
        try {
            await hidePrivateChat(roomId);
            return roomId;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const fetchPrivateChatMessagesThunk = createAsyncThunk<
    MessagePage,
    FetchMessagesParams,
    { rejectValue: any }
>(
    "privateChat/fetchMessages",
    async ({roomId, afterMessageId, beforeMessageId, aroundMessageId}, {rejectWithValue}) => {
        try {
            return await getChatRoomMessages(roomId, afterMessageId, beforeMessageId, aroundMessageId);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const searchUsersThunk = createAsyncThunk<
    PaginatedResponse<UserMinimalDTO>,
    { q: string; page?: number; size?: number },
    { state: RootState }
>(
    "privateChat/searchUsers",
    async ({q, page = 0, size = 20}, {rejectWithValue}) => {
        try {
            return await searchUsers(q, page, size);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const searchPrivateChatMessagesThunk = createAsyncThunk<
    PaginatedResponse<Message>,
    { roomId: number; request: SearchMessageRequest },
    { rejectValue: any }
>(
    "privateChat/searchMessages",
    async ({roomId, request}, {rejectWithValue}) => {
        try {
            return await searchChatRoomMessages(roomId, request);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const acknowledgePrivateMessageThunk = createAsyncThunk<
    Message,
    { roomId: number; messageId: number }
>(
    "privateChat/acknowledge",
    async ({roomId, messageId}, {rejectWithValue}) => {
        try {
            return await updateLastReadMessage(roomId, messageId);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const sendPrivateMessageThunk = createAsyncThunk<Message, CreateMessageRequest>(
    "privateChat/sendMessage",
    async (message, {rejectWithValue}) => {
        try {
            return await saveAndBroadcastMessage(message);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const editPrivateMessageThunk = createAsyncThunk<Message, {
    messageId: number;
    editMessageRequest: EditMessageRequest;
}>(
    "privateChat/editMessage",
    async ({messageId, editMessageRequest}, {dispatch, rejectWithValue}) => {
        try {
            const updatedMessage = await editMessage(messageId, editMessageRequest);
            dispatch(setPrivateEditingMessage(null));
            return updatedMessage;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const deletePrivateMessageThunk = createAsyncThunk<void, number>(
    "privateChat/deleteMessage",
    async (messageId, {rejectWithValue}) => {
        try {
            await deleteMessage(messageId);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// ─── Orchestrating thunks ────────────────────────────────────────────

const loadOrFetchPrivateChatRoom = async (
    roomId: number,
    dispatch: any,
    getState: () => RootState
) => {
    const state = getState();
    const loadedRooms = selectLoadedPrivateRooms(state);
    const staleIds = selectPrivateStaleRoomIds(state);
    const topmostVisibleMessageIds = state.privateChatUi.topmostVisibleMessageIds;

    // Mirror the public-chat details endpoint: center the initial page around the
    // user's last-read message so the conversation opens at the first unread one.
    const conversations = selectPrivateConversations(state);
    const lastReadMessageId = conversations.find(c => c.id === roomId)?.lastReadMessage?.id;

    let jumpTargetMessageId: number | undefined = undefined;
    if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get("chatRoomId") === roomId.toString() && urlParams.get("jumpTo")) {
            jumpTargetMessageId = Number(urlParams.get("jumpTo"));
        }
    }

    const isLoaded = loadedRooms.some(room => room.id === roomId);
    const isStale = staleIds.includes(roomId);

    if (isLoaded) {
        if (isStale || jumpTargetMessageId) {
            const fetchAroundId = jumpTargetMessageId || topmostVisibleMessageIds?.[roomId];
            if (fetchAroundId) {
                await dispatch(fetchPrivateChatMessagesThunk({
                    roomId,
                    aroundMessageId: fetchAroundId,
                }));
            } else {
                dispatch(removeLoadedPrivateChatRoom(roomId));
                await dispatch(fetchPrivateChatMessagesThunk({roomId, aroundMessageId: lastReadMessageId}));
            }
            dispatch(removeStalePrivateRoomId(roomId));
        }
    } else {
        await dispatch(fetchPrivateChatMessagesThunk({roomId, aroundMessageId: lastReadMessageId}));
    }
};

export const selectAndLoadPrivateChatThunk = createAsyncThunk<
    void,
    number,
    { state: RootState }
>(
    "privateChat/selectAndLoad",
    async (roomId, {getState, dispatch}) => {
        const state = getState();
        const currentSelectedId = selectSelectedPrivateChatId(state);

        dispatch(setSelectedPrivateChat(roomId));
        dispatch(addOpenPrivateChatTab(roomId));

        if (currentSelectedId === roomId) {
            return;
        }

        await loadOrFetchPrivateChatRoom(roomId, dispatch, getState as () => RootState);
    }
);

export const closePrivateChatTabThunk = createAsyncThunk<
    void,
    number,
    { state: RootState }
>(
    "privateChat/closeTab",
    async (roomId, {getState, dispatch}) => {
        const state = getState();
        const selectedId = selectSelectedPrivateChatId(state);
        const orderedTabs = selectOpenPrivateChatTabs(state);
        const closingIndex = orderedTabs.findIndex(t => t.id === roomId);
        const remaining = orderedTabs.filter(t => t.id !== roomId);

        dispatch(removeOpenPrivateChatTab(roomId));

        // Closing a tab that isn't the active one: selection unaffected.
        if (selectedId !== roomId) return;

        // Last tab closed: blank the window.
        if (remaining.length === 0) {
            dispatch(setSelectedPrivateChat(null));
            return;
        }

        // Active tab closed with others open: select the neighbor that now
        // sits at the closed tab's position (clamp to the new last index).
        const nextIndex = Math.min(Math.max(closingIndex, 0), remaining.length - 1);
        await dispatch(selectAndLoadPrivateChatThunk(remaining[nextIndex].id));
    }
);

export const openOrCreateAndSelectPrivateChatThunk = createAsyncThunk<
    PrivateChatDTO,
    number,
    { state: RootState }
>(
    "privateChat/openOrCreateAndSelect",
    async (otherUserId, {dispatch, getState}) => {
        const conversation = await dispatch(openOrCreatePrivateChatThunk(otherUserId)).unwrap();
        dispatch(setSelectedPrivateChat(conversation.id));
        dispatch(addOpenPrivateChatTab(conversation.id));
        await loadOrFetchPrivateChatRoom(conversation.id, dispatch, getState as () => RootState);
        return conversation;
    }
);

export const resolveSelectedPrivateChatThunk = createAsyncThunk<
    void,
    { urlRoomId?: number } | void,
    { state: RootState }
>(
    "privateChat/resolveSelected",
    async (params, {getState, dispatch}) => {
        const urlRoomId = params && "urlRoomId" in params ? params.urlRoomId : undefined;
        const state = getState();
        const conversations = selectPrivateConversations(state);
        const currentSelectedId = selectSelectedPrivateChatId(state);

        if (urlRoomId) {
            const existing = conversations.find(c => c.id === urlRoomId);
            if (existing) {
                if (currentSelectedId !== existing.id) {
                    dispatch(setSelectedPrivateChat(existing.id));
                    dispatch(addOpenPrivateChatTab(existing.id));
                    await loadOrFetchPrivateChatRoom(existing.id, dispatch, getState as () => RootState);
                }
            } else {
                // Not currently in our list — open (also unhides on the backend)
                const fetched = await dispatch(openPrivateChatThunk(urlRoomId)).unwrap();
                dispatch(setSelectedPrivateChat(fetched.id));
                dispatch(addOpenPrivateChatTab(fetched.id));
                await loadOrFetchPrivateChatRoom(fetched.id, dispatch, getState as () => RootState);
            }
            return;
        }

        // Priority 2: keep current selection if still in list
        if (currentSelectedId && conversations.some(c => c.id === currentSelectedId)) {
            await loadOrFetchPrivateChatRoom(currentSelectedId, dispatch, getState as () => RootState);
            return;
        }

        // Priority 3: clear stale selection
        if (currentSelectedId && !conversations.some(c => c.id === currentSelectedId)) {
            dispatch(setSelectedPrivateChat(null));
        }
    }
);

export const handlePrivateChatReconnectionThunk = createAsyncThunk<
    void,
    void,
    { state: RootState }
>(
    "privateChat/handleReconnection",
    async (_, {getState, dispatch}) => {
        await dispatch(fetchPrivateChatsThunk());

        const state = getState();
        const selectedId = selectSelectedPrivateChatId(state);

        if (selectedId) {
            const staleIds = selectPrivateStaleRoomIds(state);
            const isStale = staleIds.includes(selectedId);

            if (isStale) {
                const topmostId = state.privateChatUi.topmostVisibleMessageIds?.[selectedId];
                if (topmostId) {
                    await dispatch(fetchPrivateChatMessagesThunk({
                        roomId: selectedId,
                        aroundMessageId: topmostId,
                    }));
                } else {
                    dispatch(removeLoadedPrivateChatRoom(selectedId));
                    await dispatch(fetchPrivateChatMessagesThunk({roomId: selectedId}));
                }
                dispatch(removeStalePrivateRoomId(selectedId));
            }
        }
    }
);

export const handleIncomingPrivateMessageThunk = createAsyncThunk<
    void,
    { message: Message; isByCurrentUser: boolean },
    { state: RootState }
>(
    "privateChat/handleIncomingMessage",
    async ({message}, {dispatch, getState}) => {
        const state = getState();
        const conversations = selectPrivateConversations(state);
        const exists = conversations.some(c => c.id === message.chatRoomId);
        if (!exists) {
            await dispatch(fetchPrivateChatsThunk());
        }
    }
);
