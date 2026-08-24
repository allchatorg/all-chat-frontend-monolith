import {Message} from '@/models/message';
import {ChatRoom} from '@/models/ChatRoom';
import {AdPlacement} from '@/models/AdPlacement';

export type AdChatRoom = Pick<ChatRoom, 'id' | 'name' | 'messages'> & Partial<Pick<ChatRoom, 'hasPrevious' | 'hasNext'>>;

function findNonAdvertMessageIndex(messages: Message[], messageId: number): number {
    return messages.findIndex(message => !message.advert && message.id === messageId);
}

// Resolves where the advert belongs in the loaded message window, or null when
// the placement anchor is not part of the window.
export function getAdvertInsertIndex(messages: Message[], placement: AdPlacement): number | null {
    const hasNonAdvertMessages = messages.some(message => !message.advert);

    // Placed in an empty room: the advert belongs at the top, before whatever
    // message arrives first (ensurePlacement then pins it via beforeMessageId).
    if (placement.afterMessageId === null && placement.beforeMessageId === null) {
        return hasNonAdvertMessages ? 0 : messages.length;
    }

    if (placement.afterMessageId !== null) {
        const afterIndex = findNonAdvertMessageIndex(messages, placement.afterMessageId);
        return afterIndex === -1 ? null : afterIndex + 1;
    }

    if (placement.beforeMessageId !== null) {
        const beforeIndex = findNonAdvertMessageIndex(messages, placement.beforeMessageId);
        return beforeIndex === -1 ? null : beforeIndex;
    }

    return null;
}

// True only when the anchor message provably no longer exists: it falls inside
// the loaded id range but is missing, or lies beyond an edge of the room that
// has no further pages. An anchor merely outside the loaded window (older or
// newer than what is paginated in) is NOT gone — the placement must be kept.
export function isAnchorDeleted(chatRoom: AdChatRoom, placement: AdPlacement): boolean {
    const anchorId = placement.afterMessageId ?? placement.beforeMessageId;
    if (anchorId === null) return false;

    const chatMessages = chatRoom.messages.filter(message => !message.advert);
    if (chatMessages.length === 0) return false;
    if (chatMessages.some(message => message.id === anchorId)) return false;

    const firstId = chatMessages[0].id;
    const lastId = chatMessages[chatMessages.length - 1].id;

    if (anchorId > firstId && anchorId < lastId) return true;
    if (anchorId < firstId && chatRoom.hasPrevious === false) return true;
    return anchorId > lastId && chatRoom.hasNext === false;
}

// Anchors the advert after the last non-advert message currently loaded.
export function createPlacement(ad: Message, chatRoom: AdChatRoom): AdPlacement {
    const chatMessages = chatRoom.messages.filter(message => !message.advert);
    const lastMessage = chatMessages[chatMessages.length - 1] ?? null;

    return {
        adId: ad.id,
        chatRoomId: chatRoom.id,
        afterMessageId: lastMessage?.id ?? null,
        beforeMessageId: null,
        placedAt: new Date().toISOString(),
    };
}

export function buildAdvertMessage(ad: Message, chatRoom: AdChatRoom, placement: AdPlacement): Message {
    return {
        ...ad,
        chatRoomId: chatRoom.id,
        chatRoomName: chatRoom.name,
        createdAt: new Date(placement.placedAt),
        advert: true,
    };
}

// Render-time composition: the advert is never stored in chatRoom.messages.
export function composeMessagesWithAd(
    chatRoom: AdChatRoom,
    ad: Message | null,
    placement: AdPlacement | undefined,
    hiddenAdIds: number[]
): Message[] {
    const messages = chatRoom.messages.filter(message => !message.advert);

    if (!ad || !placement || placement.adId !== ad.id || placement.chatRoomId !== chatRoom.id || hiddenAdIds.includes(ad.id)) {
        return messages;
    }

    let insertIndex = getAdvertInsertIndex(messages, placement);
    if (insertIndex === null) {
        // Anchor not loaded: keep the advert off-screen with its placement intact
        // (it reappears when the user paginates back to it). Only a deleted anchor
        // falls back to the tail — ensurePlacement persists that re-anchor.
        if (!isAnchorDeleted(chatRoom, placement)) {
            return messages;
        }
        insertIndex = messages.length;
    }
    const advertMessage = buildAdvertMessage(ad, chatRoom, placement);

    return [
        ...messages.slice(0, insertIndex),
        advertMessage,
        ...messages.slice(insertIndex),
    ];
}
