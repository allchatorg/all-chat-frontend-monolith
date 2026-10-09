"use client";

import React from "react";
import {useVipDialog} from "@/features/vip/useVipDialog";
import {RoomVipBadge} from "@/components/RoomVipBadge";
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import {ScrollBar} from "@/components/ui/scroll-area";
import {CardContent} from "@/components/ui/card";
import {ArrowDown, ArrowUp, Loader2, Lock} from "lucide-react";
import {Button} from "@/components/ui/button";
import ChatInput from "@/features/chatroom/components/ChatInput";
import {TypingIndicator} from "@/features/chatroom/components/TypingIndicator";
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
    participationDisabled?: boolean;
    composerDisabledReason?: string;
    isGuest: boolean;
    onGuestRegister?: () => void;

    interactionsDisabled: boolean;
    archivedRoom: boolean;
    isConnected: boolean;
    maxMessageLength: number;

    editingMessage: Message | null | undefined;
    replyingToMessage?: Message | null;
    onSendMessage: (content: string, attachment?: Attachment, editingMessageId?: number, stickerId?: string) => Promise<void>;
    onStartEditMessage?: (message: Message) => void;
    onStartReply?: (message: Message) => void;
    onCancelReply?: () => void;
    onJumpToMessage?: (messageId: number) => void;
    onEditMessage: (newContent: string) => void | Promise<void>;
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
                                                               participationDisabled = false,
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
    const openVip = useVipDialog();
    const [activeMobileMessageId, setActiveMobileMessageId] = React.useState<number | null>(null);
    const viewportRef = React.useRef<HTMLDivElement | null>(null);
    const setViewportRef = React.useCallback((node: HTMLDivElement | null) => {
        viewportRef.current = node;
        scrollRef(node);
    }, [scrollRef]);
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
        <CardContent className="py-0 px-2 flex min-h-0 flex-1 flex-col overflow-hidden" onClick={onCardClick}>
            <div className="relative min-h-0 flex-1 overflow-hidden flex flex-col">
                <ScrollAreaPrimitive.Root
                    type="scroll"
                    scrollHideDelay={600}
                    className="relative min-h-0 flex-1 overflow-hidden rounded-lg"
                >
                    {/* Keep the actual viewport ref for pagination and use block sizing for long messages. */}
                    <ScrollAreaPrimitive.Viewport
                        className="absolute inset-0 h-full w-full touch-pan-y rounded-[inherit] [&>div]:!block"
                        ref={setViewportRef}
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

                        <div data-message-list className="mx-2">
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
                                            className={`group flex w-full items-center relative transition-all duration-200 min-w-0 ${shouldDim ? 'opacity-40' : 'opacity-100'}`}>
                                            <div className="flex w-full items-center min-w-0">
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
                                            // Keep a measurable marker inside the row's existing height,
                                            // without adding a gap before a trailing ad or typing bubble.
                                            <div ref={lastMessageVisibilityRef} className="h-px -mt-px" aria-hidden="true"/>
                                        )}
                                    </div>
                                );
                            })}

                            {!deleteOnly && (
                                <TypingIndicator roomId={chatRoom.id} currentUserId={currentUserId} blockedUserIds={blockedUserIds}
                                                 enabled={!isGuest && (!composerDisabled || participationDisabled) && !archivedRoom && !interactionsDisabled}
                                                 showBubble={!chatRoom.hasNext} viewportRef={viewportRef}/>
                            )}

                            {/* Real height pulled up over the list end: a zero-height sentinel can sit a
                                sub-pixel below the scroll clip at max scroll and never intersect. */}
                            <div ref={nextMessageRef} className="h-2 -mt-2"/>
                        </div>
                    </ScrollAreaPrimitive.Viewport>
                    <ScrollBar
                        className="w-2 border-0 p-0 data-[state=hidden]:animate-out data-[state=hidden]:fade-out-0 data-[state=hidden]:duration-200 motion-reduce:animate-none [&>div]:bg-muted-foreground/50"
                    />
                </ScrollAreaPrimitive.Root>

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

            {participationDisabled && !archivedRoom ? (
                <div role="status" className="glass-surface-strong -mx-2 flex flex-col items-start gap-3 rounded-b-xl border-t border-blue-400/20 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 space-y-2">
                        <RoomVipBadge vipOnly/>
                        <p className="text-sm leading-relaxed text-muted-foreground">This is a VIP-only room. You can read messages and report content.</p>
                    </div>
                    <Button type="button" onClick={openVip} className="min-h-11 w-full shrink-0 bg-blue-600 text-white hover:bg-blue-700 sm:w-auto">Get VIP</Button>
                </div>
            ) : isGuest ? (
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
                    key={chatRoom.id}
                    typingRoomId={!deleteOnly && !interactionsDisabled ? chatRoom.id : undefined}
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
