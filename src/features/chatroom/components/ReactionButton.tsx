import {ChatUserName} from '@/features/chatroom/components/ChatUserName';
import React, {useEffect, useRef, useState} from 'react';
import {Reaction} from '@/models/Reaction';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {Message} from '@/models/message';
import {useThunk} from '@/lib/hooks/useThunk';
import {deleteReactionThunk, fetchMessageReactionDetailsThunk, reactToMessageThunk} from '@/redux/chatRoom/chatRoomThunk';
import {useDispatch, useSelector} from 'react-redux';
import {AppDispatch} from '@/redux/store';
import {setMessageReactions, setSelectedReaction} from '@/redux/chatRoom/chatRoomUiSlice';
import {selectMessageReactionsState} from '@/redux/chatRoom/chatRoomSelectors';
import {useDialog} from '@/components/providers/DialogProvider';
import {selectUser} from '@/redux/user/userSelectors';
import MessageReactionsPanel from '@/features/chatroom/components/MessageReactionsPanel';
import {ReactionGlyph} from '@/features/stickers/ReactionGlyph';
import {getReactionLabel, isCustomReactionToken} from '@/features/stickers/catalog';
import {useProDialog} from '@/features/pro/useProDialog';
import {toast} from 'sonner';

interface ReactionButtonProps {
    reaction: Reaction;
    message: Message;
    isDisplayOnly?: boolean;
    disabled?: boolean;
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({reaction, message, isDisplayOnly = false, disabled = false}) => {
    const dispatch = useDispatch<AppDispatch>();
    const {open} = useDialog();
    const openPro = useProDialog();
    const user = useSelector(selectUser);
    const messageReactionsState = useSelector(selectMessageReactionsState);
    const [fetchReactionDetails, reactionDetailsLoading] = useThunk(fetchMessageReactionDetailsThunk);
    const [addReaction] = useThunk(reactToMessageThunk);
    const [removeReaction] = useThunk(deleteReactionThunk);
    const [pending, setPending] = useState(false);
    const pendingRef = useRef(false);
    const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const label = getReactionLabel(reaction.emoji, reaction.emojiId);
    const reactedByCurrentUser = Boolean(reaction.reactedByCurrentUser || reaction.users?.some(u => u.id === user?.id));
    const selectedReaction = messageReactionsState?.selectedReaction;
    const hasReactionDetails = selectedReaction?.messageId === message.id && selectedReaction.emoji === reaction.emoji;

    const handleHoverEnd = () => {
        if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
        hoverTimeout.current = null;
    };
    useEffect(() => handleHoverEnd, []);

    const handleHoverStart = () => {
        handleHoverEnd();
        hoverTimeout.current = setTimeout(() => {
            dispatch(setMessageReactions(message.reactions));
            void fetchReactionDetails({messageId: message.id, emoji: reaction.emoji, limit: 3}).catch(() => {
                // A failed hover preview should not interrupt the chat. The details panel offers retry.
            });
        }, 400);
    };
    const showDetails = () => {
        handleHoverEnd();
        dispatch(setMessageReactions(message.reactions));
        dispatch(setSelectedReaction(reaction));
        open(<MessageReactionsPanel/>, {className: 'p-0 border-0'});
    };
    const handleReactionClick = async () => {
        if (pendingRef.current) return;
        if (!reactedByCurrentUser && isCustomReactionToken(reaction.emoji) && !user?.proActive) {
            handleHoverEnd();
            openPro();
            return;
        }
        pendingRef.current = true;
        setPending(true);
        try {
            const request = {messageId: message.id, emoji: reaction.emoji, emojiId: reaction.emojiId};
            await (reactedByCurrentUser ? removeReaction(request) : addReaction(request));
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not update your reaction. Please try again.');
        } finally {
            pendingRef.current = false;
            setPending(false);
        }
    };
    const chipClass = `inline-flex items-center gap-1.5 px-1.5 py-1 rounded-lg text-sm font-medium glass-pill ${reactedByCurrentUser
        ? 'text-blue-700 dark:text-blue-200 bg-blue-100/80 dark:bg-blue-500/25 ring-1 ring-blue-400/70 dark:ring-blue-400/50'
        : 'text-gray-700 dark:text-zinc-300'}`;
    const content = <><ReactionGlyph emoji={reaction.emoji} size={22}/><span className="text-xs font-semibold">{reaction.usersCount ?? 0}</span></>;
    if (isDisplayOnly || disabled) return <span aria-label={`${label}, ${reaction.usersCount ?? 0} reactions`} className={`${chipClass} cursor-default`}>{content}</span>;

    return <TooltipProvider><Tooltip>
        <TooltipTrigger asChild>
            <button type="button" onClick={() => void handleReactionClick()} onMouseEnter={handleHoverStart} onMouseLeave={handleHoverEnd}
                    onFocus={handleHoverStart} onBlur={handleHoverEnd} disabled={pending} aria-busy={pending} aria-pressed={reactedByCurrentUser}
                    aria-label={`${reactedByCurrentUser ? 'Remove' : 'Add'} ${label} reaction, ${reaction.usersCount ?? 0} reactions`}
                    className={`${chipClass} transition-all hover:shadow-xs active:scale-95 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:cursor-wait disabled:opacity-60`}>
                {content}
            </button>
        </TooltipTrigger>
        <TooltipContent className="glass-popover max-w-xs">
            <div className="flex flex-col gap-1.5">
                <p className="flex items-center gap-1.5"><ReactionGlyph emoji={reaction.emoji}/><span className="font-semibold">{label}</span></p>
                {hasReactionDetails && !reactionDetailsLoading && selectedReaction?.users?.length ? <div className="text-sm">
                    Reacted by: {selectedReaction.users.slice(0, 3).map((reactor, index) => <span key={reactor.id}>
                        {index > 0 && ', '}<ChatUserName userId={reactor.id} username={reactor.username} proBadgeVisible={reactor.proBadgeVisible} proBadgeRevision={reactor.proBadgeRevision} usernameFont={reactor.usernameFont} messageFont={reactor.messageFont} fontRevision={reactor.fontRevision}/>
                    </span>)}{(reaction.usersCount ?? 0) > 3 && ` and ${(reaction.usersCount ?? 0) - 3} more`}
                </div> : <span className="text-xs text-muted-foreground">{reactionDetailsLoading ? 'Loading reactions…' : `${reaction.usersCount ?? 0} reactions`}</span>}
                <button type="button" onClick={showDetails} className="self-start text-xs underline underline-offset-2">View everyone who reacted</button>
            </div>
        </TooltipContent>
    </Tooltip></TooltipProvider>;
};
