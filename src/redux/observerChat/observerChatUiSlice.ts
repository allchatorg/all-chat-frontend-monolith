import {createSlice, PayloadAction} from "@reduxjs/toolkit";

interface ObserverChatUiState {
    scrollPositions: Record<number, number>;
    topmostVisibleMessageIds: Record<number, number>;
    jumpToMessageId: number | null;
}

const initialState: ObserverChatUiState = {
    scrollPositions: {},
    topmostVisibleMessageIds: {},
    jumpToMessageId: null,
};

const observerChatUiSlice = createSlice({
    name: "observerChatUi",
    initialState,
    reducers: {
        setObserverScrollPosition(
            state,
            action: PayloadAction<{ roomId: number; scrollTop: number }>,
        ) {
            const {roomId, scrollTop} = action.payload;
            state.scrollPositions[roomId] = scrollTop;
        },
        setObserverTopMostVisibleMessageId(
            state,
            action: PayloadAction<{ roomId: number; messageId: number }>,
        ) {
            const {roomId, messageId} = action.payload;
            state.topmostVisibleMessageIds[roomId] = messageId;
        },
        setObserverJumpToMessageId(state, action: PayloadAction<number | null>) {
            state.jumpToMessageId = action.payload;
        },
        resetObserverChatUi() {
            return initialState;
        },
    },
});

export const {
    setObserverScrollPosition,
    setObserverTopMostVisibleMessageId,
    setObserverJumpToMessageId,
    resetObserverChatUi,
} = observerChatUiSlice.actions;

export default observerChatUiSlice.reducer;
