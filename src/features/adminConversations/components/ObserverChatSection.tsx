"use client";

import React from "react";
import {Card, CardHeader} from "@/components/ui/card";
import {AdminConversationDTO} from "@/models/AdminConversationDTO";
import {ChatRoom} from "@/models/ChatRoom";
import ConversationView from "@/features/chatroom/components/ConversationView";
import ChatSectionSkeleton from "@/features/chatroom/components/ChatSectionSkeleton";
import ObserverChatHeader from "@/features/adminConversations/components/ObserverChatHeader";
import {useDispatch} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {useUser} from "@/lib/hooks/useUser";
import {useChatScrollAndPagination} from "@/lib/hooks/useChatScrollAndPagination";
import {OBSERVER_CHAT_PAGING_CONFIG} from "@/lib/hooks/observerChatPagingConfig";
import {useThunk} from "@/lib/hooks/useThunk";
import {deleteObserverMessageThunk} from "@/redux/observerChat/observerChatThunk";
import {removeObserverConversation} from "@/redux/observerChat/observerChatSlice";
import {toast} from "sonner";

interface ObserverChatSectionProps {
    conversation: AdminConversationDTO;
    chatRoom: ChatRoom | null;
    isLoading: boolean;
    onOpenMobileSidebar?: () => void;
}

const MAX_MESSAGE_LENGTH = 500;

const ObserverChatSection: React.FC<ObserverChatSectionProps> = ({
                                                                     conversation,
                                                                     chatRoom,
                                                                     isLoading,
                                                                     onOpenMobileSidebar,
                                                                 }) => {
    const dispatch = useDispatch<AppDispatch>();
    const {user} = useUser();
    const [removeMessage] = useThunk(deleteObserverMessageThunk);

    // The hook only needs id + lastMessage from the "conversation" (ConversationLike).
    const conversationLike = React.useMemo(
        () => ({id: conversation.roomId, lastMessage: conversation.lastMessage}),
        [conversation.roomId, conversation.lastMessage],
    );

    const {
        scrollRef,
        fetchMessagesLoading,
        nextMessageRef,
        showJumpToPresentPill,
        handleJumpToPresent,
        lastMessageVisibilityRef,
        highlightData,
        pullToRefreshState,
    } = useChatScrollAndPagination(
        chatRoom ?? undefined,
        conversationLike,
        OBSERVER_CHAT_PAGING_CONFIG,
    );

    if (!user) {
        return <div className="p-4 text-center">Loading user data...</div>;
    }

    if (isLoading || !chatRoom) {
        return <ChatSectionSkeleton/>;
    }

    const handleRemoveMessage = async (messageId: number) => {
        try {
            await removeMessage({roomId: conversation.roomId, messageId});
            toast.success("Message deleted.");
        } catch (err: any) {
            if (err?.status === 403) {
                toast.error("This conversation is no longer available.");
                dispatch(removeObserverConversation(conversation.roomId));
            } else {
                toast.error(err?.message || "Failed to delete message.");
            }
        }
    };

    const noop = () => {
    };

    return (
        <Card className="glass-panel chat-section-edge flex h-full w-full flex-col rounded-t-none border-t-0">
            <CardHeader className="relative z-30 rounded-none bg-transparent p-2 px-5 shadow-none">
                <ObserverChatHeader
                    conversation={conversation}
                    onOpenMobileSidebar={onOpenMobileSidebar}
                />
            </CardHeader>

            <ConversationView
                chatRoom={chatRoom}
                selectedConversation={conversationLike}
                // Anchor the layout on the reviewed user so THEIR messages render right-aligned
                // (the observer isn't a participant). showOwnSenderName labels that side too.
                currentUserId={conversation.target.id}
                currentUsername={conversation.target.username}
                showOwnSenderName={true}
                blockedUserIds={[]}
                messages={chatRoom.messages}
                unreadDividerMessageId={null}
                composerDisabled={true}
                composerDisabledReason="Read-only observer view — you can't send messages."
                isGuest={false}
                allowReport={false}
                interactionsDisabled={true}
                deleteOnly={true}
                archivedRoom={false}
                isConnected={!!chatRoom}
                maxMessageLength={MAX_MESSAGE_LENGTH}
                editingMessage={null}
                onSendMessage={noop}
                onEditMessage={noop}
                onCancelEdit={noop}
                onRemoveMessage={handleRemoveMessage}
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

export default ObserverChatSection;
