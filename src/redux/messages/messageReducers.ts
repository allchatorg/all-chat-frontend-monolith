import {Message} from "@/models/message";
import {ChatRoom} from "@/models/ChatRoom";
import {Reaction} from "@/models/Reaction";
import {ReactionUpdateResponse} from "@/models/ReactionUpdateResponse";

export function addReactionRequestToMessage(
    message: Message,
    reactionRequest: ReactionUpdateResponse,
    reactedByCurrentUser: boolean
): Message {
    const reactionIndex = message.reactions.findIndex(r => r.emoji === reactionRequest.emoji);
    const userMinimal = {
        id: reactionRequest.reactedBy.id,
        username: reactionRequest.reactedBy.username,
    };
    const userCount = (message.reactions[reactionIndex]?.usersCount || 0) + 1;

    if (reactionIndex >= 0) {
        return {
            ...message,
            reactions: message.reactions.map((r, index) =>
                index === reactionIndex
                    ? {
                        ...r,
                        usersCount: userCount,
                        reactedByCurrentUser: reactedByCurrentUser,
                        users: r.users ? [...r.users, userMinimal] : [userMinimal],
                    }
                    : r
            ),
        };
    }

    const newReaction: Reaction = {
        id: reactionRequest.reactionId,
        messageId: reactionRequest.messageId,
        emoji: reactionRequest.emoji,
        emojiId: reactionRequest.emojiId,
        usersCount: 1,
        reactedByCurrentUser: reactedByCurrentUser,
        users: [userMinimal],
    };
    return {
        ...message,
        reactions: [...message.reactions, newReaction],
    };
}

export function removeReactionRequestFromMessage(
    message: Message,
    reactionRequest: ReactionUpdateResponse
): Message {
    const reactionIndex = message.reactions.findIndex(r => r.emoji === reactionRequest.emoji);
    if (reactionIndex === -1) {
        return message;
    }

    const existingReaction = message.reactions[reactionIndex];
    const userCount = Math.max((existingReaction.usersCount || 1) - 1, 0);
    const updatedUsers = existingReaction.users?.filter(user => user.id !== reactionRequest.reactedBy.id) || [];
    const reactedByCurrentUser = updatedUsers.some(user => user.id === reactionRequest.reactedBy.id);

    if (userCount === 0) {
        return {
            ...message,
            reactions: message.reactions.filter((_, index) => index !== reactionIndex),
        };
    }
    return {
        ...message,
        reactions: message.reactions.map((r, index) =>
            index === reactionIndex
                ? {
                    ...r,
                    usersCount: userCount,
                    reactedByCurrentUser: reactedByCurrentUser,
                    users: updatedUsers,
                }
                : r
        ),
    };
}

export function addChatRoomReaction(
    chatRoom: ChatRoom,
    reactionRequest: ReactionUpdateResponse,
    reactedByCurrentUser: boolean
): ChatRoom {
    if (chatRoom.id !== reactionRequest.chatroomId) {
        return chatRoom;
    }
    return {
        ...chatRoom,
        messages: chatRoom.messages.map(message =>
            message.id === reactionRequest.messageId
                ? addReactionRequestToMessage(message, reactionRequest, reactedByCurrentUser)
                : message
        ),
    };
}

export function removeChatRoomReaction(
    chatRoom: ChatRoom,
    reactionRequest: ReactionUpdateResponse
): ChatRoom {
    if (chatRoom.id !== reactionRequest.chatroomId) {
        return chatRoom;
    }
    return {
        ...chatRoom,
        messages: chatRoom.messages.map(message =>
            message.id === reactionRequest.messageId
                ? removeReactionRequestFromMessage(message, reactionRequest)
                : message
        ),
    };
}

/**
 * Updates the reply previews of all messages that reference an edited message so
 * they show its latest content. Previews with hidden content (null) stay hidden.
 */
export function patchReplyPreviewsForEditedMessage(messages: Message[], edited: Message): Message[] {
    return messages.map(message =>
        message.replyTo?.id === edited.id && message.replyTo.content !== null
            ? {
                ...message,
                replyTo: {
                    ...message.replyTo,
                    content: edited.content,
                    // Removing an attachment is broadcast as an edit, so refresh the flag/name too
                    hasAttachment: (edited.attachments?.length ?? 0) > 0,
                    attachmentName: edited.attachments?.[0]?.name ?? null,
                },
            }
            : message
    );
}

/**
 * Marks the reply previews of all messages that reference a deleted message.
 * Staff viewers keep the content (matching how they keep seeing deleted
 * messages); regular viewers get the "Message removed" placeholder.
 */
export function patchReplyPreviewsForDeletedMessage(
    messages: Message[],
    deletedMessageId: number,
    retainContent: boolean
): Message[] {
    return messages.map(message =>
        message.replyTo?.id === deletedMessageId
            ? {
                ...message,
                replyTo: {
                    ...message.replyTo,
                    deleted: true,
                    content: retainContent ? message.replyTo.content : null,
                },
            }
            : message
    );
}

export function getLastNonAdvertMessage(messages: Message[]): Message | null {
    for (let i = messages.length - 1; i >= 0; i--) {
        if (!messages[i].advert) {
            return messages[i];
        }
    }
    return null;
}
