import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {AdminConversationDTO} from "@/models/AdminConversationDTO";
import {ChatRoom} from "@/models/ChatRoom";
import {Message} from "@/models/message";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {SearchMessageRequest} from "@/models/SearchMessageRequest";
import {
    deleteObserverMessageThunk,
    fetchObserverConversationsThunk,
    fetchObserverMessagesThunk,
    searchObserverMessagesThunk,
} from "@/redux/observerChat/observerChatThunk";

interface ObserverChatPageInfo {
    totalPages: number;
    totalElements: number;
    number: number;
}

interface ObserverChatState {
    targetUserId: number | null;

    conversations: AdminConversationDTO[];
    conversationsPage: ObserverChatPageInfo | null;
    conversationsLoading: boolean;

    searchTerm: string;

    // Cross-conversation message search (the right-hand results pane).
    messageSearchResults: PaginatedResponse<Message> | null;
    messageSearchParams: SearchMessageRequest | null;
    messageSearchLoading: boolean;
    messageSearchOpen: boolean;

    loadedRooms: ChatRoom[];
    selectedChatId: number | null;
    selectedChatLoading: boolean;
}

const initialState: ObserverChatState = {
    targetUserId: null,

    conversations: [],
    conversationsPage: null,
    conversationsLoading: false,

    searchTerm: "",

    messageSearchResults: null,
    messageSearchParams: null,
    messageSearchLoading: false,
    messageSearchOpen: false,

    loadedRooms: [],
    selectedChatId: null,
    selectedChatLoading: false,
};

const observerChatSlice = createSlice({
    name: "observerChat",
    initialState,
    reducers: {
        setObserverTargetUser(state, action: PayloadAction<number | null>) {
            // Switching to a different reviewed user wipes everything so no data leaks across profiles.
            if (state.targetUserId !== action.payload) {
                state.conversations = [];
                state.conversationsPage = null;
                state.loadedRooms = [];
                state.selectedChatId = null;
                state.searchTerm = "";
                state.messageSearchResults = null;
                state.messageSearchParams = null;
                state.messageSearchOpen = false;
            }
            state.targetUserId = action.payload;
        },
        setObserverSearchTerm(state, action: PayloadAction<string>) {
            state.searchTerm = action.payload;
        },
        setObserverMessageSearchParams(state, action: PayloadAction<SearchMessageRequest>) {
            state.messageSearchParams = action.payload;
        },
        openObserverMessageSearch(state) {
            state.messageSearchOpen = true;
        },
        closeObserverMessageSearch(state) {
            state.messageSearchOpen = false;
            state.messageSearchResults = null;
            state.messageSearchParams = null;
        },
        setSelectedObserverChat(state, action: PayloadAction<number | null>) {
            state.selectedChatId = action.payload;
        },
        removeObserverConversation(state, action: PayloadAction<number>) {
            const roomId = action.payload;
            state.conversations = state.conversations.filter(c => c.roomId !== roomId);
            state.loadedRooms = state.loadedRooms.filter(r => r.id !== roomId);
            if (state.selectedChatId === roomId) {
                state.selectedChatId = null;
            }
        },
        clearObserverChat() {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchObserverConversationsThunk.pending, (state) => {
            state.conversationsLoading = true;
        });
        builder.addCase(fetchObserverConversationsThunk.fulfilled, (state, action) => {
            state.conversationsLoading = false;
            state.conversations = action.payload.content;
            state.conversationsPage = {
                totalPages: action.payload.totalPages,
                totalElements: action.payload.totalElements,
                number: action.payload.number,
            };
            // Drop a stale selection that's no longer in the visible page.
            if (state.selectedChatId && !action.payload.content.some(c => c.roomId === state.selectedChatId)) {
                state.selectedChatId = null;
            }
        });
        builder.addCase(fetchObserverConversationsThunk.rejected, (state) => {
            state.conversationsLoading = false;
        });

        builder.addCase(fetchObserverMessagesThunk.pending, (state) => {
            state.selectedChatLoading = true;
        });
        builder.addCase(fetchObserverMessagesThunk.fulfilled, (state, action) => {
            state.selectedChatLoading = false;
            const roomId = action.meta.arg.roomId;
            const {afterMessageId, beforeMessageId} = action.meta.arg;
            const {
                messages: fetchedMessages,
                hasNext,
                hasPrevious,
                firstMessageId,
                lastMessageId,
            } = action.payload;

            const existing = state.loadedRooms.find(r => r.id === roomId);
            const baseRoom: ChatRoom = existing ?? {
                id: roomId,
                name: "",
                messages: [],
                isArchived: false,
                totalMessages: 0,
                hasPrevious: false,
                hasNext: false,
                firstMessageId: null,
                lastMessageId: null,
            };

            const existingIds = new Set(baseRoom.messages.filter(m => !m.advert).map(m => m.id));
            const uniqueFetched = fetchedMessages.filter(m => !existingIds.has(m.id));

            let updatedRoom: ChatRoom;
            if (beforeMessageId !== undefined) {
                updatedRoom = {
                    ...baseRoom,
                    messages: [...uniqueFetched, ...baseRoom.messages],
                    hasPrevious,
                    firstMessageId: firstMessageId ?? baseRoom.firstMessageId,
                };
            } else if (afterMessageId !== undefined) {
                updatedRoom = {
                    ...baseRoom,
                    messages: [...baseRoom.messages, ...uniqueFetched],
                    hasNext,
                    lastMessageId: lastMessageId ?? baseRoom.lastMessageId,
                };
            } else {
                updatedRoom = {
                    ...baseRoom,
                    messages: fetchedMessages,
                    hasPrevious,
                    hasNext,
                    firstMessageId,
                    lastMessageId,
                };
            }

            if (!existing) {
                updatedRoom.totalMessages = fetchedMessages.length;
            }

            state.loadedRooms = [
                ...state.loadedRooms.filter(r => r.id !== roomId),
                updatedRoom,
            ];
        });
        builder.addCase(fetchObserverMessagesThunk.rejected, (state) => {
            state.selectedChatLoading = false;
        });

        builder.addCase(searchObserverMessagesThunk.pending, (state) => {
            state.messageSearchLoading = true;
        });
        builder.addCase(searchObserverMessagesThunk.fulfilled, (state, action) => {
            state.messageSearchLoading = false;
            state.messageSearchResults = action.payload;
        });
        builder.addCase(searchObserverMessagesThunk.rejected, (state) => {
            state.messageSearchLoading = false;
        });

        builder.addCase(deleteObserverMessageThunk.fulfilled, (state, action) => {
            const {messageId} = action.meta.arg;
            state.loadedRooms = state.loadedRooms.map(room => ({
                ...room,
                messages: room.messages.map(m =>
                    m.id === messageId ? {...m, deleted: true} : m,
                ),
            }));
        });
    },
});

export const {
    setObserverTargetUser,
    setObserverSearchTerm,
    setObserverMessageSearchParams,
    openObserverMessageSearch,
    closeObserverMessageSearch,
    setSelectedObserverChat,
    removeObserverConversation,
    clearObserverChat,
} = observerChatSlice.actions;

export default observerChatSlice.reducer;
