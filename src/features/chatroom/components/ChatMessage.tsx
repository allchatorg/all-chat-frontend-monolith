import {useRoomParticipation} from "@/lib/hooks/useRoomParticipation";
import React from "react";
import MessageItem from "@/features/chatroom/components/MessageItem";
import {MessageMenu} from "@/features/chatroom/components/MessageMenu";
import {Message} from "@/models/message";
import {ReactionButton} from "@/features/chatroom/components/ReactionButton";
import {useThunk} from "@/lib/hooks/useThunk";
import {deleteReactionThunk, reactToMessageThunk} from "@/redux/chatRoom/chatRoomThunk";
import {MessageTimestamp} from "@/features/chatroom/components/MessageTimestamp";
import {removeAttachmentFromMessage} from "@/api/chatting/chattingAPI";
import {CountryFlag} from "@/features/chatroom/components/CountryFlag";
import {UserActionPopup} from "@/features/chatroom/components/UserActionPopup";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import ReplyPreview from "@/features/chatroom/components/ReplyPreview";
import {useSelector} from "react-redux";
import {selectUser} from "@/redux/user/userSelectors";
import {getCustomReaction, isCustomReactionToken} from "@/features/stickers/catalog";
import {useVipDialog} from "@/features/vip/useVipDialog";
import {toast} from "sonner";

interface ChatMessageProps {
    message: Message;
    currentUserId: number;
    currentUsername: string;
    isOwn: boolean;
    removeMessage: (messageId: number) => void;
    isBlocked?: boolean;
    highlightTimestamp?: number | null;
    showMobileMenu?: boolean;
    onToggleMobileMenu?: (show: boolean) => void;
    interactionsDisabled?: boolean;
    archivedRoom?: boolean;
    allowReport?: boolean;
    allowModView?: boolean;
    allowPromote?: boolean;
    // Switches the message into edit mode. Supplied by the parent section so the correct
    // editing state (public vs. private chat slice) is updated.
    onStartEditMessage?: (message: Message) => void;
    // Starts a reply to this message. Supplied by the parent section so the correct
    // replying state (public vs. private chat slice) is updated.
    onStartReply?: (message: Message) => void;
    // Jumps to the replied-to message when the reply preview is clicked.
    onJumpToMessage?: (messageId: number) => void;
    // Observer (admin review) mode: interactions stay disabled, but a single Remove action
    // is available for messages the viewer outranks.
    deleteOnly?: boolean;
    // Observer mode: label own (right-aligned) messages with the sender's username too.
    showOwnSenderName?: boolean;
}

const REACTION_GESTURE_BLOCK_SELECTOR = [
    "a",
    "button",
    "input",
    "textarea",
    "select",
    "[contenteditable='true']",
    "[role='button']",
    "[data-message-item-interaction='true']",
    "[data-message-reaction-block='true']",
].join(",");

const isReactionGestureBlockedTarget = (target: EventTarget | null) => (
    target instanceof HTMLElement && Boolean(target.closest(REACTION_GESTURE_BLOCK_SELECTOR))
);

