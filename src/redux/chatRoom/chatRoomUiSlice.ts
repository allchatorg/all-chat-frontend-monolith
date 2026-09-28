import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Message} from "@/models/message";
import {ReactionUpdateResponse} from "@/models/ReactionUpdateResponse";
import {addReactionRequestToMessage, removeReactionRequestFromMessage} from "@/redux/messages/messageReducers";
import {Reaction} from "@/models/Reaction";
import {
    createChatRoomThunk,
    fetchJoinedUserChatRoomsThunk,
    fetchMessageReactionDetailsThunk,
    joinChatRoomThunk,
    leaveChatRoomThunk
} from "@/redux/chatRoom/chatRoomThunk";

export type ChatRoomTabSortMode = 'manual' | 'alphabetical';

interface ChatRoomUiState {
    chatroomOrder: number[];
    chatRoomTabSortMode: ChatRoomTabSortMode;
    chatRoomScrollPositions: Record<number, number>;
    chatRoomsTopMostVisibleMessageId: Record<number, number>;
    jumpToMessageId?: number | null;
    editingMessage?: Message | null;
    replyingToMessage?: Message | null;
    messageReactionsState?: {
        selectedReaction?: Reaction;
        messageReactions?: Reaction[];
        detailsRequestId?: string;
        detailsRevision?: number;
    } | null;
    stompReconnected: boolean;
    staleChatRoomIds: number[];
}

const initialState: ChatRoomUiState = {
    chatroomOrder: [],
    chatRoomTabSortMode: 'manual',
    chatRoomScrollPositions: {},
    chatRoomsTopMostVisibleMessageId: {},
    jumpToMessageId: null,
    editingMessage: null,
    replyingToMessage: null,
    messageReactionsState: null,
    stompReconnected: false,
    staleChatRoomIds: [],
};

