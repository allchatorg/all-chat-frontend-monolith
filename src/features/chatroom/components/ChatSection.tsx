"use client";

import React, {useEffect} from "react";
import {Card, CardHeader} from "@/components/ui/card";
import {ChatRoom} from "@/models/ChatRoom";
import {Attachment} from "@/models/Attachment";
import {useUser} from "@/lib/hooks/useUser";
import ChatSectionHeader from "@/features/chatroom/components/ChatSectionHeader";
import ConversationView from "@/features/chatroom/components/ConversationView";
import {UserChatRoom} from "@/models/UserChatRoom";
import {useLastReadMessage} from "@/lib/hooks/useLastReadMessage";
import {useChatScrollAndPagination} from "@/lib/hooks/useChatScrollAndPagination";
import {useThunk} from "@/lib/hooks/useThunk";
import {deleteMessageThunk, editMessageThunk, saveAndBroadcastMessageThunk} from "@/redux/chatRoom/chatRoomThunk";
import {usePopularitySidebar} from "@/lib/hooks/usePopularitySidebar";
import {Role} from "@/models/Role";
import {useRouter} from "next/navigation";
import {ROUTES} from "@/routes";
import ChatSectionSkeleton from "@/features/chatroom/components/ChatSectionSkeleton";
import {ChatRoomNoiseLevelEnum} from "@/models/ChatRoomNoiseLevelEnum";
import {useDispatch, useSelector} from "react-redux";
import {selectEditingMessage, selectReplyingToMessage} from "@/redux/chatRoom/chatRoomSelectors";
import {AppDispatch} from "@/redux/store";
import {setEditingMessage, setJumpToMessageId, setReplyingToMessage} from "@/redux/chatRoom/chatRoomUiSlice";
import {trackAttachmentUploaded, trackMessageDeleted, trackMessageSent} from "@/lib/analytics";
import {useAdServing} from "@/hooks/useAdServing";
import {hideAd} from '@/redux/ads/adsSlice';
import {selectHiddenAdIds} from '@/redux/ads/adsSelectors';
import {usePageVisibility} from "@/lib/hooks/usePageVisibility";
import {selectMessagingAvailability} from "@/redux/messagingAvailability/messagingAvailabilitySelectors";


interface ChatSectionProps {
    chatRoom: ChatRoom;
    currentUserId: number;
    isLoading: boolean
    selectedUserChatRoom: UserChatRoom | null | undefined,
    className?: string;
}

const MAX_MESSAGE_LENGTH = 500;

