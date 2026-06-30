import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Message} from "@/models/message";
import {Reaction} from "@/models/Reaction";
import {
    createChatRoomThunk,
    fetchJoinedUserChatRoomsThunk,
    fetchMessageReactionDetailsThunk,
    joinChatRoomThunk,
    leaveChatRoomThunk
} from "@/redux/chatRoom/chatRoomThunk";

interface ChatRoomUiState {
    chatroomOrder: number[];
    chatRoomScrollPositions: Record<number, number>;
    chatRoomsTopMostVisibleMessageId: Record<number, number>;
    jumpToMessageId?: number | null;
    editingMessage?: Message | null;
    replyingToMessage?: Message | null;
    messageReactionsState?: {
        selectedReaction?: Reaction;
        messageReactions?: Reaction[];
    } | null;
    stompReconnected: boolean;
    staleChatRoomIds: number[];
}

const initialState: ChatRoomUiState = {
    chatroomOrder: [],
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
            state.messageReactionsState = {
                ...state.messageReactionsState,
                messageReactions: action.payload
            };
        },
        setSelectedReaction(state, action: PayloadAction<Reaction | undefined>) {
            state.messageReactionsState = {
                ...state.messageReactionsState,
                selectedReaction: action.payload
            };
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
        builder.addCase(fetchMessageReactionDetailsThunk.fulfilled, (state, action) => {
            state.messageReactionsState = {
                ...state.messageReactionsState,
                selectedReaction: action.payload
            };
        });
    }
});

export const {
    setChatroomOrder,
    setChatRoomScrollPosition,
    setChatRoomTopMostVisibleMessageId,
    setJumpToMessageId,
    setEditingMessage,
    setReplyingToMessage,
    setStompReconnected,
    setMessageReactions,
    setSelectedReaction,
    resetChatRoomUiStateOnRoomChange,
    markChatRoomsAsStale,
    removeStaleChatRoomId,
} = chatRoomUiSlice.actions;

export default chatRoomUiSlice.reducer;