const chatRoomUiSlice = createSlice({
    name: 'chatRoomUi',
    initialState,
    reducers: {
        setChatroomOrder(state, action: PayloadAction<number[]>) {
            state.chatroomOrder = action.payload;
        },
        setChatRoomTabSortMode(state, action: PayloadAction<ChatRoomTabSortMode>) {
            state.chatRoomTabSortMode = action.payload;
        },
        setChatRoomScrollPosition(
            state,
            action: PayloadAction<{ chatRoomId: number; scrollTop: number }>
        ) {
            const {chatRoomId, scrollTop} = action.payload;
            state.chatRoomScrollPositions[chatRoomId] = scrollTop;
        },
        setChatRoomTopMostVisibleMessageId(
            state,
            action: PayloadAction<{ chatRoomId: number; messageId: number }>
        ) {
            const {chatRoomId, messageId} = action.payload;
            state.chatRoomsTopMostVisibleMessageId[chatRoomId] = messageId;
        },
        setJumpToMessageId(state, action: PayloadAction<number | null>) {
            state.jumpToMessageId = action.payload;
        },
        setEditingMessage(state, action: PayloadAction<Message | null>) {
            state.editingMessage = action.payload;
            if (action.payload) {
                state.replyingToMessage = null;
            }
        },
        setReplyingToMessage(state, action: PayloadAction<Message | null>) {
            state.replyingToMessage = action.payload;
            if (action.payload) {
                state.editingMessage = null;
            }
        },
        setStompReconnected(state, action: PayloadAction<boolean>) {
            state.stompReconnected = action.payload;
        },
        setMessageReactions(state, action: PayloadAction<Reaction[]>) {
            const sameMessage = state.messageReactionsState?.selectedReaction?.messageId === action.payload[0]?.messageId;
            state.messageReactionsState = {
                ...state.messageReactionsState,
                messageReactions: action.payload,
                selectedReaction: sameMessage ? state.messageReactionsState?.selectedReaction : undefined,
                detailsRequestId: sameMessage ? state.messageReactionsState?.detailsRequestId : undefined,
            };
        },
        setSelectedReaction(state, action: PayloadAction<Reaction | undefined>) {
            state.messageReactionsState = {
                ...state.messageReactionsState,
                selectedReaction: action.payload,
                detailsRequestId: undefined,
            };
        },
        updateOpenMessageReactions(state, action: PayloadAction<{reactionRequest: ReactionUpdateResponse; reactedByCurrentUser: boolean}>) {
            const current = state.messageReactionsState;
            const {reactionRequest, reactedByCurrentUser} = action.payload;
            if (!current || (current.messageReactions?.[0]?.messageId ?? current.selectedReaction?.messageId) !== reactionRequest.messageId) return;
            const update = (reactions: Reaction[]) => reactionRequest.responseType === 'ADD'
                ? addReactionRequestToMessage({reactions}, reactionRequest, reactedByCurrentUser).reactions
                : removeReactionRequestFromMessage({reactions}, reactionRequest, reactedByCurrentUser).reactions;
            current.messageReactions = update(current.messageReactions ?? []);
            // Discard in-flight snapshots older than this live membership change.
            current.detailsRequestId = undefined;
            current.detailsRevision = (current.detailsRevision ?? 0) + 1;
            if (current.selectedReaction?.emoji === reactionRequest.emoji) {
                current.selectedReaction = update([current.selectedReaction])[0] ?? {
                    ...current.selectedReaction, usersCount: 0, users: [], reactedByCurrentUser: false,
                };
            }
        },
        resetChatRoomUiStateOnRoomChange(state) {
            state.jumpToMessageId = null;
            state.editingMessage = null;
            state.replyingToMessage = null;
            state.messageReactionsState = null;
        },
        markChatRoomsAsStale(state, action: PayloadAction<number[]>) {
            // Merge unique IDs
            const newIds = action.payload.filter(id => !state.staleChatRoomIds.includes(id));
            state.staleChatRoomIds = [...state.staleChatRoomIds, ...newIds];
        },
        removeStaleChatRoomId(state, action: PayloadAction<number>) {
            state.staleChatRoomIds = state.staleChatRoomIds.filter(id => id !== action.payload);
        }
    },
    extraReducers: (builder) => {
        builder.addCase(fetchJoinedUserChatRoomsThunk.fulfilled, (state, action) => {
            const fetchedRooms = action.payload;

            if (state.chatroomOrder.length > 0) {
                const fetchedIds = fetchedRooms.map(room => room.chatRoomId);
                const newIds = fetchedIds.filter(id => !state.chatroomOrder.includes(id));
                const existingOrder = state.chatroomOrder.filter(id => fetchedIds.includes(id));
                state.chatroomOrder = [...existingOrder, ...newIds];
            } else {
                state.chatroomOrder = fetchedRooms.map(room => room.chatRoomId);
            }
        });
        builder.addCase(createChatRoomThunk.fulfilled, (state, action) => {
            state.chatroomOrder.push(action.payload.chatRoomId);
        });
        builder.addCase(joinChatRoomThunk.fulfilled, (state, action) => {
            const joinedRoom = action.payload;
            if (!state.chatroomOrder.includes(joinedRoom.chatRoomId)) {
                state.chatroomOrder.push(joinedRoom.chatRoomId);
            }
        });
        builder.addCase(leaveChatRoomThunk.fulfilled, (state, action) => {
            const leftRoomId = action.payload;
            state.chatroomOrder = state.chatroomOrder.filter(id => id !== leftRoomId);
            delete state.chatRoomScrollPositions[leftRoomId];
            delete state.chatRoomsTopMostVisibleMessageId[leftRoomId];
        });
        builder.addCase(fetchMessageReactionDetailsThunk.pending, (state, action) => {
            state.messageReactionsState = {
                ...state.messageReactionsState,
                detailsRequestId: action.meta.requestId,
            };
        });
        builder.addCase(fetchMessageReactionDetailsThunk.fulfilled, (state, action) => {
            if (state.messageReactionsState?.detailsRequestId !== action.meta.requestId) return;
            const summary = state.messageReactionsState.messageReactions?.find(reaction =>
                reaction.messageId === action.payload.messageId && reaction.emoji === action.payload.emoji);
            state.messageReactionsState.selectedReaction = {
                ...action.payload,
                reactedByCurrentUser: summary?.reactedByCurrentUser ?? false,
            };
        });
    }
});

export const {
    setChatroomOrder,
    setChatRoomTabSortMode,
    setChatRoomScrollPosition,
    setChatRoomTopMostVisibleMessageId,
    setJumpToMessageId,
    setEditingMessage,
    setReplyingToMessage,
    setStompReconnected,
    setMessageReactions,
    updateOpenMessageReactions,
    setSelectedReaction,
    resetChatRoomUiStateOnRoomChange,
    markChatRoomsAsStale,
    removeStaleChatRoomId,
} = chatRoomUiSlice.actions;

export default chatRoomUiSlice.reducer;
