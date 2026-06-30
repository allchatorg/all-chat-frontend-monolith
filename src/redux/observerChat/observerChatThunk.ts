import {createAsyncThunk} from "@reduxjs/toolkit";
import {RootState} from "@/redux/store";
import {AdminConversationDTO} from "@/models/AdminConversationDTO";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {MessagePage} from "@/models/MessagePage";
import {Message} from "@/models/message";
import {SearchMessageRequest} from "@/models/SearchMessageRequest";
import {FetchMessagesParams} from "@/models/fetchMessagesParams";
import {
    deleteObserverMessage,
    getObserverConversationMessages,
    getUserConversations,
    searchObserverConversationMessages,
} from "@/api/admin/adminConversationAPI";
import {setSelectedObserverChat} from "@/redux/observerChat/observerChatSlice";
import {setObserverJumpToMessageId} from "@/redux/observerChat/observerChatUiSlice";

export const fetchObserverConversationsThunk = createAsyncThunk<
    PaginatedResponse<AdminConversationDTO>,
    { userId: number; search?: string; page?: number; pageSize?: number },
    { state: RootState }
>(
    "observerChat/fetchConversations",
    async ({userId, search, page = 0, pageSize = 20}, {rejectWithValue}) => {
        try {
            return await getUserConversations(userId, search, page, pageSize);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    },
);

// Mirrors fetchChatRoomMessagesThunk's arg shape so it can drive useChatScrollAndPagination.
// The required targetUserId is read from the observerChat slice (set when the tab mounts),
// keeping FetchMessagesParams unchanged.
export const fetchObserverMessagesThunk = createAsyncThunk<
    MessagePage,
    FetchMessagesParams,
    { state: RootState }
>(
    "observerChat/fetchMessages",
    async ({roomId, afterMessageId, beforeMessageId, aroundMessageId}, {getState, rejectWithValue}) => {
        const targetUserId = getState().observerChat.targetUserId;
        if (!targetUserId) {
            return rejectWithValue({status: 400, message: "No target user selected"});
        }
        try {
            return await getObserverConversationMessages(
                targetUserId, roomId, afterMessageId, beforeMessageId, aroundMessageId);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    },
);

// Searches messages by content/sender/attachment across all of the target user's
// visible conversations. targetUserId is read from the slice (set when the tab mounts).
export const searchObserverMessagesThunk = createAsyncThunk<
    PaginatedResponse<Message>,
    { request: SearchMessageRequest },
    { state: RootState }
>(
    "observerChat/searchMessages",
    async ({request}, {getState, rejectWithValue}) => {
        const targetUserId = getState().observerChat.targetUserId;
        if (!targetUserId) {
            return rejectWithValue({status: 400, message: "No target user selected"});
        }
        try {
            return await searchObserverConversationMessages(targetUserId, request);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    },
);

// Opens the conversation a search result belongs to, then asks the chat pane to scroll
// to and highlight it (via observerChatUi.jumpToMessageId, consumed by
// useChatScrollAndPagination / OBSERVER_CHAT_PAGING_CONFIG).
export const jumpToObserverMessageThunk = createAsyncThunk<
    void,
    { roomId: number; messageId: number },
    { state: RootState }
>(
    "observerChat/jumpToMessage",
    async ({roomId, messageId}, {dispatch}) => {
        // Reset first so clicking the same result twice re-fires the scroll/highlight.
        dispatch(setObserverJumpToMessageId(null));
        try {
            await dispatch(selectAndLoadObserverChatThunk(roomId)).unwrap();
        } catch {
            // Load failed (e.g. room no longer visible) — don't trigger a jump into nothing.
            return;
        }
        setTimeout(() => dispatch(setObserverJumpToMessageId(messageId)));
    },
);

export const selectAndLoadObserverChatThunk = createAsyncThunk<
    void,
    number,
    { state: RootState }
>(
    "observerChat/selectAndLoad",
    async (roomId, {getState, dispatch}) => {
        const state = getState();
        const currentSelectedId = state.observerChat.selectedChatId;
        const isLoaded = state.observerChat.loadedRooms.some(r => r.id === roomId);

        dispatch(setSelectedObserverChat(roomId));

        if (currentSelectedId === roomId) {
            return;
        }
        if (!isLoaded) {
            await dispatch(fetchObserverMessagesThunk({roomId}));
        }
    },
);

export const deleteObserverMessageThunk = createAsyncThunk<
    void,
    { roomId: number; messageId: number },
    { state: RootState }
>(
    "observerChat/deleteMessage",
    async ({roomId, messageId}, {getState, rejectWithValue}) => {
        const targetUserId = getState().observerChat.targetUserId;
        if (!targetUserId) {
            return rejectWithValue({status: 400, message: "No target user selected"});
        }
        try {
            await deleteObserverMessage(targetUserId, roomId, messageId);
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    },
);
