import React from "react";
import MessageItem from "@/features/chatroom/components/MessageItem";
import {MessageMenu} from "@/features/chatroom/components/MessageMenu";
import {Message} from "@/models/message";
import {ReactionButton} from "@/features/chatroom/components/ReactionButton";
import {useThunk} from "@/lib/hooks/useThunk";
import {deleteReactionThunk, reactToMessageThunk} from "@/redux/chatRoom/chatRoomThunk";
import {useFormatMessageDate} from "@/lib/hooks/useTimeFormatSetting";
import {removeAttachmentFromMessage} from "@/api/chatting/chattingAPI";
import {CountryFlag} from "@/features/chatroom/components/CountryFlag";
import {UserActionPopup} from "@/features/chatroom/components/UserActionPopup";
import {useIsMobile} from "@/lib/hooks/useIsMobile";
import ReplyPreview from "@/features/chatroom/components/ReplyPreview";

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
                                                     onStartEditMessage,
                                                     onStartReply,
                                                     onJumpToMessage,
                                                     deleteOnly = false,
                                                     showOwnSenderName = false,
                                                 }) => {

    const {formatMessageDate} = useFormatMessageDate();
    const formattedTime = formatMessageDate(message.createdAt);

    const [reactToMessage] = useThunk(reactToMessageThunk);
    const [deleteReaction] = useThunk(deleteReactionThunk);
    const [isRevealed, setIsRevealed] = React.useState(false);
    const [isBlinking, setIsBlinking] = React.useState(false);
    const [isReactionPopoverOpen, setIsReactionPopoverOpen] = React.useState(false);

    // Track last tap time for double-tap detection
    const lastTapTimeRef = React.useRef<number>(0);

    const isMobile = useIsMobile();
    const isMenuVisible = showMobileMenu || isReactionPopoverOpen;
    const menuVisibilityClass = isMobile
        ? (isMenuVisible ? 'opacity-100' : 'opacity-0 pointer-events-none')
        : (isReactionPopoverOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto');
    const popoverSelectionClass = isReactionPopoverOpen ? 'select-none' : '';

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
        if (interactionsDisabled || isReactionGestureBlockedTarget(e.target)) {
            return;
        }

        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTapTimeRef.current;

        // Reset if more than 300ms passed between taps
        if (tapLength > 0 && tapLength < 300) {
            e.preventDefault();
            e.stopPropagation();
            updateMessageReaction(message.id, "👍", "+1");
            // Reset to prevent a third tap from triggering another double-tap immediately
            lastTapTimeRef.current = 0;
        } else {
            lastTapTimeRef.current = currentTime;
        }
    };

    const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (interactionsDisabled || isReactionGestureBlockedTarget(e.target)) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();
        updateMessageReaction(message.id, "👍", "+1");
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

    const updateMessageReaction = (messageId: number, emoji: string, emojiId: string) => {
        const existingReaction = message.reactions.find(r => r.emoji === emoji);
        if (existingReaction && existingReaction.reactedByCurrentUser) {
            deleteReaction({messageId, emoji, emojiId});
        } else {
            reactToMessage({messageId, emoji, emojiId});
        }
    }

    const handleEditMessage = (message: Message) => {
        onStartEditMessage?.(message);
    };

    const handleRemoveAttachment = async (attachmentId: number) => {
        try {
            await removeAttachmentFromMessage(message.id, {attachmentId});
        } catch (error) {
            console.error("Failed to remove attachment:", error);
        }
    };

    if (isBlocked && !isRevealed && !isOwn) {
        return (
            <div
                className={`flex w-full items-start group lg:hover:bg-white/20 dark:lg:hover:bg-white/10 p-1 rounded-md transition-colors ${blinkClass}`}>
                <div className="max-w-[90%] lg:max-w-[75%] flex flex-col justify-start">
                    <div
                        className="pl-4 pb-1 px-1 text-xs font-medium transition-colors text-muted-foreground flex items-center gap-1">
                        <span>Blocked User</span>
                    </div>
                    <div
                        className="glass-surface ml-4 mb-1 text-muted-foreground rounded-lg p-3 text-sm italic flex items-center gap-3">
                        <span>Blocked Message</span>
                        {!interactionsDisabled && (
                            <button
                                onClick={() => setIsRevealed(true)}
                                className="cursor-pointer text-xs font-medium text-primary hover:underline focus:outline-none"
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
                className={`flex w-full items-center justify-end group lg:hover:bg-white/20 dark:lg:hover:bg-white/10 ${isMobile && isMenuVisible ? 'bg-white/20 dark:bg-white/10' : ''} ${popoverSelectionClass} p-1 rounded-md transition-colors min-w-0 max-w-full ${blinkClass}`}>
                <div className="flex flex-col items-end max-w-[90%] lg:max-w-[75%] min-w-0">
                    {message.replyTo && (
                        <ReplyPreview replyTo={message.replyTo} isOwn onJump={onJumpToMessage}/>
                    )}
                    {showOwnSenderName && (
                        <div
                            data-message-reaction-block="true"
                            className="pr-4 pb-1 px-1 text-xs font-medium transition-colors text-muted-foreground flex items-center gap-1 justify-end">
                            {!message.deleted && <CountryFlag countryCode={message.senderCountryCode}/>}
                            <span>
                                <UserActionPopup userId={message.senderId} username={message.senderUsername}
                                                 role={message.senderRole}
                                                 disabled={interactionsDisabled}>
                                    {message.senderUsername}
                                </UserActionPopup>
                            </span>
                        </div>
                    )}
                    <div className="flex items-center min-w-0 max-w-full">
                        <div
                            onClick={(e) => e.stopPropagation()}
                            data-message-reaction-block="true"
                            className={`flex items-center transition-opacity shrink-0 ${menuVisibilityClass}`}>
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
                                deleteOnly={deleteOnly}
                                emojiPopoverOpen={isReactionPopoverOpen}
                                onEmojiPopoverOpenChange={handleReactionPopoverOpenChange}
                            />
                            <div
                                className="italic text-xs transition-colors text-muted-foreground px-2 mr-2">
                                {formattedTime}
                            </div>
                        </div>
                        <MessageItem
                            isOwn
                            message={message}
                            viewMode="chat"
                            showSenderName={false}
                            handleMessageClick={() => {
                            }}
                            onRemoveAttachment={interactionsDisabled ? undefined : handleRemoveAttachment}
                            showEditButton={!interactionsDisabled}
                            interactionsDisabled={interactionsDisabled}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 justify-end mt-1" data-message-reaction-block="true">
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
            className={`flex w-full items-start group lg:hover:bg-white/20 dark:lg:hover:bg-white/10 ${isMobile && isMenuVisible ? 'bg-white/20 dark:bg-white/10' : ''} ${popoverSelectionClass} p-1 rounded-md transition-colors min-w-0 max-w-full ${blinkClass}`}>
            <div className="max-w-[90%] lg:max-w-[75%] flex flex-col justify-start min-w-0">
                {message.replyTo && (
                    <ReplyPreview replyTo={message.replyTo} onJump={onJumpToMessage}/>
                )}
                <div
                    data-message-reaction-block="true"
                    className="pl-4 pb-1 px-1 text-xs font-medium transition-colors text-muted-foreground flex items-center gap-1">
                    <span>
                        <UserActionPopup userId={message.senderId} username={message.senderUsername}
                                         role={message.senderRole}
                                         disabled={interactionsDisabled}>
                            {message.senderUsername}
                        </UserActionPopup>
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
                <div className="flex items-center min-w-0 max-w-full">
                    <MessageItem
                        message={message}
                        isOwn={false}
                        viewMode="chat"
                        showSenderName={false}
                        handleMessageClick={() => {
                        }}
                        onRemoveAttachment={interactionsDisabled ? undefined : handleRemoveAttachment}
                        showEditButton={!interactionsDisabled}
                        interactionsDisabled={interactionsDisabled}
                    />

                    <div
                        onClick={(e) => e.stopPropagation()}
                        data-message-reaction-block="true"
                        className={`flex items-center ml-2 transition-opacity shrink-0 ${menuVisibilityClass}`}>
                        <div className="italic text-xs text-muted-foreground px-2 text-right">
                            {formattedTime}
                        </div>
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
                            deleteOnly={deleteOnly}
                            emojiPopoverOpen={isReactionPopoverOpen}
                            onEmojiPopoverOpenChange={handleReactionPopoverOpenChange}/>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 ml-4 mt-1" data-message-reaction-block="true">
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
