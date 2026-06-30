import {RootState} from "@/redux/store";
import {createSelector} from "@reduxjs/toolkit";
import {PrivateChatDTO} from "@/models/PrivateChatDTO";

const compareConversations = (a: PrivateChatDTO, b: PrivateChatDTO): number => {
    const aId = a.lastMessage?.id ?? 0;
    const bId = b.lastMessage?.id ?? 0;
    if (aId !== bId) {
        return bId - aId;
    }
    const aTs = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
    const bTs = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
    return bTs - aTs;
};

export const selectPrivateConversations = createSelector(
    [
        (state: RootState) => state.privateChat.conversations,
        (state: RootState) => state.privateChatUi.conversationOrder,
    ],
    (conversations, conversationOrder) => {
        const byRecency = [...conversations].sort(compareConversations);
        if (!conversationOrder || conversationOrder.length === 0) return byRecency;

        const byId = new Map(conversations.map(c => [c.id, c]));
        const ordered: PrivateChatDTO[] = [];
        for (const id of conversationOrder) {
            const conv = byId.get(id);
            if (conv) {
                ordered.push(conv);
                byId.delete(id);
            }
        }
        // Fallback: conversations not yet in the saved order (e.g. newly
        // started) are appended at the end, newest first.
        for (const conv of byRecency) {
            if (byId.has(conv.id)) ordered.push(conv);
        }
        return ordered;
    }
);

export const selectPrivateConversationsLoading = (state: RootState) =>
    state.privateChat.conversationsLoading;

export const selectSelectedPrivateChatId = (state: RootState) =>
    state.privateChat.selectedChatId;

export const selectLoadedPrivateRooms = (state: RootState) =>
    state.privateChat.loadedRooms;

export const selectSelectedPrivateConversation = createSelector(
    [selectPrivateConversations, selectSelectedPrivateChatId],
    (conversations, selectedId) =>
        selectedId ? conversations.find(c => c.id === selectedId) ?? null : null
);

export const selectSelectedPrivateChatRoom = createSelector(
    [selectLoadedPrivateRooms, selectSelectedPrivateChatId],
    (rooms, selectedId) =>
        selectedId ? rooms.find(r => r.id === selectedId) ?? null : null
);

export const selectOpenPrivateChatTabs = createSelector(
    [
        (state: RootState) => state.privateChat.conversations,
        (state: RootState) => state.privateChatUi.openTabIds,
        (state: RootState) => state.privateChatUi.tabOrder,
    ],
    (conversations, openTabIds, tabOrder) => {
        const byId = new Map(conversations.map(c => [c.id, c]));
        const open = new Set(openTabIds);
        const ordered: PrivateChatDTO[] = [];
        for (const id of tabOrder) {
            if (open.has(id)) {
                const conv = byId.get(id);
                if (conv) ordered.push(conv);
            }
        }
        // Fallback: tabs not yet in tabOrder
        for (const id of openTabIds) {
            if (!tabOrder.includes(id)) {
                const conv = byId.get(id);
                if (conv) ordered.push(conv);
            }
        }
        return ordered;
    }
);

export const selectUserSearchResults = (state: RootState) =>
    state.privateChat.userSearchResults;

export const selectUserSearchLoading = (state: RootState) =>
    state.privateChat.userSearchLoading;

export const selectPrivateSearchedMessages = (state: RootState) =>
    state.privateChat.searchedMessages;

export const selectPrivateSearchMessagesParams = (state: RootState) =>
    state.privateChat.searchMessagesParams;

export const selectPrivateActiveRightPanel = (state: RootState) =>
    state.privateChatUi.activeRightPanel;

export const selectPrivateSidebarVisible = (state: RootState) =>
    state.privateChatUi.sidebarVisible;

export const selectPrivateStaleRoomIds = (state: RootState) =>
    state.privateChatUi.staleRoomIds;

export const selectPrivateTopMostVisibleMessageId = (state: RootState) =>
    state.privateChatUi.topmostVisibleMessageIds;

export const selectPrivateChatScrollPositions = (state: RootState) =>
    state.privateChatUi.scrollPositions;

export const selectPrivateEditingMessage = (state: RootState) =>
    state.privateChatUi.editingMessage;

export const selectPrivateReplyingToMessage = (state: RootState) =>
    state.privateChatUi.replyingToMessage;

export const selectPrivateJumpToMessageId = (state: RootState) =>
    state.privateChatUi.jumpToMessageId;

export const selectPrivateSelectedChatLoading = (state: RootState) =>
    state.privateChat.selectedChatLoading;

export const selectPrivateCreateOrOpenLoading = (state: RootState) =>
    state.privateChat.createOrOpenLoading;

export const selectPrivateHideChatLoading = (state: RootState) =>
    state.privateChat.hideChatLoading;