const ChatSection: React.FC<ChatSectionProps> = ({
                                                     chatRoom,
                                                     currentUserId,
                                                     selectedUserChatRoom,
                                                     isLoading,
                                                 }) => {
    const dispatch = useDispatch<AppDispatch>();
    const {user} = useUser();
    const router = useRouter();
    const [sendMessageThunk] = useThunk(saveAndBroadcastMessageThunk);
    const [removeMessage] = useThunk(deleteMessageThunk);
    const [editMessage] = useThunk(editMessageThunk);

    const isConnected = !!chatRoom;

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
    } = useChatScrollAndPagination(chatRoom, selectedUserChatRoom);

    const {
        isActive: popularitySidebarActive,
        toggleSidebar: onTogglePopularitySidebar,
    } = usePopularitySidebar();

    const {updateLastReadMessageFunc} = useLastReadMessage(chatRoom, selectedUserChatRoom, isLastMessageVisible);

    const editingMessage = useSelector(selectEditingMessage);
    const replyingToMessage = useSelector(selectReplyingToMessage);
    const messagingAvailability = useSelector(selectMessagingAvailability);
    const messagingDisabledReason = messagingAvailability.disabledReason ?? "Messaging is temporarily disabled until a moderator is online.";
    const composerDisabled = Boolean(chatRoom?.isArchived || messagingAvailability.messagingBlocked);
    const composerDisabledReason = chatRoom?.isArchived
        ? "This room is archived. Messaging is disabled."
        : messagingDisabledReason;

    const {getAd, currentAd} = useAdServing();

    const isVisible = usePageVisibility();

    const getAdRef = React.useRef(getAd);
    const isFetchingAd = React.useRef(false);

    const messagePlacementSignature = React.useMemo(() => {
        return chatRoom?.messages
            .filter(message => !message.advert)
            .map(message => message.id)
            .join(":") ?? "";
    }, [chatRoom?.messages]);

    const unreadDividerMessageId = React.useMemo(() => {
        if (!selectedUserChatRoom || !chatRoom || !selectedUserChatRoom.unreadMessagesCount) return null;

        const chatMessages = chatRoom.messages.filter(message => !message.advert);
        const lastReadId = selectedUserChatRoom.lastReadMessage?.id;
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
    }, [chatRoom?.messages, chatRoom?.hasPrevious, selectedUserChatRoom?.lastReadMessage?.id, selectedUserChatRoom?.unreadMessagesCount]);

    useEffect(() => {
        getAdRef.current = getAd;
    }, [getAd]);

    useEffect(() => {
        if (!composerDisabled || !editingMessage) return;

        dispatch(setEditingMessage(null));
    }, [composerDisabled, dispatch, editingMessage]);

    useEffect(() => {
        if (!composerDisabled || !replyingToMessage) return;

        dispatch(setReplyingToMessage(null));
    }, [composerDisabled, dispatch, replyingToMessage]);

    useEffect(() => {
        if (!user || !chatRoom) return;

        if (!isVisible) return;

        const fetchAndSetAd = async () => {
            if (isFetchingAd.current) return;
            isFetchingAd.current = true;

            try {
                await getAdRef.current(chatRoom);
            } finally {
                isFetchingAd.current = false;
            }
        };

        fetchAndSetAd();

        const intervalId = setInterval(fetchAndSetAd, 10000);

        return () => clearInterval(intervalId);
    }, [user?.id, chatRoom?.id, chatRoom?.name, isVisible]);

    useEffect(() => {
        if (!user || !chatRoom || !isVisible || !currentAd) return;

        void getAdRef.current(chatRoom, {fetchIfNeeded: false});
    }, [user?.id, chatRoom?.id, isVisible, currentAd?.id, messagePlacementSignature]);


    if (!user) {
        return <div className="p-4 text-center">Loading user data...</div>;
    }

    const noiseLevel = selectedUserChatRoom?.roomPopulation.noiseLevel || ChatRoomNoiseLevelEnum.CONVERSATIONAL;

    const handleSendMessage = (messageContent: string, attachment?: Attachment) => {
        try {
            trackMessageSent({
                room_id: String(chatRoom.id),
                has_attachment: Boolean(attachment),
                message_length: messageContent?.length ?? 0,
            });
        } catch {
        }

        const messageToSend = {
            content: messageContent,
            chatRoomId: chatRoom.id,
            attachments: attachment ? [attachment] : [],
            replyToMessageId: replyingToMessage?.id,
        };

        if (replyingToMessage) {
            dispatch(setReplyingToMessage(null));
        }

        sendMessageThunk(messageToSend).then(() => {
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
        })
    };

    const handleEditMessage = (newContent: string) => {
        if (!editingMessage) return;

        editMessage({messageId: editingMessage.id, editMessageRequest: {content: newContent}})
    }

    const handleCancelEdit = () => {
        dispatch(setEditingMessage(null));
    }

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

    const hiddenAdIds = useSelector(selectHiddenAdIds);

    const handleHideAd = (adId: number) => {
        dispatch(hideAd(adId));
    };

    const allMessages = () => {
        if (!chatRoom) return [];

        const messages = chatRoom.messages.filter(message =>
            !message.advert || !hiddenAdIds.includes(message.id)
        );
        return messages;
    }

    const blockedUserIds = React.useMemo(() => {
        return user?.blockedUsers?.map(u => u.id) || [];
    }, [user?.blockedUsers]);

    if (isLoading || !chatRoom || !selectedUserChatRoom)
        return (<ChatSectionSkeleton/>)

    return (
        <Card
            className="glass-panel chat-section-edge flex h-full w-full flex-col rounded-t-none border-t-0"
        >
            <CardHeader className="relative z-30 rounded-none bg-transparent p-2 px-5 shadow-none">
                <ChatSectionHeader
                    chatRoomId={chatRoom.id}
                    chatRoomName={chatRoom.name}
                    isArchived={chatRoom.isArchived}
                    totalMessages={chatRoom.totalMessages}
                    noiseLevel={noiseLevel}
                    popularitySidebarActive={popularitySidebarActive}
                    onTogglePopularitySidebar={onTogglePopularitySidebar}
                />
            </CardHeader>

            <ConversationView
                chatRoom={chatRoom}
                selectedConversation={selectedUserChatRoom}
                currentUserId={currentUserId}
                currentUsername={user.username}
                blockedUserIds={blockedUserIds}
                messages={allMessages()}
                unreadDividerMessageId={unreadDividerMessageId}
                composerDisabled={composerDisabled}
                composerDisabledReason={composerDisabledReason}
                isGuest={user.role === Role.GUEST}
                onGuestRegister={() => router.push(ROUTES.REGISTER_ANONYMOUS)}
                interactionsDisabled={chatRoom.isArchived}
                archivedRoom={chatRoom.isArchived}
                isConnected={isConnected}
                maxMessageLength={MAX_MESSAGE_LENGTH}
                editingMessage={editingMessage}
                replyingToMessage={replyingToMessage}
                onSendMessage={handleSendMessage}
                onStartEditMessage={(message) => dispatch(setEditingMessage(message))}
                onStartReply={(message) => dispatch(setReplyingToMessage(message))}
                onCancelReply={() => dispatch(setReplyingToMessage(null))}
                onJumpToMessage={(messageId) => dispatch(setJumpToMessageId(messageId))}
                onEditMessage={handleEditMessage}
                onCancelEdit={handleCancelEdit}
                onRemoveMessage={handleRemoveMessage}
                onHideAd={handleHideAd}
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

export default ChatSection;