const ChatMessage: React.FC<ChatMessageProps> = ({
                                                     message,
                                                     currentUserId,
                                                     currentUsername,
                                                     isOwn,
                                                     removeMessage,
                                                     isBlocked = false,
                                                     highlightTimestamp = null,
                                                     showMobileMenu = false,
                                                     onToggleMobileMenu,
                                                     interactionsDisabled = false,
                                                     archivedRoom = false,
                                                     allowReport = true,
                                                     allowModView = true,
                                                     allowPromote = true,
                                                     onStartEditMessage,
                                                     onStartReply,
                                                     onJumpToMessage,
                                                     deleteOnly = false,
                                                     showOwnSenderName = false,
                                                 }) => {

    const [reactToMessage] = useThunk(reactToMessageThunk);
    const participationDisabled = useRoomParticipation(message.chatRoomId, message.chatRoomVipOnly);
    const [deleteReaction] = useThunk(deleteReactionThunk);
    const vipActive = useSelector(selectUser)?.vipActive === true;
    const openVip = useVipDialog();
    const reactionPendingRef = React.useRef(false);
    const [isRevealed, setIsRevealed] = React.useState(false);
    const [isBlinking, setIsBlinking] = React.useState(false);
    const [isReactionPopoverOpen, setIsReactionPopoverOpen] = React.useState(false);

    // Track last tap time for double-tap detection
    const lastTapTimeRef = React.useRef<number>(0);

    const isMobile = useIsMobile();
    const isMenuVisible = showMobileMenu || isReactionPopoverOpen;
    const menuVisibilityClass = isMobile
        ? (isMenuVisible ? 'flex opacity-100' : 'hidden')
        : (isReactionPopoverOpen ? 'flex opacity-100 pointer-events-auto' : 'flex opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto');
    const popoverSelectionClass = isReactionPopoverOpen ? 'select-none' : '';

    React.useEffect(() => {
        if (participationDisabled) setIsReactionPopoverOpen(false);
    }, [participationDisabled]);

    const handleReactionPopoverOpenChange = (open: boolean) => {
        setIsReactionPopoverOpen(open);

        if (open && isMobile && onToggleMobileMenu) {
            onToggleMobileMenu(true);
        }
    };

    const handleMessageClick = () => {
        // In delete-only (observer) mode interactions are otherwise disabled, but a tap must still
        // reveal the menu on mobile so the Remove action is reachable.
        if (interactionsDisabled && !archivedRoom && !deleteOnly) {
            return;
        }

        if (isMobile && onToggleMobileMenu) {
            onToggleMobileMenu(!showMobileMenu);
        }
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        // Touches inside the portaled action sheet bubble here through React; they aren't message taps.
        if (participationDisabled || interactionsDisabled || !(e.target instanceof Node) || !e.currentTarget.contains(e.target)
            || isReactionGestureBlockedTarget(e.target)) {
            return;
        }

        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTimeRef.current;

        // Reset if more than 300ms passed between taps
        if (tapLength > 0 && tapLength < 300) {
            e.preventDefault();
            e.stopPropagation();
            void updateMessageReaction(message.id, "👍", "+1").catch(showReactionError);
            // Reset to prevent a third tap from triggering another double-tap immediately
            lastTapTimeRef.current = 0;
        } else {
            lastTapTimeRef.current = currentTime;
        }
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (participationDisabled || interactionsDisabled || isReactionGestureBlockedTarget(e.target)) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        void updateMessageReaction(message.id, "👍", "+1").catch(showReactionError);
    };

    React.useEffect(() => {
        if (highlightTimestamp) {
            setIsBlinking(false);
            const t1 = setTimeout(() => setIsBlinking(true), 10);
            const t2 = setTimeout(() => setIsBlinking(false), 2000);
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
            };
        }
    }, [highlightTimestamp]);

    const blinkClass = isBlinking ? 'animate-message-blink rounded-lg' : '';

    const showReactionError = (error: unknown) => {
        toast.error(error instanceof Error ? error.message : 'Could not update your reaction. Please try again.');
    };

    const updateMessageReaction = async (messageId: number, emoji: string, emojiId: string): Promise<void> => {
        if (reactionPendingRef.current || participationDisabled || interactionsDisabled || archivedRoom || message.deleted) return;
        const existingReaction = message.reactions.find(reaction => reaction.emoji === emoji);
        const removing = existingReaction?.reactedByCurrentUser === true;
        if (isCustomReactionToken(emoji) || isCustomReactionToken(emojiId)) {
            if (!getCustomReaction(emoji) || emoji !== emojiId) throw new Error('This character reaction is unavailable.');
            if (!removing && !vipActive) {
                setIsReactionPopoverOpen(false);
                openVip();
                return;
            }
        }
        reactionPendingRef.current = true;
        try {
            if (removing) {
                await deleteReaction({messageId, emoji, emojiId});
            } else {
                await reactToMessage({messageId, emoji, emojiId});
            }
        } finally {
            reactionPendingRef.current = false;
        }
    };

    const handleEditMessage = (message: Message) => {
        if (participationDisabled) return;
        onStartEditMessage?.(message);
    };

    const handleRemoveAttachment = async (attachmentId: number) => {
        if (participationDisabled) return;
        try {
            await removeAttachmentFromMessage(message.id, {attachmentId});
        } catch (error) {
            console.error("Failed to remove attachment:", error);
        }
    };

    if (isBlocked && !isRevealed && !isOwn) {
        return (
            <div
                className={`flex w-full items-start group lg:hover:bg-white/20 dark:lg:hover:bg-white/10 py-1 rounded-md transition-colors ${blinkClass}`}>
                <div className="max-w-[70%] min-w-0 flex flex-col justify-start">
                    <div
                        className="pb-1 px-1 text-xs font-medium transition-colors text-muted-foreground flex items-center gap-1">
                        <span>Blocked User</span>
                    </div>
                    <div
                        className="glass-surface mb-1 text-muted-foreground rounded-lg p-3 text-sm italic flex flex-wrap items-center gap-3">
                        <span>Blocked Message</span>
                        {!interactionsDisabled && (
                            <button
                                onClick={() => setIsRevealed(true)}
                                className="cursor-pointer text-xs font-medium text-primary hover:underline focus:outline-hidden"
                            >
                                Show Message
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (isOwn) {
        return (
            <div
                onClick={handleMessageClick}
                onTouchStart={handleTouchStart}
                onDoubleClick={handleDoubleClick}
                className={`flex w-full items-center justify-end group lg:hover:bg-white/20 dark:lg:hover:bg-white/10 ${isMobile && isMenuVisible ? 'bg-white/20 dark:bg-white/10' : ''} ${popoverSelectionClass} py-1 rounded-md transition-colors min-w-0 max-w-full ${blinkClass}`}>
                <div className="flex w-full min-w-0 flex-col items-end">
                    {message.replyTo && (
                        <div className="w-fit max-w-[70%] min-w-0">
                            <ReplyPreview replyTo={message.replyTo} isOwn onJump={onJumpToMessage}/>
                        </div>
                    )}
                    {showOwnSenderName && (
                        <div
                            data-message-reaction-block="true"
                            className="max-w-[70%] min-w-0 pb-1 px-1 text-xs font-medium transition-colors text-muted-foreground flex flex-wrap items-center gap-1 justify-end">
                            {!message.deleted && <CountryFlag countryCode={message.senderCountryCode}/>}
                            <span className="min-w-0">
                                <UserActionPopup userId={message.senderId} username={message.senderUsername}
                                                 role={message.senderRole}
                                                 vipBadgeVisible={message.senderVipBadgeVisible}
                                                 vipBadgeRevision={message.senderVipBadgeRevision}
                                                 usernameFont={message.senderUsernameFont}
                                                 messageFont={message.senderMessageFont}
                                                 fontRevision={message.senderFontRevision}
                                                 disabled={interactionsDisabled}/>
                            </span>
                        </div>
                    )}
                    {/* Mobile dates sit below the bubble so actions still fit beside it. */}
                    <div className="flex w-full min-w-0 flex-row-reverse flex-nowrap items-center gap-1 lg:gap-2">
                        <div className="w-fit max-w-[70%] min-w-0" data-message-content>
                            <MessageItem
                                isOwn
                                message={message}
                                viewMode="chat"
                                showSenderName={false}
                                handleMessageClick={() => {
                                }}
                                onRemoveAttachment={participationDisabled || interactionsDisabled || message.promotion ? undefined : handleRemoveAttachment}
                                showEditButton={!interactionsDisabled}
                                interactionsDisabled={interactionsDisabled}
                            />
                        </div>
                        <div
                            onClick={(e) => e.stopPropagation()}
                            data-message-reaction-block="true"
                            className={`flex-none items-center justify-end transition-opacity ${menuVisibilityClass}`}>
                            <MessageMenu
                                setEditingMessage={handleEditMessage}
                                onReply={onStartReply}
                                message={message}
                                direction="rtl"
                                userId={currentUserId}
                                userName={currentUsername}
                                messageId={message.id}
                                removeMessage={removeMessage}
                                updateMessageReaction={updateMessageReaction}
                                deleted={message.deleted}
                                role={message.senderRole}
                                className={"flex-row-reverse"}
                                disabled={interactionsDisabled && !archivedRoom}
                                archivedRoom={archivedRoom}
                                allowReport={allowReport}
                                allowModView={allowModView}
                                allowPromote={allowPromote}
                                deleteOnly={deleteOnly}
                                emojiPopoverOpen={isReactionPopoverOpen}
                                onEmojiPopoverOpenChange={handleReactionPopoverOpenChange}
                                mobileSheet={isMobile}
                            />
                            <MessageTimestamp createdAt={message.createdAt} isOwn placement="inline"/>
                        </div>
                    </div>
                    <MessageTimestamp createdAt={message.createdAt} isOwn/>

                    <div className="flex max-w-[70%] flex-wrap gap-2 justify-end mt-1" data-message-reaction-block="true">
                        {message.reactions.map(reaction => (
                            <ReactionButton
                                key={reaction.emoji}
                                reaction={reaction}
                                message={message}
                                disabled={interactionsDisabled}
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={handleMessageClick}
            onTouchStart={handleTouchStart}
            onDoubleClick={handleDoubleClick}
            className={`flex w-full items-start group lg:hover:bg-white/20 dark:lg:hover:bg-white/10 ${isMobile && isMenuVisible ? 'bg-white/20 dark:bg-white/10' : ''} ${popoverSelectionClass} py-1 rounded-md transition-colors min-w-0 max-w-full ${blinkClass}`}>
            <div className="flex w-full min-w-0 flex-col items-start">
                {message.replyTo && (
                    <div className="w-fit max-w-[70%] min-w-0">
                        <ReplyPreview replyTo={message.replyTo} onJump={onJumpToMessage}/>
                    </div>
                )}
                <div
                    data-message-reaction-block="true"
                    className="max-w-[70%] min-w-0 pb-1 px-1 text-xs font-medium transition-colors text-muted-foreground flex flex-wrap items-center gap-1">
                    <span className="min-w-0">
                        <UserActionPopup userId={message.senderId} username={message.senderUsername}
                                         role={message.senderRole}
                                         vipBadgeVisible={message.senderVipBadgeVisible}
                                         vipBadgeRevision={message.senderVipBadgeRevision}
                                         usernameFont={message.senderUsernameFont}
                                         messageFont={message.senderMessageFont}
                                         fontRevision={message.senderFontRevision}
                                         disabled={interactionsDisabled}/>
                    </span>
                    {!message.deleted && <CountryFlag countryCode={message.senderCountryCode}/>}
                    {isBlocked && isRevealed && !interactionsDisabled && (
                        <button
                            onClick={() => setIsRevealed(false)}
                            className="ml-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 hover:underline"
                            title="Hide this message"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
                                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                 strokeLinejoin="round">
                                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                                <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                                <line x1="2" x2="22" y1="2" y2="22"/>
                            </svg>
                            Hide
                        </button>
                    )}
                </div>
                <div className="flex w-full min-w-0 flex-nowrap items-center gap-1 lg:gap-2">
                    <div className="w-fit max-w-[70%] min-w-0" data-message-content>
                        <MessageItem
                            message={message}
                            isOwn={false}
                            inset={false}
                            viewMode="chat"
                            showSenderName={false}
                            handleMessageClick={() => {
                            }}
                            showEditButton={!interactionsDisabled}
                            interactionsDisabled={interactionsDisabled}
                        />
                    </div>

                    <div
                        onClick={(e) => e.stopPropagation()}
                        data-message-reaction-block="true"
                        className={`flex-none items-center transition-opacity ${menuVisibilityClass}`}>
                        <MessageTimestamp createdAt={message.createdAt} placement="inline"/>
                        <MessageMenu
                            setEditingMessage={handleEditMessage}
                            onReply={onStartReply}
                            message={message}
                            userId={message.senderId}
                            userName={message.senderUsername}
                            messageId={message.id}
                            removeMessage={removeMessage}
                            updateMessageReaction={updateMessageReaction}
                            deleted={message.deleted}
                            role={message.senderRole}
                            disabled={interactionsDisabled && !archivedRoom}
                            archivedRoom={archivedRoom}
                            allowReport={allowReport}
                            allowModView={allowModView}
                            allowPromote={allowPromote}
                            deleteOnly={deleteOnly}
                            emojiPopoverOpen={isReactionPopoverOpen}
                            onEmojiPopoverOpenChange={handleReactionPopoverOpenChange}
                            mobileSheet={isMobile}/>
                    </div>
                </div>
                <MessageTimestamp createdAt={message.createdAt}/>

                <div className="flex max-w-[70%] flex-wrap gap-2 mt-1" data-message-reaction-block="true">
                    {message.reactions.map((reaction) => (
                        <ReactionButton
                            key={reaction.emoji}
                            reaction={reaction}
                            message={message}
                            disabled={interactionsDisabled}
                        />
                    ))}
                </div>
            </div>
        </div>
    );

};

export default ChatMessage;
