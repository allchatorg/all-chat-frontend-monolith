"use client";

import React from "react";
import {CardContent} from "@/components/ui/card";
import {ArrowDown, ArrowUp, Loader2, Lock} from "lucide-react";
import {Button} from "@/components/ui/button";
import ChatInput from "@/features/chatroom/components/ChatInput";
import ChatMessage from "@/features/chatroom/components/ChatMessage";
import {AdvertMessage} from "@/features/chatroom/components/AdvertMessage";
import GuestBanner from "@/models/GuestBanner";
import {ChatRoom} from "@/models/ChatRoom";
import {Message} from "@/models/message";
import {Attachment} from "@/models/Attachment";
import {ConversationLike} from "@/lib/hooks/useChatScrollAndPagination";

interface PullToRefreshState {
    isPulling: boolean;
    isRefreshing: boolean;
    pullDistance: number;
}

export interface ConversationViewProps {
    chatRoom: ChatRoom;
    selectedConversation: ConversationLike | null | undefined;
    currentUserId: number;
    currentUsername: string;
    blockedUserIds: number[];

    // Pre-filtered messages (e.g. with hidden ads already removed by the caller).
    messages: Message[];
    unreadDividerMessageId: number | null;

    composerDisabled: boolean;
    composerDisabledReason?: string;
    isGuest: boolean;
    onGuestRegister?: () => void;

    interactionsDisabled: boolean;
    archivedRoom: boolean;
    isConnected: boolean;
    maxMessageLength: number;

    editingMessage: Message | null | undefined;
    replyingToMessage?: Message | null;
    onSendMessage: (content: string, attachment?: Attachment) => void;
    onStartEditMessage?: (message: Message) => void;
    onStartReply?: (message: Message) => void;
    onCancelReply?: () => void;
    onJumpToMessage?: (messageId: number) => void;
    onEditMessage: (newContent: string) => void;
    onCancelEdit: () => void;
    onRemoveMessage: (messageId: number) => Promise<void> | void;
    onHideAd?: (adId: number) => void;
    onCardClick?: () => void;

    // From useChatScrollAndPagination
    scrollRef: (node: HTMLDivElement | null) => void;
    nextMessageRef: React.RefCallback<HTMLDivElement>;
    lastMessageVisibilityRef: React.RefCallback<HTMLDivElement>;
    pullToRefreshState: PullToRefreshState;
    showJumpToPresentPill: boolean;
    fetchMessagesLoading: boolean;
    handleJumpToPresent: () => void;
    highlightData: { id: number; ts: number } | null;

    pullThreshold?: number;
    allowReport?: boolean;
    allowModView?: boolean;
    allowPromote?: boolean;
    // Observer (admin review) mode: interactions disabled but a Remove action is exposed per message.
    deleteOnly?: boolean;
    // Observer mode: also label own (right-aligned) messages with the sender's username, since the
    // viewer isn't a participant and needs to tell both sides apart.
    showOwnSenderName?: boolean;
}

const DEFAULT_PULL_THRESHOLD = 70;

