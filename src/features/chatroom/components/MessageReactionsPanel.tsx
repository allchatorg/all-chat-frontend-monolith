import {ChatUserName} from '@/features/chatroom/components/ChatUserName';
import {useEffect} from 'react';
import {ScrollArea} from '@/components/ui/scroll-area';
import {Badge} from '@/components/ui/badge';
import {Skeleton} from '@/components/ui/skeleton';
import {useDispatch, useSelector} from 'react-redux';
import {selectMessageReactionsState} from '@/redux/chatRoom/chatRoomSelectors';
import {useThunk} from '@/lib/hooks/useThunk';
import {fetchMessageReactionDetailsThunk} from '@/redux/chatRoom/chatRoomThunk';
import {setSelectedReaction} from '@/redux/chatRoom/chatRoomUiSlice';
import {ReactionGlyph} from '@/features/stickers/ReactionGlyph';
import {getReactionLabel} from '@/features/stickers/catalog';
import {selectUser} from '@/redux/user/userSelectors';

export default function MessageReactionsPanel() {
    const state = useSelector(selectMessageReactionsState);
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const [fetchDetails, loading, error] = useThunk(fetchMessageReactionDetailsThunk);
    const selected = state?.selectedReaction;
    const messageId = selected?.messageId;
    const emoji = selected?.emoji;
    const reactions = state?.messageReactions ?? [];
    const detailsRevision = state?.detailsRevision;
    const hasMembers = (selected?.usersCount ?? 0) > 0;
    const loadDetails = () => {
        if (messageId !== undefined && emoji && hasMembers) void fetchDetails({messageId, emoji}).catch(() => {});
    };
    useEffect(() => {
        if (messageId !== undefined && emoji && hasMembers) void fetchDetails({messageId, emoji}).catch(() => {});
    }, [messageId, emoji, detailsRevision, hasMembers, fetchDetails]);
    const ownReaction = selected?.reactedByCurrentUser || selected?.users?.some(reactor => reactor.id === user?.id);

    return <div className="glass-panel flex h-[min(500px,80dvh)] w-[min(500px,90vw)] overflow-hidden rounded-lg text-foreground" aria-label="Message reactions">
        <div className="glass-surface flex w-20 shrink-0 flex-col border-r border-border">
            <h3 className="border-b border-border p-3 text-center text-xs font-semibold text-muted-foreground">Reactions</h3>
            <ScrollArea className="min-h-0 flex-1"><div className="space-y-1 p-2">
                {reactions.map(reaction => <button type="button" key={reaction.emoji} onClick={() => {
                    if (emoji !== reaction.emoji) dispatch(setSelectedReaction(reaction));
                }}
                    aria-label={`${getReactionLabel(reaction.emoji, reaction.emojiId)}, ${reaction.usersCount ?? 0} reactions`} aria-pressed={emoji === reaction.emoji}
                    className={`flex w-full flex-col items-center gap-1 rounded-md p-2 focus-visible:outline-2 focus-visible:outline-violet-500 ${emoji === reaction.emoji ? 'glass-surface-strong ring-1 ring-violet-500/40' : 'glass-control'}`}>
                    <ReactionGlyph emoji={reaction.emoji} size={26}/><span className="text-xs font-semibold text-muted-foreground">{reaction.usersCount ?? 0}</span>
                </button>)}
            </div></ScrollArea>
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
            {selected ? <>
                <div className="flex items-center gap-3 border-b border-border p-4">
                    <ReactionGlyph emoji={selected.emoji} size={36}/>
                    <div className="min-w-0">
                        <h2 className="truncate text-base font-semibold">{getReactionLabel(selected.emoji, selected.emojiId)}</h2>
                        <p className="text-sm text-muted-foreground">{selected.usersCount ?? 0} {(selected.usersCount ?? 0) === 1 ? 'reaction' : 'reactions'}</p>
                        {ownReaction && <Badge variant="secondary" className="mt-1 text-xs">You reacted</Badge>}
                    </div>
                </div>
                <ScrollArea className="min-h-0 flex-1"><div className="space-y-2 p-4" aria-live="polite">
                    {!hasMembers ? <p className="py-8 text-center text-sm text-muted-foreground">No reactions yet</p> : loading ? <><span className="sr-only">Loading users</span>{[0, 1, 2].map(i => <Skeleton key={i} className="h-10 w-full"/>)}</>
                        : error ? <div role="alert" className="text-sm"><p>Could not load reactions.</p><button type="button" className="mt-2 underline" onClick={loadDetails}>Try again</button></div>
                        : selected.users?.length ? selected.users.map(reactor => <div key={reactor.id} className="glass-surface rounded-lg p-3">
                            <p className="truncate text-sm font-medium"><ChatUserName userId={reactor.id} username={reactor.username} proBadgeVisible={reactor.proBadgeVisible} proBadgeRevision={reactor.proBadgeRevision} usernameFont={reactor.usernameFont} messageFont={reactor.messageFont} fontRevision={reactor.fontRevision}/></p>
                        </div>) : <p className="py-8 text-center text-sm text-muted-foreground">No reactions yet</p>}
                </div></ScrollArea>
            </> : <p className="p-6 text-sm text-muted-foreground">Select a reaction to view details</p>}
        </div>
    </div>;
}
