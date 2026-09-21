'use client';

import {useId, useMemo, useRef, useState} from 'react';
import Image from 'next/image';
import {Check, Diamond, Loader2, LockKeyhole, Search, Smile, Sparkles, X} from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import {toast} from 'sonner';
import {useTheme} from 'next-themes';
import {Button} from '@/components/ui/button';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Reaction} from '@/models/Reaction';
import {cn} from '@/lib/utils';
import {PRO_REACTIONS, ProReaction, toCustomReactionToken} from './catalog';

interface ReactionPickerProps {
    proActive: boolean;
    reactions: readonly Reaction[];
    onSelect: (emoji: string, emojiId: string) => Promise<void>;
    onClose: () => void;
    onUpgrade: () => void;
}

export function ReactionPicker({proActive, reactions, onSelect, onClose, onUpgrade}: ReactionPickerProps) {
    const [query, setQuery] = useState('');
    const [preview, setPreview] = useState<ProReaction>(PRO_REACTIONS[0]);
    const [pending, setPending] = useState(false);
    const pendingRef = useRef(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const searchId = useId();
    const {resolvedTheme} = useTheme();
    const filteredReactions = useMemo(() => {
        const normalized = query.trim().toLocaleLowerCase();
        return PRO_REACTIONS.filter(reaction =>
            [reaction.name, reaction.id, ...reaction.tags].some(value => value.toLocaleLowerCase().includes(normalized)));
    }, [query]);
    const selectedTokens = new Set(reactions.filter(reaction => reaction.reactedByCurrentUser).map(reaction => reaction.emoji));

    const selectReaction = async (emoji: string, emojiId: string) => {
        if (pendingRef.current) return;
        pendingRef.current = true;
        setPending(true);
        try {
            await onSelect(emoji, emojiId);
            onClose();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Could not update your reaction. Please try again.');
        } finally {
            pendingRef.current = false;
            setPending(false);
        }
    };

    const selectCustomReaction = (reaction: ProReaction) => {
        if (pendingRef.current) return;
        setPreview(reaction);
        const token = toCustomReactionToken(reaction.id);
        // Existing reactions remain removable after a subscription expires.
        if (!proActive && !selectedTokens.has(token)) {
            onUpgrade();
            return;
        }
        void selectReaction(token, token);
    };

    return (
        <Tabs defaultValue="emoji" aria-label="Reaction picker" aria-busy={pending}
              className="flex max-h-[min(580px,var(--radix-popover-content-available-height))] min-h-0 flex-col gap-0 overflow-hidden">
            <TabsList aria-label="Reaction types" className="h-auto w-full shrink-0 justify-start gap-1 rounded-none border-b bg-transparent px-3 py-2">
                <TabsTrigger value="emoji" className="gap-2 px-3 py-2"><Smile aria-hidden="true" className="h-4 w-4"/>Emoji</TabsTrigger>
                <TabsTrigger value="pro" className="gap-2 px-3 py-2 data-[state=active]:bg-violet-500/10 data-[state=active]:text-violet-600 dark:data-[state=active]:text-violet-300"><Diamond aria-hidden="true" className="h-4 w-4"/>allchat Pro</TabsTrigger>
                {pending && <Loader2 aria-label="Updating reaction" className="ml-auto h-4 w-4 animate-spin text-muted-foreground"/>}
            </TabsList>
            <TabsContent value="emoji" className="m-0 min-h-0 overflow-y-auto overscroll-contain">
                <div className={cn('w-full [&>em-emoji-picker]:w-full', pending && 'pointer-events-none opacity-60')} aria-disabled={pending}>
                    <Picker data={data} theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
                            autoFocus={false} dynamicWidth emojiButtonSize={34} perLine={9}
                            onEmojiSelect={(emoji: {native: string; id: string}) => void selectReaction(emoji.native, emoji.id)}/>
                </div>
            </TabsContent>
            <TabsContent value="pro" className="m-0 flex min-h-0 flex-1 flex-col overflow-hidden data-[state=inactive]:hidden">
                <div className="shrink-0 px-3 pb-3 pt-3">
                    <label htmlFor={searchId} className="sr-only">Search character reactions</label>
                    <div className="flex items-center gap-2 rounded-lg border border-transparent bg-muted/70 px-3 focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/15">
                        <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground"/>
                        <input ref={searchRef} id={searchId} value={query} onChange={event => setQuery(event.target.value)}
                               placeholder="Find the right reaction" autoComplete="off"
                               className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"/>
                        {query && <button type="button" onClick={() => {setQuery(''); searchRef.current?.focus();}} aria-label="Clear reaction search" className="rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-violet-500"><X aria-hidden="true" className="h-3.5 w-3.5"/></button>}
                    </div>
                </div>
                <div className="flex min-h-0 flex-1">
                    <div aria-hidden="true" className="flex w-11 shrink-0 justify-center border-r bg-muted/20 pt-2">
                        <div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-300"><Sparkles className="h-4 w-4"/></div>
                    </div>
                    <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3">
                        <div className="flex items-center justify-between gap-1 px-1 pb-2 pt-1">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Internet classics</h3>
                            <span className="text-[10px] tabular-nums text-muted-foreground" aria-live="polite">{filteredReactions.length} {filteredReactions.length === 1 ? 'reaction' : 'reactions'}</span>
                        </div>
                        {filteredReactions.length > 0 ? (
                            <ul aria-label="Internet classics character reactions" className="grid grid-cols-4 gap-1">
                                {filteredReactions.map(reaction => {
                                    const selected = selectedTokens.has(toCustomReactionToken(reaction.id));
                                    const locked = !proActive && !selected;
                                    return <li key={reaction.id}>
                                        <button type="button" disabled={pending}
                                                aria-label={selected ? `Remove ${reaction.name} reaction` : locked ? `${reaction.name} reaction, unlock with allchat Pro` : `Add ${reaction.name} reaction`}
                                                aria-pressed={selected} onMouseEnter={() => setPreview(reaction)} onFocus={() => setPreview(reaction)}
                                                onClick={() => selectCustomReaction(reaction)} title={reaction.name}
                                                className={cn('group relative flex aspect-square w-full items-center justify-center rounded-lg border border-transparent p-1 transition-colors hover:bg-muted focus-visible:border-violet-500 focus-visible:bg-violet-500/10 focus-visible:outline-none disabled:cursor-wait disabled:opacity-50', preview.id === reaction.id && 'bg-muted/80', selected && 'border-violet-500/50 bg-violet-500/10')}>
                                            <Image src={reaction.src} alt="" width={72} height={72} unoptimized draggable={false} className="h-full w-full object-contain transition-transform group-hover:scale-105"/>
                                            {locked && <span className="absolute bottom-1 right-1 rounded bg-popover/90 p-0.5 text-muted-foreground"><LockKeyhole aria-hidden="true" className="h-3 w-3"/></span>}
                                            {selected && <span className="absolute right-1 top-1 rounded-full bg-violet-600 p-0.5 text-white"><Check aria-hidden="true" className="h-2.5 w-2.5"/></span>}
                                        </button>
                                    </li>;
                                })}
                            </ul>
                        ) : <div role="status" className="flex min-h-36 flex-col items-center justify-center px-3 text-center">
                            <Search aria-hidden="true" className="mb-3 h-7 w-7 text-muted-foreground/60"/>
                            <p className="text-sm font-medium">No reactions found</p>
                            <p className="mt-1 text-xs text-muted-foreground">Try a name or a mood, like happy.</p>
                        </div>}
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 border-t bg-muted/30 px-3 py-2.5">
                    <Image src={preview.src} alt={`${preview.name} reaction preview`} width={56} height={56} unoptimized className="h-12 w-12 shrink-0 object-contain"/>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{preview.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{selectedTokens.has(toCustomReactionToken(preview.id)) ? 'Select to remove your reaction.' : proActive ? 'Select to react to this message.' : 'Unlock 17 character reactions with allchat Pro.'}</p>
                    </div>
                </div>
                {!proActive && <div className="shrink-0 border-t border-violet-500/15 bg-violet-500/5 p-3">
                    <Button type="button" disabled={pending} onClick={onUpgrade} className="w-full gap-2 bg-violet-600 text-white hover:bg-violet-700"><Diamond aria-hidden="true" className="h-4 w-4"/>Unlock with allchat Pro</Button>
                </div>}
            </TabsContent>
        </Tabs>
    );
}
