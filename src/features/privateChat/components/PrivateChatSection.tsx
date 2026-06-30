"use client";

import React, {useEffect} from "react";
import {Card, CardHeader} from "@/components/ui/card";
import {PrivateChatDTO} from "@/models/PrivateChatDTO";
import {ChatRoom} from "@/models/ChatRoom";
import {Attachment} from "@/models/Attachment";
import {Role} from "@/models/Role";
import ConversationView from "@/features/chatroom/components/ConversationView";
import PrivateChatSectionHeader from "@/features/privateChat/components/PrivateChatSectionHeader";
import ChatSectionSkeleton from "@/features/chatroom/components/ChatSectionSkeleton";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {useUser} from "@/lib/hooks/useUser";
import {useChatScrollAndPagination} from "@/lib/hooks/useChatScrollAndPagination";
import {PRIVATE_CHAT_PAGING_CONFIG} from "@/lib/hooks/privateChatPagingConfig";
import {useThunk} from "@/lib/hooks/useThunk";
import {
    acknowledgePrivateMessageThunk,
    deletePrivateMessageThunk,
    editPrivateMessageThunk,
    fetchPrivateChatsThunk,
    sendPrivateMessageThunk,
} from "@/redux/privateChat/privateChatThunk";
import {selectPrivateEditingMessage, selectPrivateReplyingToMessage} from "@/redux/privateChat/privateChatSelectors";
import {
    setPrivateEditingMessage,
    setPrivateJumpToMessageId,
    setPrivateReplyingToMessage,
} from "@/redux/privateChat/privateChatUiSlice";
import {trackAttachmentUploaded, trackMessageDeleted, trackMessageSent} from "@/lib/analytics";
import {toast} from "sonner";

interface PrivateChatSectionProps {
    conversation: PrivateChatDTO;
    chatRoom: ChatRoom | null;
    currentUserId: number;
    isLoading: boolean;
    onHideConversation: () => void;
    onOpenMobileSidebar?: () => void;
}

const MAX_MESSAGE_LENGTH = 500;