const ConversationView: React.FC<ConversationViewProps> = ({
                                                               chatRoom,
                                                               currentUserId,
                                                               currentUsername,
                                                               blockedUserIds,
                                                               messages,
                                                               unreadDividerMessageId,
                                                               composerDisabled,
                                                               composerDisabledReason,
                                                               isGuest,
                                                               onGuestRegister,
                                                               interactionsDisabled,
                                                               archivedRoom,
                                                               isConnected,
                                                               maxMessageLength,
                                                               editingMessage,
                                                               replyingToMessage,
                                                               onSendMessage,
                                                               onStartEditMessage,
                                                               onStartReply,
                                                               onCancelReply,
                                                               onJumpToMessage,
                                                               onEditMessage,
                                                               onCancelEdit,
                                                               onRemoveMessage,
                                                               onHideAd,
                                                               onCardClick,
                                                               scrollRef,
                                                               nextMessageRef,
                                                               lastMessageVisibilityRef,
                                                               pullToRefreshState,
                                                               showJumpToPresentPill,
                                                               fetchMessagesLoading,
                                                               handleJumpToPresent,
                                                               highlightData,
                                                               pullThreshold = DEFAULT_PULL_THRESHOLD,
                                                               allowReport = true,
                                                               allowModView = true,
                                                               allowPromote = true,
                                                               deleteOnly = false,
                                                               showOwnSenderName = false,
                                                           }) => {
    const [activeMobileMessageId, setActiveMobileMessageId] = React.useState<number | null>(null);
    const isPastThreshold = pullToRefreshState.pullDistance >= pullThreshold;

    const lastNonAdvertIndex = (() => {
        for (let i = messages.length - 1; i >= 0; i--) {
            if (!messages[i].advert) {
                return i;
            }
        }
        return -1;
    })();

    return (
        <CardContent className="py-0 px-2 flex flex-1 flex-col overflow-hidden" onClick={onCardClick}>
            <div className="relative flex-1 overflow-hidden flex flex-col">
                <div
                    className="flex-1 overflow-y-auto overflow-x-hidden rounded-lg"
                    ref={scrollRef}
                >
                    {/* Pull-to-refresh indicator */}
                    {chatRoom.hasPrevious && (
                        <div
                            className={`pull-to-refresh-indicator w-full flex justify-center items-end overflow-hidden transition-[height] ${pullToRefreshState.isPulling ? 'duration-0' : 'duration-300 ease-out'}`}
                            style={{height: pullToRefreshState.isRefreshing ? 60 : Math.max(60, pullToRefreshState.pullDistance)}}
                        >
                            <div className="pull-to-refresh-content flex flex-col items-center justify-center pb-2">
                                {pullToRefreshState.isRefreshing ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground"/>
                                        <span className="text-xs text-muted-foreground">Loading…</span>
                                    </>
                                ) : (
                                    <>
                                        <ArrowUp
                                            className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
                                                isPastThreshold ? 'rotate-180' : ''
                                            }`}
                                        />
                                        <span className="text-xs text-muted-foreground">
                                            {isPastThreshold ? 'Release to load' : 'Pull to load more'}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <div>
                        {messages.map((message, index) => {
                            const isBeingEdited = editingMessage?.id === message.id;
                            const shouldDim = editingMessage && !isBeingEdited;
                            const isLastNonAdvert = index === lastNonAdvertIndex;
                            const highlightTimestamp = highlightData?.id === message.id ? highlightData.ts : null;

                            return (
                                <div key={message.id} data-message-id={message.id}>
                                    {unreadDividerMessageId === message.id && (
                                        <div className="flex items-center my-4 px-4">
                                            <div className="grow border-t border-red-500 opacity-60"></div>
                                            <span
                                                className="shrink-0 mx-4 text-[10px] font-bold text-red-500 uppercase tracking-widest">
                                            New Messages
                                        </span>
                                            <div className="grow border-t border-red-500 opacity-60"></div>
                                        </div>
                                    )}
                                    <div
                                        className={`group flex w-full items-center pr-2 relative transition-all duration-200 min-w-0 ${shouldDim ? 'opacity-40' : 'opacity-100'}`}>
                                        <div className="flex w-full items-center pr-2 min-w-0">
                                            {message.advert && onHideAd ?
                                                <AdvertMessage
                                                    message={message}
                                                    onHide={onHideAd}
                                                    interactionsDisabled={interactionsDisabled}
                                                /> :
                                                <ChatMessage message={message}
                                                             currentUserId={currentUserId}
                                                             currentUsername={currentUsername}
                                                             isOwn={message.senderId === currentUserId}
                                                             showOwnSenderName={showOwnSenderName}
                                                             onStartEditMessage={onStartEditMessage}
                                                             onStartReply={onStartReply}
                                                             onJumpToMessage={onJumpToMessage}
                                                             removeMessage={onRemoveMessage}
                                                             isBlocked={blockedUserIds.includes(message.senderId)}
                                                             highlightTimestamp={highlightTimestamp}
                                                             showMobileMenu={activeMobileMessageId === message.id}
                                                             onToggleMobileMenu={(show) => setActiveMobileMessageId(show ? message.id : null)}
                                                             interactionsDisabled={interactionsDisabled}
                                                             archivedRoom={archivedRoom}
                                                             allowReport={allowReport}
                                                             allowModView={allowModView}
                                                             allowPromote={allowPromote}
                                                             deleteOnly={deleteOnly}
                                                />}
                                        </div>
                                    </div>
                                    {isLastNonAdvert && (
                                        <div ref={lastMessageVisibilityRef} className="h-4"/>
                                    )}
                                </div>
                            );
                        })}

                        <div ref={nextMessageRef}/>
                    </div>
                </div>

                {showJumpToPresentPill && (
                    <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 transform">
                        <Button
                            size="icon"
                            onClick={handleJumpToPresent}
                            className="glass-control h-10 w-10 rounded-full text-foreground"
                            disabled={fetchMessagesLoading}
                        >
                            <ArrowDown className="h-5 w-5"/>
                        </Button>
                    </div>
                )}
            </div>

            {isGuest ? (
                <GuestBanner
                    onRegisterAnonymous={onGuestRegister ?? (() => {
                    })}
                />
            ) : composerDisabled ? (
                <div
                    className="glass-surface-strong glass-gradient-edge -mx-2 flex min-h-[88px] items-center justify-center rounded-b-xl rounded-t-none px-4 py-4">
                    <div
                        className="glass-control flex max-w-full items-center gap-2 rounded-full px-4 py-2 text-sm font-medium leading-snug text-foreground">
                        <Lock className="h-4 w-4 shrink-0 text-muted-foreground"/>
                        <span className="text-center">{composerDisabledReason}</span>
                    </div>
                </div>
            ) : (
                <ChatInput
                    isConnected={isConnected}
                    onSendMessage={onSendMessage}
                    maxMessageLength={maxMessageLength}
                    editingMessage={editingMessage}
                    onEditMessage={onEditMessage}
                    onCancelEdit={onCancelEdit}
                    replyingToMessage={replyingToMessage}
                    onCancelReply={onCancelReply}
                />
            )}
        </CardContent>
    );
};

export default ConversationView;
