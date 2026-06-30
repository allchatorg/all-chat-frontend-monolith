import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {PrivateChatDTO} from "@/models/PrivateChatDTO";
import {ChatRoom} from "@/models/ChatRoom";
import {Message} from "@/models/message";
import {PaginatedResponse} from "@/models/PaginatedResponse";
import {UserMinimalDTO} from "@/models/UserMinimalDTO";
import {SearchMessageRequest} from "@/models/SearchMessageRequest";
import {ReactionUpdateResponse} from "@/models/ReactionUpdateResponse";
import {
    addChatRoomReaction,
    patchReplyPreviewsForDeletedMessage,
    patchReplyPreviewsForEditedMessage,
    removeChatRoomReaction,
} from "@/redux/messages/messageReducers";
import {
    acknowledgePrivateMessageThunk,
    deletePrivateMessageThunk,
    editPrivateMessageThunk,
    fetchPrivateChatMessagesThunk,
    fetchPrivateChatsThunk,
    hidePrivateChatThunk,
    openOrCreatePrivateChatThunk,
    openPrivateChatThunk,
    searchPrivateChatMessagesThunk,
    searchUsersThunk,
    sendPrivateMessageThunk,
} from "@/redux/privateChat/privateChatThunk";

interface PrivateChatState {
    conversations: PrivateChatDTO[];
    conversationsLoading: boolean;

    loadedRooms: ChatRoom[];

    selectedChatId: number | null;

    selectedChatLoading: boolean;
    createOrOpenLoading: boolean;
    hideChatLoading: boolean;

    userSearchResults: PaginatedResponse<UserMinimalDTO> | null;
    userSearchLoading: boolean;

    searchedMessages: PaginatedResponse<Message> | null;
    searchMessagesParams: SearchMessageRequest | null;
}

const initialState: PrivateChatState = {
    conversations: [],
    conversationsLoading: false,

    loadedRooms: [],

    selectedChatId: null,

    selectedChatLoading: false,
    createOrOpenLoading: false,
    hideChatLoading: false,

    userSearchResults: null,
    userSearchLoading: false,

    searchedMessages: null,
    searchMessagesParams: null,
};

function upsertConversation(state: PrivateChatState, conversation: PrivateChatDTO) {
    const idx = state.conversations.findIndex(c => c.id === conversation.id);
    if (idx === -1) {
        state.conversations.push(conversation);
    } else {
        state.conversations[idx] = conversation;
    }
}

function updateConversationFromMessage(
    state: PrivateChatState,
    message: Message,
    isByCurrentUser: boolean
) {
    const conversation = state.conversations.find(c => c.id === message.chatRoomId);
    if (!conversation) {
        return;
    }
    conversation.lastMessage = message;
    if (isByCurrentUser) {
        conversation.unreadMessagesCount = 0;
        conversation.lastReadMessage = message;
    } else {
        const current = conversation.unreadMessagesCount;
        conversation.unreadMessagesCount = (current === null || current === undefined ? 0 : current) + 1;
    }
}

