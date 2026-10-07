'use client';

import React, {useRef, useState} from 'react';
import data from '@emoji-mart/data';
import {ArrowLeft, Loader2, SmilePlus, type LucideIcon} from 'lucide-react';
import {toast} from 'sonner';
import {BottomSheet} from '@/components/ui/bottom-sheet';
import {Button} from '@/components/ui/button';
import {GuestModalWrapper} from '@/components/GuestModalWrapper';
import {cn} from '@/lib/utils';
import {Reaction} from '@/models/Reaction';
import {ReactionPicker} from '@/features/stickers/ReactionPicker';

export interface MessageAction {
    key: string;
    label: string;
    Icon: LucideIcon;
    onSelect: () => void;
    destructive?: boolean;
}

const emojiData = data as {emojis: Record<string, {name: string; skins: {native: string}[]}>};
// Default-tone natives match what the emoji browser and double-tap send, so reactions aggregate.
const QUICK_REACTIONS = ['+1', 'heart', 'joy', 'open_mouth', 'cry', 'fire'].flatMap(id => {
    const emoji = emojiData.emojis[id];
    return emoji ? [{id, name: emoji.name, native: emoji.skins[0].native}] : [];
});

export type MessageActionSheetView = 'actions' | 'emoji';

interface MessageActionSheetProps {
    /** The view to open on; null keeps the sheet closed. */
    openView: MessageActionSheetView | null;
    onClose: () => void;
    title: string;
    preview?: string;
    actions: MessageAction[];
    canReact: boolean;
    reactions: readonly Reaction[];
    proActive: boolean;
    isGuest: boolean;
    onReact: (emoji: string, emojiId: string) => Promise<void>;
    onUpgrade: () => void;
}

/** Mobile replacement for the hover actions menu and reaction popover. */
export function MessageActionSheet({openView, onClose, title, preview, actions, canReact, reactions, proActive, isGuest, onReact, onUpgrade}: MessageActionSheetProps) {
    const open = openView !== null;
    const onOpenChange = (next: boolean) => {if (!next) onClose();};
    const [view, setView] = useState<MessageActionSheetView>(openView ?? 'actions');
    const [wasOpen, setWasOpen] = useState(open);
    const [pendingEmoji, setPendingEmoji] = useState<string | null>(null);
    const pendingRef = useRef(false);
    const afterCloseRef = useRef<(() => void) | null>(null);

    // Each opening starts on the requested view; resetting on close would resize the sheet mid-exit.
    if (open !== wasOpen) {
        setWasOpen(open);
        if (openView) setView(openView);
    }

    const emojiView = view === 'emoji' && canReact;

    // Dialogs and composer focus must wait until the drawer has released focus and the body lock.
    const closeThen = (action: () => void) => {
        afterCloseRef.current = action;
        onOpenChange(false);
    };

    const react = async (emoji: string, emojiId: string) => {
        if (isGuest || pendingRef.current) return;
        pendingRef.current = true;
        setPendingEmoji(emoji);
        try {
            await onReact(emoji, emojiId);
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not update your reaction. Please try again.');
        } finally {
            pendingRef.current = false;
            setPendingEmoji(null);
        }
    };

    return (
        <BottomSheet
            open={open}
            onOpenChange={onOpenChange}
            title={emojiView ? 'Add reaction' : title}
            description={!emojiView && preview ? <span className="line-clamp-2 break-words">{preview}</span> : undefined}
            closeLabel="Close message actions"
            size={emojiView ? 'tall' : 'content'}
            scrollable={!emojiView}
            bodyClassName={emojiView ? 'px-0' : undefined}
            onCloseAutoFocus={event => {
                const afterClose = afterCloseRef.current;
                afterCloseRef.current = null;
                if (!afterClose) return;
                event.preventDefault();
                afterClose();
            }}
        >
            {emojiView ? <>
                <Button type="button" variant="ghost" size="sm" onClick={() => setView('actions')} className="mx-3 mb-1 shrink-0 self-start gap-1.5">
                    <ArrowLeft aria-hidden="true" className="h-4 w-4"/>Back
                </Button>
                <div className="min-h-0 flex-1 border-t">
                    <ReactionPicker className="h-full" proActive={proActive} reactions={reactions}
                                    onSelect={onReact} onClose={() => onOpenChange(false)}
                                    onUpgrade={() => closeThen(onUpgrade)}/>
                </div>
            </> : <GuestModalWrapper isGuest={isGuest}>
                <div className="space-y-4">
                    {/* Seven equal columns so the row shrinks to fit narrow phones instead of overflowing. */}
                    {canReact && <div role="group" aria-label="Quick reactions" className="grid grid-cols-7 items-center gap-1 rounded-2xl border bg-muted/30 p-1.5">
                        {QUICK_REACTIONS.map(({id, name, native}) => {
                            const selected = reactions.some(reaction => reaction.emoji === native && reaction.reactedByCurrentUser);
                            return <button key={id} type="button" disabled={pendingEmoji !== null} aria-pressed={selected}
                                           aria-label={selected ? `Remove ${name} reaction` : `React with ${name}`}
                                           onClick={() => void react(native, id)}
                                           className={cn('grid aspect-square w-full max-w-12 place-items-center justify-self-center rounded-full text-2xl leading-none transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-50 min-[400px]:text-[28px]',
                                               selected && 'bg-blue-100/80 ring-1 ring-blue-400/70 dark:bg-blue-500/25 dark:ring-blue-400/50')}>
                                {pendingEmoji === native ? <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin text-muted-foreground"/> : <span aria-hidden="true">{native}</span>}
                            </button>;
                        })}
                        <button type="button" disabled={pendingEmoji !== null} aria-label="More reactions"
                                onClick={() => {if (!isGuest) setView('emoji');}}
                                className="grid aspect-square w-full max-w-12 place-items-center justify-self-center rounded-full bg-muted text-muted-foreground transition-transform active:scale-90 focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-50">
                            <SmilePlus aria-hidden="true" className="h-6 w-6"/>
                        </button>
                    </div>}
                    {actions.length > 0 && <ul className="divide-y overflow-hidden rounded-2xl border bg-muted/20">
                        {actions.map(({key, label, Icon, onSelect, destructive}) => <li key={key}>
                            <button type="button" onClick={() => {if (!isGuest) closeThen(onSelect);}}
                                    className={cn('flex min-h-12 w-full items-center gap-3 px-4 text-left text-[15px] font-medium active:bg-muted focus-visible:bg-muted focus-visible:outline-none',
                                        destructive && 'text-destructive')}>
                                <Icon aria-hidden="true" className="h-5 w-5 shrink-0"/>{label}
                            </button>
                        </li>)}
                    </ul>}
                </div>
            </GuestModalWrapper>}
        </BottomSheet>
    );
}
