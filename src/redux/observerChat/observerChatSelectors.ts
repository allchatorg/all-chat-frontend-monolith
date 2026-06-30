import {RootState} from "@/redux/store";
import {createSelector} from "@reduxjs/toolkit";

export const selectObserverTargetUserId = (state: RootState) =>
    state.observerChat.targetUserId;

export const selectObserverConversations = (state: RootState) =>
    state.observerChat.conversations;

export const selectObserverConversationsLoading = (state: RootState) =>
    state.observerChat.conversationsLoading;

export const selectObserverConversationsPage = (state: RootState) =>
    state.observerChat.conversationsPage;

export const selectObserverSearchTerm = (state: RootState) =>
    state.observerChat.searchTerm;

export const selectObserverMessageSearchResults = (state: RootState) =>
    state.observerChat.messageSearchResults;

export const selectObserverMessageSearchParams = (state: RootState) =>
    state.observerChat.messageSearchParams;

export const selectObserverMessageSearchLoading = (state: RootState) =>
    state.observerChat.messageSearchLoading;

export const selectObserverMessageSearchOpen = (state: RootState) =>
    state.observerChat.messageSearchOpen;

export const selectSelectedObserverChatId = (state: RootState) =>
    state.observerChat.selectedChatId;

export const selectLoadedObserverRooms = (state: RootState) =>
    state.observerChat.loadedRooms;

export const selectObserverSelectedChatLoading = (state: RootState) =>
    state.observerChat.selectedChatLoading;

export const selectSelectedObserverConversation = createSelector(
    [selectObserverConversations, selectSelectedObserverChatId],
    (conversations, selectedId) =>
        selectedId ? conversations.find(c => c.roomId === selectedId) ?? null : null,
);

export const selectSelectedObserverChatRoom = createSelector(
    [selectLoadedObserverRooms, selectSelectedObserverChatId],
    (rooms, selectedId) =>
        selectedId ? rooms.find(r => r.id === selectedId) ?? null : null,
);

export const selectObserverScrollPositions = (state: RootState) =>
    state.observerChatUi.scrollPositions;

export const selectObserverJumpToMessageId = (state: RootState) =>
    state.observerChatUi.jumpToMessageId;
