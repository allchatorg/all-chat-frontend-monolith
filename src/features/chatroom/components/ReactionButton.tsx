import React, {useRef} from 'react';
import {Reaction} from '@/models/Reaction';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {Message} from "@/models/message";
import {useThunk} from "@/lib/hooks/useThunk";
import {
    deleteReactionThunk,
    fetchMessageReactionDetailsThunk,
    reactToMessageThunk
} from "@/redux/chatRoom/chatRoomThunk";
import {useDispatch, useSelector} from "react-redux";
import {AppDispatch} from "@/redux/store";
import {setMessageReactions} from "@/redux/chatRoom/chatRoomUiSlice";
import {selectMessageReactionsState} from "@/redux/chatRoom/chatRoomSelectors";
import {useDialog} from "@/components/providers/DialogProvider";
import {useUser} from "@/lib/hooks/useUser";
import MessageReactionsPanel from "@/features/chatroom/components/MessageReactionsPanel";

interface ReactionButtonProps {
    reaction: Reaction,
    message: Message,
    isDisplayOnly?: boolean,
    disabled?: boolean,
}

export const ReactionButton: React.FC<ReactionButtonProps> = ({
                                                                  reaction,
                                                                  message,
                                                                  isDisplayOnly = false,
                                                                  disabled = false,
                                                              }) => {
    const dispatch = useDispatch<AppDispatch>();
    const {open} = useDialog();
    const {user} = useUser();

    const messageReactionsState = useSelector(selectMessageReactionsState);
    const [fetchReactionDetails, reactionDetailsLoading] = useThunk(fetchMessageReactionDetailsThunk);
    const [addReaction] = useThunk(reactToMessageThunk);
    const [removeReaction] = useThunk(deleteReactionThunk);

    const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleHoverStart = () => {
        hoverTimeout.current = setTimeout(() => {
            if (!reactionDetailsLoading) {
                dispatch(setMessageReactions(message.reactions));
                fetchReactionDetails({messageId: message.id, emoji: reaction.emoji, limit: 3});
            }
        }, 400);
    };

    const handleHoverEnd = () => {
        if (hoverTimeout.current) {
            clearTimeout(hoverTimeout.current);
            hoverTimeout.current = null;
        }
    };

    const handleToolTipContentClick = () => {
        open(<MessageReactionsPanel/>, {className: 'p-0 border-0'});
    };

    const selectedReaction = messageReactionsState?.selectedReaction;
    const reactedByCurrentUser = reaction.reactedByCurrentUser || reaction.users?.some(u => u.id === user?.id);
    const hasReactionDetails =
        selectedReaction?.emoji === reaction.emoji &&
        selectedReaction?.users &&
        selectedReaction.users.length > 0;

    const handleReactionClick = () => {
        reactedByCurrentUser
            ? removeReaction({messageId: message.id, emoji: reaction.emoji, emojiId: reaction.emojiId})
            : addReaction({messageId: message.id, emoji: reaction.emoji, emojiId: reaction.emojiId});
    };

    if (isDisplayOnly || disabled) {
        return (
            <span
                className={`
                    inline-flex items-center gap-1.5 px-1 py-1 rounded-lg text-sm font-medium
                    glass-pill cursor-default
                    ${reactedByCurrentUser
                    ? 'text-blue-700 dark:text-blue-200 bg-blue-100/80 dark:bg-blue-500/25 ring-1 ring-blue-400/70 dark:ring-blue-400/50'
                    : 'text-gray-700 dark:text-zinc-300'
                }
                `}
            >
                    <span className="text-base leading-none">{reaction.emoji}</span>
                    <span className="text-xs font-semibold">{reaction.usersCount ?? 0}</span>
            </span>
        );
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <button
                        onClick={handleReactionClick}
                        onMouseEnter={handleHoverStart}
                        onMouseLeave={handleHoverEnd}
                        className={`
                            inline-flex items-center gap-1.5 px-1 py-1 rounded-lg text-sm font-medium
                            transition-all duration-200 ease-in-out
                            glass-pill
                            ${reactedByCurrentUser
                            ? 'text-blue-700 dark:text-blue-200 bg-blue-100/80 dark:bg-blue-500/25 ring-1 ring-blue-400/70 dark:ring-blue-400/50'
                            : 'text-gray-700 dark:text-zinc-300'
                        }
                            hover:shadow-sm active:scale-95
                        `}
                    >
                        <span className="text-base leading-none">{reaction.emoji}</span>
                        <span className="text-xs font-semibold">{reaction.usersCount ?? 0}</span>
                    </button>
                </TooltipTrigger>
                {!reactionDetailsLoading && (
                    <TooltipContent className="glass-popover cursor-pointer">
                        <div className="flex flex-col gap-1" onClick={handleToolTipContentClick}>
                            <p className="flex items-center gap-1.5">
                                <span className="text-base">{reaction.emoji}</span>
                                <span className="font-semibold">
                                    :{reaction.emojiId}:
                                </span>
                            </p>

                            {hasReactionDetails && selectedReaction?.users ? (
                                <div className="text-sm">
                                    reacted by:{" "}
                                    {selectedReaction.users
                                        .slice(0, 3)
                                        .map((user, index, array) => (
                                            <span key={user.id}>
                                                {user.username}
                                                {index < array.length - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                    {(reaction.usersCount ?? 0) > 3 && (
                                        <span className="underline ml-21">
                                            and {(reaction.usersCount ?? 0) - 3} more {(reaction.usersCount ?? 0) - 3 === 1 ? 'user' : 'users'}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <span
                                    className="text-xs text-gray-500 dark:text-zinc-400">Hover to see who reacted</span>
                            )}
                        </div>
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
};