const privateChatSlice = createSlice({
    name: "privateChat",
    initialState,
    reducers: {
        setSelectedPrivateChat(state, action: PayloadAction<number | null>) {
            // Switching to a different conversation: drop the previous chat's
            // search results/params so the search panel doesn't show stale hits.
            if (state.selectedChatId !== action.payload) {
                state.searchedMessages = null;
                state.searchMessagesParams = null;
            }
            state.selectedChatId = action.payload;
        },
        setLoadedPrivateChatRoom(state, action: PayloadAction<ChatRoom>) {
            const room = action.payload;
            state.loadedRooms = [
                ...state.loadedRooms.filter(r => r.id !== room.id),
                room,
            ];
        },
        removeLoadedPrivateChatRoom(state, action: PayloadAction<number>) {
            state.loadedRooms = state.loadedRooms.filter(r => r.id !== action.payload);
        },
        clearConversations(state) {
            state.conversations = [];
            state.loadedRooms = [];
            state.selectedChatId = null;
        },

        // WebSocket handlers (bodies filled in Phase 2)
        handlePrivateNewMessage(
            state,
            action: PayloadAction<{ message: Message; isByCurrentUser: boolean }>
        ) {
            const {message, isByCurrentUser} = action.payload;

            // Update conversation summary in the sidebar
            updateConversationFromMessage(state, message, isByCurrentUser);

            // Append to the room's loaded messages (dedupe by id)
            const room = state.loadedRooms.find(r => r.id === message.chatRoomId);
            if (room) {
                if (room.messages.some(m => m.id === message.id)) {
                    return;
                }
                if (room.hasNext) {
                    // We're paginated away from the end; don't append.
                    return;
                }
                room.messages.push(message);
                room.totalMessages += 1;
                room.lastMessageId = message.id;
            }
        },
        handlePrivateMessageEdit(state, action: PayloadAction<Message>) {
            const message = action.payload;
            const room = state.loadedRooms.find(r => r.id === message.chatRoomId);
            if (room) {
                room.messages = patchReplyPreviewsForEditedMessage(
                    room.messages.map(m => m.id === message.id ? message : m),
                    message
                );
            }
            const conversation = state.conversations.find(c => c.id === message.chatRoomId);
            if (conversation && conversation.lastMessage?.id === message.id) {
                conversation.lastMessage = message;
            }
        },
        handlePrivateMessageDelete(state, action: PayloadAction<Message>) {
            const deletedMessage = action.payload;
            const room = state.loadedRooms.find(r => r.id === deletedMessage.chatRoomId);
            if (room) {
                // Private chat members are staff, so deleted content stays visible
                // (matching how the deleted message itself is kept above).
                room.messages = patchReplyPreviewsForDeletedMessage(
                    room.messages.map(m =>
                        m.id === deletedMessage.id ? {...m, deleted: true} : m
                    ),
                    deletedMessage.id,
                    true
                );
            }
        },

        addPrivateMessageReaction(
            state,
            action: PayloadAction<{ reactionRequest: ReactionUpdateResponse; reactedByCurrentUser: boolean }>
        ) {
            const {reactionRequest, reactedByCurrentUser} = action.payload;
            state.loadedRooms = state.loadedRooms.map(room =>
                addChatRoomReaction(room, reactionRequest, reactedByCurrentUser)
            );
        },
        removePrivateMessageReaction(
            state,
            action: PayloadAction<ReactionUpdateResponse>
        ) {
            state.loadedRooms = state.loadedRooms.map(room =>
                removeChatRoomReaction(room, action.payload)
            );
        },

        updatePrivateUserMessageColor(
            state,
            action: PayloadAction<{ userId: number; hexColor: string }>
        ) {
            const {userId, hexColor} = action.payload;
            const apply = (m: Message): Message =>
                m.senderId === userId ? {...m, color: hexColor} : m;
            state.loadedRooms = state.loadedRooms.map(room => ({
                ...room,
                messages: room.messages.map(apply),
            }));
        },

        setSearchPrivateMessagesParams(state, action: PayloadAction<SearchMessageRequest>) {
            state.searchMessagesParams = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(fetchPrivateChatsThunk.pending, (state) => {
            state.conversationsLoading = true;
        });
        builder.addCase(fetchPrivateChatsThunk.fulfilled, (state, action) => {
            state.conversationsLoading = false;
            state.conversations = action.payload;

            // Clear stale selection if no longer in the list
            if (state.selectedChatId && !action.payload.some(c => c.id === state.selectedChatId)) {
                state.selectedChatId = null;
            }
        });
        builder.addCase(fetchPrivateChatsThunk.rejected, (state) => {
            state.conversationsLoading = false;
        });

        builder.addCase(openOrCreatePrivateChatThunk.pending, (state) => {
            state.createOrOpenLoading = true;
        });
        builder.addCase(openOrCreatePrivateChatThunk.fulfilled, (state, action) => {
            state.createOrOpenLoading = false;
            upsertConversation(state, action.payload);
        });
        builder.addCase(openOrCreatePrivateChatThunk.rejected, (state) => {
            state.createOrOpenLoading = false;
        });

        builder.addCase(openPrivateChatThunk.pending, (state) => {
            state.selectedChatLoading = true;
        });
        builder.addCase(openPrivateChatThunk.fulfilled, (state, action) => {
            state.selectedChatLoading = false;
            upsertConversation(state, action.payload);
        });
        builder.addCase(openPrivateChatThunk.rejected, (state) => {
            state.selectedChatLoading = false;
        });

        builder.addCase(hidePrivateChatThunk.pending, (state) => {
            state.hideChatLoading = true;
        });
        builder.addCase(hidePrivateChatThunk.fulfilled, (state, action) => {
            state.hideChatLoading = false;
            const roomId = action.payload;
            state.conversations = state.conversations.filter(c => c.id !== roomId);
            state.loadedRooms = state.loadedRooms.filter(r => r.id !== roomId);
            if (state.selectedChatId === roomId) {
                state.selectedChatId = null;
            }
        });
        builder.addCase(hidePrivateChatThunk.rejected, (state) => {
            state.hideChatLoading = false;
        });

        builder.addCase(fetchPrivateChatMessagesThunk.pending, (state) => {
            state.selectedChatLoading = true;
        });
        builder.addCase(fetchPrivateChatMessagesThunk.fulfilled, (state, action) => {
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

            // Derive totalMessages from the message count if not paged
            if (!existing) {
                updatedRoom.totalMessages = fetchedMessages.length;
            }

            state.loadedRooms = [
                ...state.loadedRooms.filter(r => r.id !== roomId),
                updatedRoom,
            ];
        });
        builder.addCase(fetchPrivateChatMessagesThunk.rejected, (state) => {
            state.selectedChatLoading = false;
        });

        builder.addCase(searchUsersThunk.pending, (state) => {
            state.userSearchLoading = true;
        });
        builder.addCase(searchUsersThunk.fulfilled, (state, action) => {
            state.userSearchLoading = false;
            state.userSearchResults = action.payload;
        });
        builder.addCase(searchUsersThunk.rejected, (state) => {
            state.userSearchLoading = false;
        });

        builder.addCase(searchPrivateChatMessagesThunk.fulfilled, (state, action) => {
            const {roomId} = action.meta.arg;
            if (state.selectedChatId === roomId) {
                state.searchedMessages = action.payload;
            } else {
                state.searchedMessages = null;
            }
        });

        builder.addCase(acknowledgePrivateMessageThunk.fulfilled, (state, action) => {
            const updated = action.payload;
            const conversation = state.conversations.find(c => c.id === updated.chatRoomId);
            if (conversation) {
                conversation.lastReadMessage = updated;
                conversation.unreadMessagesCount = 0;
            }
        });

        builder.addCase(sendPrivateMessageThunk.fulfilled, (state, action) => {
            const message = action.payload;
            updateConversationFromMessage(state, message, true);

            const room = state.loadedRooms.find(r => r.id === message.chatRoomId);
            if (!room) {
                return;
            }
            if (room.messages.some(m => m.id === message.id)) {
                return;
            }
            if (!room.hasNext) {
                room.messages.push(message);
                room.totalMessages += 1;
                room.lastMessageId = message.id;
            }
        });

        builder.addCase(editPrivateMessageThunk.fulfilled, (state, action) => {
            const message = action.payload;
            const room = state.loadedRooms.find(r => r.id === message.chatRoomId);
            if (room) {
                room.messages = room.messages.map(m => m.id === message.id ? message : m);
            }
        });

        builder.addCase(deletePrivateMessageThunk.fulfilled, (state, action) => {
            const messageId = action.meta.arg;
            state.loadedRooms = state.loadedRooms.map(room => ({
                ...room,
                messages: room.messages.map(m =>
                    m.id === messageId ? {...m, deleted: true} : m
                ),
            }));
        });
    },
});

export const {
    setSelectedPrivateChat,
    setLoadedPrivateChatRoom,
    removeLoadedPrivateChatRoom,
    clearConversations,
    handlePrivateNewMessage,
    handlePrivateMessageEdit,
    handlePrivateMessageDelete,
    addPrivateMessageReaction,
    removePrivateMessageReaction,
    updatePrivateUserMessageColor,
    setSearchPrivateMessagesParams,
} = privateChatSlice.actions;

export default privateChatSlice.reducer;
