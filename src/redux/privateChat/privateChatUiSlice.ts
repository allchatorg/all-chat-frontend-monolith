import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Message} from "@/models/message";
import {
    fetchPrivateChatsThunk,
    hidePrivateChatThunk,
    openOrCreatePrivateChatThunk,
} from "@/redux/privateChat/privateChatThunk";

export type PrivateActiveRightPanel = "search-messages" | null;

interface PrivateChatUiState {
    openTabIds: number[];
    tabOrder: number[];
    conversationOrder: number[];

    scrollPositions: Record<number, number>;
    topmostVisibleMessageIds: Record<number, number>;

    jumpToMessageId: number | null;
    editingMessage: Message | null;
    replyingToMessage: Message | null;

    staleRoomIds: number[];

    activeRightPanel: PrivateActiveRightPanel;

    sidebarVisible: boolean;
}

const initialState: PrivateChatUiState = {
    openTabIds: [],
    tabOrder: [],
    conversationOrder: [],

    scrollPositions: {},
    topmostVisibleMessageIds: {},

    jumpToMessageId: null,
    editingMessage: null,
    replyingToMessage: null,

    staleRoomIds: [],

    activeRightPanel: null,

    sidebarVisible: true,
};

const privateChatUiSlice = createSlice({
    name: "privateChatUi",
    initialState,
    reducers: {
        addOpenPrivateChatTab(state, action: PayloadAction<number>) {
            const roomId = action.payload;
            if (!state.openTabIds.includes(roomId)) {
                state.openTabIds.push(roomId);
            }
            if (!state.tabOrder.includes(roomId)) {
                state.tabOrder.push(roomId);
            }
        },
        removeOpenPrivateChatTab(state, action: PayloadAction<number>) {
            const roomId = action.payload;
            state.openTabIds = state.openTabIds.filter(id => id !== roomId);
            state.tabOrder = state.tabOrder.filter(id => id !== roomId);
        },
        reorderPrivateChatTabs(state, action: PayloadAction<number[]>) {
            state.tabOrder = action.payload;
        },
        reorderPrivateConversations(state, action: PayloadAction<number[]>) {
            state.conversationOrder = action.payload;
        },
        setPrivateChatScrollPosition(
            state,
            action: PayloadAction<{ roomId: number; scrollTop: number }>
        ) {
            const {roomId, scrollTop} = action.payload;
            state.scrollPositions[roomId] = scrollTop;
        },
        setPrivateChatTopMostVisibleMessageId(
            state,
            action: PayloadAction<{ roomId: number; messageId: number }>
        ) {
            const {roomId, messageId} = action.payload;
            state.topmostVisibleMessageIds[roomId] = messageId;
        },
        setPrivateJumpToMessageId(state, action: PayloadAction<number | null>) {
            state.jumpToMessageId = action.payload;
        },
        setPrivateEditingMessage(state, action: PayloadAction<Message | null>) {
            state.editingMessage = action.payload;
            if (action.payload) {
                state.replyingToMessage = null;
            }
        },
        setPrivateReplyingToMessage(state, action: PayloadAction<Message | null>) {
            state.replyingToMessage = action.payload;
            if (action.payload) {
                state.editingMessage = null;
            }
        },
        markPrivateRoomsAsStale(state, action: PayloadAction<number[]>) {
            const newIds = action.payload.filter(id => !state.staleRoomIds.includes(id));
            state.staleRoomIds = [...state.staleRoomIds, ...newIds];
        },
        removeStalePrivateRoomId(state, action: PayloadAction<number>) {
            state.staleRoomIds = state.staleRoomIds.filter(id => id !== action.payload);
        },
        setPrivateActiveRightPanel(state, action: PayloadAction<PrivateActiveRightPanel>) {
            state.activeRightPanel = action.payload;
        },
        setPrivateSidebarVisible(state, action: PayloadAction<boolean>) {
            state.sidebarVisible = action.payload;
        },
        togglePrivateSidebar(state) {
            state.sidebarVisible = !state.sidebarVisible;
        },
        resetPrivateChatUiStateOnRoomChange(state) {
            state.jumpToMessageId = null;
            state.editingMessage = null;
            state.replyingToMessage = null;
        },
    },
    extraReducers: (builder) => {
        // Close the search sidebar whenever the active conversation changes.
        // Matched by action type string to avoid a circular import with
        // privateChatSlice (uiSlice -> slice -> thunk -> uiSlice).
        builder.addCase("privateChat/setSelectedPrivateChat", (state) => {
            state.activeRightPanel = null;
        });
        builder.addCase(fetchPrivateChatsThunk.fulfilled, (state, action) => {
            const fetchedIds = action.payload.map(c => c.id);

            // Drop tabs for conversations no longer present (e.g. hidden by another client)
            state.openTabIds = state.openTabIds.filter(id => fetchedIds.includes(id));
            state.tabOrder = state.tabOrder.filter(id => fetchedIds.includes(id));
            state.conversationOrder = state.conversationOrder.filter(id => fetchedIds.includes(id));
        });
        builder.addCase(openOrCreatePrivateChatThunk.fulfilled, (state, action) => {
            const roomId = action.payload.id;
            if (!state.openTabIds.includes(roomId)) {
                state.openTabIds.push(roomId);
            }
            if (!state.tabOrder.includes(roomId)) {
                state.tabOrder.push(roomId);
            }
        });
        builder.addCase(hidePrivateChatThunk.fulfilled, (state, action) => {
            const roomId = action.payload;
            state.openTabIds = state.openTabIds.filter(id => id !== roomId);
            state.tabOrder = state.tabOrder.filter(id => id !== roomId);
            state.conversationOrder = state.conversationOrder.filter(id => id !== roomId);
            delete state.scrollPositions[roomId];
            delete state.topmostVisibleMessageIds[roomId];
        });
    },
});

export const {
    addOpenPrivateChatTab,
    removeOpenPrivateChatTab,
    reorderPrivateChatTabs,
    reorderPrivateConversations,
    setPrivateChatScrollPosition,
    setPrivateChatTopMostVisibleMessageId,
    setPrivateJumpToMessageId,
    setPrivateEditingMessage,
    setPrivateReplyingToMessage,
    markPrivateRoomsAsStale,
    removeStalePrivateRoomId,
    setPrivateActiveRightPanel,
    setPrivateSidebarVisible,
    togglePrivateSidebar,
    resetPrivateChatUiStateOnRoomChange,
} = privateChatUiSlice.actions;

export default privateChatUiSlice.reducer;