const PrivateChatSection: React.FC<PrivateChatSectionProps> = ({
                                                                   conversation,
                                                                   chatRoom,
                                                                   currentUserId,
                                                                   isLoading,
                                                                   onHideConversation,
                                                                   onOpenMobileSidebar,
                                                               }) => {
    const dispatch = useDispatch<AppDispatch>();
    const {user} = useUser();
    const [sendMessage] = useThunk(sendPrivateMessageThunk);
    const [editMessage] = useThunk(editPrivateMessageThunk);
    const [removeMessage] = useThunk(deletePrivateMessageThunk);
    const [acknowledgeMessage] = useThunk(acknowledgePrivateMessageThunk);

    const editingMessage = useSelector(selectPrivateEditingMessage);
    const replyingToMessage = useSelector(selectPrivateReplyingToMessage);

    const {
        scrollRef,
        scrollToBottom,
        fetchMessagesLoading,
        nextMessageRef,
        showJumpToPresentPill,
        handleJumpToPresent,
        isLastMessageVisible,
        lastMessageVisibilityRef,
        isLastMessageInMemory,
        highlightData,
        pullToRefreshState,
    } = useChatScrollAndPagination(
        chatRoom ?? undefined,
        conversation,
        PRIVATE_CHAT_PAGING_CONFIG,
    );

    const composerDisabled = conversation.blocked;
    const composerDisabledReason = "You can't message this user.";

    const unreadDividerMessageId = React.useMemo(() => {
        if (!conversation || !chatRoom || !conversation.unreadMessagesCount) return null;

        const chatMessages = chatRoom.messages.filter(message => !message.advert);
        const lastReadId = conversation.lastReadMessage?.id;
        if (!lastReadId) {
            if (!chatRoom.hasPrevious && chatMessages.length > 0) {
                return chatMessages[0].id;
            }
            return null;
        }

        for (let i = 0; i < chatMessages.length; i++) {
            const m = chatMessages[i];
            if (m.id > lastReadId) {
                if (i > 0 && chatMessages[i - 1].id <= lastReadId) {
                    return m.id;
                }
                if (i === 0 && !chatRoom.hasPrevious) {
                    return m.id;
                }
                break;
            }
        }
        return null;
    }, [chatRoom?.messages, chatRoom?.hasPrevious, conversation.lastReadMessage?.id, conversation.unreadMessagesCount]);

    useEffect(() => {
        if (!composerDisabled || !editingMessage) return;
        dispatch(setPrivateEditingMessage(null));
    }, [composerDisabled, dispatch, editingMessage]);

    useEffect(() => {
        if (!composerDisabled || !replyingToMessage) return;
        dispatch(setPrivateReplyingToMessage(null));
    }, [composerDisabled, dispatch, replyingToMessage]);

    if (!user) {
        return <div className="p-4 text-center">Loading user data...</div>;
    }

    if (isLoading || !chatRoom) {
        return <ChatSectionSkeleton/>;
    }

    const blockedUserIds = user.blockedUsers?.map(u => u.id) || [];

    const updateLastReadMessageFunc = () => {
        if (!conversation || !chatRoom) return;
        const lastMessage = [...chatRoom.messages].reverse().find(m => !m.advert);
        if (!lastMessage) return;
        if (!conversation.lastReadMessage) {
            acknowledgeMessage({roomId: chatRoom.id, messageId: lastMessage.id});
            return;
        }
        if (conversation.lastReadMessage.id >= lastMessage.id) return;
        if (!isLastMessageVisible.current || chatRoom.hasNext) return;
        acknowledgeMessage({roomId: chatRoom.id, messageId: lastMessage.id});
    };

    const handleSendMessage = (content: string, attachment?: Attachment) => {
        try {
            trackMessageSent({
                room_id: String(chatRoom.id),
                has_attachment: Boolean(attachment),
                message_length: content?.length ?? 0,
            });
        } catch {
        }

        if (replyingToMessage) {
            dispatch(setPrivateReplyingToMessage(null));
        }

        sendMessage({
            content,
            chatRoomId: chatRoom.id,
            attachments: attachment ? [attachment] : [],
            replyToMessageId: replyingToMessage?.id,
        }).then(() => {
            if (attachment) {
                try {
                    trackAttachmentUploaded({
                        file_type: String(attachment.mime),
                        file_size: attachment.size,
                        room_id: String(chatRoom.id),
                    });
                } catch {
                }
            }
            if (isLastMessageInMemory()) {
                scrollToBottom();
            } else {
                handleJumpToPresent();
            }
        }).catch((err) => {
            if (err?.status === 403) {
                toast.error("You can't message this user.");
                // Refresh conversation list so the `blocked` flag updates
                dispatch(fetchPrivateChatsThunk());
            } else {
                toast.error(err?.message || "Failed to send message.");
            }
        });
    };

    const handleEditMessage = (newContent: string) => {
        if (!editingMessage) return;
        editMessage({messageId: editingMessage.id, editMessageRequest: {content: newContent}});
    };

    const handleCancelEdit = () => {
        dispatch(setPrivateEditingMessage(null));
    };

    const handleRemoveMessage = async (messageId: number) => {
        try {
            await removeMessage(messageId);
            trackMessageDeleted({
                room_id: String(chatRoom.id),
                message_id: String(messageId),
                deleted_by: String(currentUserId),
            });
        } catch {
        }
    };

    return (
        <Card className="glass-panel chat-section-edge flex h-full w-full flex-col rounded-t-none border-t-0">
            <CardHeader className="relative z-30 rounded-none bg-transparent p-2 px-5 shadow-none">
                <PrivateChatSectionHeader
                    conversation={conversation}
                    onHideConversation={onHideConversation}
                    onOpenMobileSidebar={onOpenMobileSidebar}
                />
            </CardHeader>

            <ConversationView
                chatRoom={chatRoom}
                selectedConversation={conversation}
                currentUserId={currentUserId}
                currentUsername={user.username}
                blockedUserIds={blockedUserIds}
                messages={chatRoom.messages}
                unreadDividerMessageId={unreadDividerMessageId}
                composerDisabled={composerDisabled}
                composerDisabledReason={composerDisabledReason}
                isGuest={user.role === Role.GUEST}
                allowReport={false}
                allowModView={false}
                interactionsDisabled={false}
                archivedRoom={false}
                isConnected={!!chatRoom}
                maxMessageLength={MAX_MESSAGE_LENGTH}
                editingMessage={editingMessage}
                replyingToMessage={replyingToMessage}
                onSendMessage={handleSendMessage}
                onStartEditMessage={(message) => dispatch(setPrivateEditingMessage(message))}
                onStartReply={(message) => dispatch(setPrivateReplyingToMessage(message))}
                onCancelReply={() => dispatch(setPrivateReplyingToMessage(null))}
                onJumpToMessage={(messageId) => dispatch(setPrivateJumpToMessageId(messageId))}
                onEditMessage={handleEditMessage}
                onCancelEdit={handleCancelEdit}
                onRemoveMessage={handleRemoveMessage}
                onCardClick={updateLastReadMessageFunc}
                scrollRef={scrollRef}
                nextMessageRef={nextMessageRef}
                lastMessageVisibilityRef={lastMessageVisibilityRef}
                pullToRefreshState={pullToRefreshState}
                showJumpToPresentPill={showJumpToPresentPill}
                fetchMessagesLoading={fetchMessagesLoading}
                handleJumpToPresent={handleJumpToPresent}
                highlightData={highlightData}
            />
        </Card>
    );
};

export default PrivateChatSection;
