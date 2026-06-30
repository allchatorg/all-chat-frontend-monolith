import {useEffect, useState} from "react";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {useSelector} from "react-redux";
import {selectMessageReactionsState} from "@/redux/chatRoom/chatRoomSelectors";
import {useThunk} from "@/lib/hooks/useThunk";
import {fetchMessageReactionDetailsThunk} from "@/redux/chatRoom/chatRoomThunk";


export default function MessageReactionsPanel() {

    const messageReactionsState = useSelector(selectMessageReactionsState);
    const [fetchReactionDetails, loading] = useThunk(fetchMessageReactionDetailsThunk);

    const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);

    const selectedReaction = messageReactionsState?.selectedReaction;
    const reactions = messageReactionsState?.messageReactions;

    useEffect(() => {
        if (selectedReaction) {
            setSelectedEmoji(selectedReaction.emoji);
        }
    }, [selectedReaction]);

    if (!messageReactionsState || !reactions || !selectedReaction) {
        return <div>Loading...</div>;
    }

    const onEmojiSelect = (emoji: string) => {
        if (!messageReactionsState.selectedReaction) return;

        fetchReactionDetails({messageId: messageReactionsState.selectedReaction.messageId, emoji});
    };

    const handleEmojiClick = (emoji: string) => {
        setSelectedEmoji(emoji);
        onEmojiSelect?.(emoji);
    };

    return (
        <div
            className="glass-panel flex h-[500px] w-[90vw] md:min-w-[500px] md:max-w-[500px] text-foreground rounded-lg overflow-hidden">
            <div className="glass-surface w-20 border-r border-border flex flex-col">
                <div className="p-3 border-b border-border">
                    <h3 className="text-xs font-semibold text-muted-foreground text-center">
                        Reactions
                    </h3>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-2 space-y-1">
                        {reactions.map((reaction) => (
                            <button
                                key={reaction.emoji}
                                onClick={() => handleEmojiClick(reaction.emoji)}
                                disabled={loading}
                                className={`w-full flex flex-col items-center gap-1 p-2 rounded-md transition-all duration-200
                  ${selectedEmoji === reaction.emoji
                                    ? 'glass-surface-strong text-white'
                                    : 'glass-control'
                                }
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <span className="text-2xl leading-none">{reaction.emoji}</span>
                                <span className="text-xs font-semibold text-muted-foreground">
                                    {reaction.usersCount}
                                </span>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            <div className="flex-1 flex flex-col">
                {selectedReaction ? (
                    <>
                        <div className="p-4 border-b border-border">
                            <div className="flex items-center gap-2">
                                <div className="flex flex-col items-center">
                                    <span className="text-3xl">{selectedReaction.emoji}</span>
                                    <span
                                        className="hidden md:block text-sm text-muted-foreground">:{selectedReaction.emojiId}:</span>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">
                                        {selectedReaction.usersCount}{' '}
                                        {selectedReaction.usersCount === 1 ? 'reaction' : 'reactions'}
                                    </h2>
                                    {selectedReaction.reactedByCurrentUser && (
                                        <Badge variant="secondary" className="text-xs">
                                            You reacted
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </div>

                        <ScrollArea className="flex-1">
                            <div className="p-4 space-y-2">
                                {loading ? (
                                    <>
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="p-3">
                                                <Skeleton className="h-4 w-32"/>
                                            </div>
                                        ))}
                                    </>
                                ) : (selectedReaction?.users ?? []).length > 0 ? (
                                    (selectedReaction?.users ?? []).map((user) => (
                                        <div
                                            key={user.id}
                                            className="glass-surface p-3 rounded-lg transition-colors"
                                        >
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {user.username}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground text-sm">
                                        No users found
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </>
                ) : loading ? (
                    <div className="flex-1 flex flex-col">
                        <div className="p-4 border-b border-border">
                            <Skeleton className="h-5 w-32 mb-2"/>
                            <Skeleton className="h-4 w-20"/>
                        </div>
                        <div className="flex-1 p-4 space-y-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="p-3">
                                    <Skeleton className="h-4 w-32"/>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-muted-foreground">
                        <p className="text-sm">Select a reaction to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}
