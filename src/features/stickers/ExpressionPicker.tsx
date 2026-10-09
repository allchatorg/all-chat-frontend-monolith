'use client';

import {useId, useMemo, useRef, useState} from 'react';
import Image from 'next/image';
import {Check, Diamond, Loader2, LockKeyhole, Search, Smile, Sparkles, Sticker, X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {cn} from '@/lib/utils';
import {VIP_REACTIONS, VipReaction, toCustomReactionToken} from './catalog';
import {EmojiBrowser} from './EmojiBrowser';
import type {EmojiSelection} from './emojiTypes';

export type ExpressionPickerTab = 'emoji' | 'stickers';

interface ExpressionPickerProps {
    tab: ExpressionPickerTab;
    onTabChange: (tab: ExpressionPickerTab) => void;
    mode: 'reaction' | 'message';
    vipActive: boolean;
    selectedStickerTokens?: ReadonlySet<string>;
    allowStickers?: boolean;
    pending?: boolean;
    onEmojiSelect: (emoji: EmojiSelection) => void | Promise<void>;
    onStickerSelect: (sticker: VipReaction) => void;
    onUpgrade: () => void;
}

/** One shared picker keeps every sticker, including locked ones, in the same tab. */
export function ExpressionPicker({tab, onTabChange, mode, vipActive, selectedStickerTokens, allowStickers = true, pending = false,
    onEmojiSelect, onStickerSelect, onUpgrade}: ExpressionPickerProps) {
    const [query, setQuery] = useState('');
    const [preview, setPreview] = useState<VipReaction>(VIP_REACTIONS[0]);
    const searchRef = useRef<HTMLInputElement>(null);
    const searchId = useId();
    const filteredStickers = useMemo(() => {
        const normalized = query.trim().toLocaleLowerCase();
        return VIP_REACTIONS.filter(sticker =>
            [sticker.name, sticker.id, ...sticker.tags].some(value => value.toLocaleLowerCase().includes(normalized)));
    }, [query]);
    const isSelected = (sticker: VipReaction) => mode === 'reaction'
        && selectedStickerTokens?.has(toCustomReactionToken(sticker.id)) === true;

    const selectSticker = (sticker: VipReaction) => {
        if (pending) return;
        setPreview(sticker);
        // An expired subscription must not prevent removing an existing reaction.
        if (!vipActive && !isSelected(sticker)) {
            onUpgrade();
            return;
        }
        onStickerSelect(sticker);
    };

    return (
        <Tabs value={allowStickers ? tab : 'emoji'} onValueChange={value => onTabChange(value as ExpressionPickerTab)}
              aria-label={mode === 'reaction' ? 'Reaction picker' : 'Emoji and sticker picker'} aria-busy={pending}
              className="flex h-[min(560px,var(--radix-popover-content-available-height,560px))] min-h-0 flex-col gap-0 overflow-hidden">
            <TabsList aria-label="Expression types" className="h-auto w-full shrink-0 justify-start gap-1 rounded-none border-b bg-transparent px-3 py-2">
                <TabsTrigger value="emoji" className="gap-2 px-3 py-2"><Smile aria-hidden="true" className="h-4 w-4"/>Emoji</TabsTrigger>
                {allowStickers && <TabsTrigger value="stickers" className="gap-2 px-3 py-2"><Sticker aria-hidden="true" className="h-4 w-4"/>Stickers</TabsTrigger>}
                {pending && <Loader2 aria-label={mode === 'reaction' ? 'Updating reaction' : 'Sending sticker'} className="ml-auto h-4 w-4 animate-spin text-muted-foreground"/>}
            </TabsList>
            <TabsContent value="emoji" className="m-0 min-h-0 flex-1 overflow-hidden">
                <EmojiBrowser mode={mode} vipActive={vipActive} selectedReactionTokens={selectedStickerTokens}
                              pending={pending} onSelect={onEmojiSelect} onUpgrade={onUpgrade}/>
            </TabsContent>
            {allowStickers && <TabsContent value="stickers" className="m-0 flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain data-[state=inactive]:hidden">
                <div className="shrink-0 px-3 pb-3 pt-3">
                    <label htmlFor={searchId} className="sr-only">Search stickers</label>
                    <div className="flex items-center gap-2 rounded-lg border border-transparent bg-muted/70 px-3 focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/15">
                        <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground"/>
                        <input ref={searchRef} id={searchId} value={query} onChange={event => setQuery(event.target.value)}
                               placeholder="Find a sticker" autoComplete="off"
                               className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"/>
                        {query && <button type="button" onClick={() => {setQuery(''); searchRef.current?.focus();}} aria-label="Clear sticker search" className="rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-violet-500"><X aria-hidden="true" className="h-3.5 w-3.5"/></button>}
                    </div>
                </div>
                <div className="flex min-h-24 flex-1 shrink-0">
                    <div aria-hidden="true" className="flex w-11 shrink-0 justify-center border-r bg-muted/20 pt-2">
                        <div className="grid h-8 w-8 place-items-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-300"><Sparkles className="h-4 w-4"/></div>
                    </div>
                    <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3">
                        <div className="flex items-center justify-between gap-1 px-1 pb-2 pt-1">
                            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Internet classics</h3>
                            <span className="text-[10px] tabular-nums text-muted-foreground" aria-live="polite">{filteredStickers.length} {filteredStickers.length === 1 ? 'sticker' : 'stickers'}</span>
                        </div>
                        {filteredStickers.length > 0 ? (
                            <ul aria-label="Internet classics stickers" className="grid grid-cols-4 gap-1">
                                {filteredStickers.map(sticker => {
                                    const selected = isSelected(sticker);
                                    const locked = !vipActive && !selected;
                                    const label = selected ? `Remove ${sticker.name} reaction` : locked
                                        ? `${sticker.name} sticker, unlock with allchat VIP`
                                        : mode === 'reaction' ? `Add ${sticker.name} reaction` : `Send ${sticker.name} sticker`;
                                    return <li key={sticker.id}>
                                        <button type="button" disabled={pending} aria-label={label}
                                                aria-pressed={mode === 'reaction' ? selected : undefined}
                                                onMouseEnter={() => setPreview(sticker)} onFocus={() => setPreview(sticker)}
                                                onClick={() => selectSticker(sticker)} title={sticker.name}
                                                className={cn('group relative flex aspect-square w-full items-center justify-center rounded-lg border border-transparent p-1 transition-colors hover:bg-muted focus-visible:border-violet-500 focus-visible:bg-violet-500/10 focus-visible:outline-none disabled:cursor-wait disabled:opacity-50', preview.id === sticker.id && 'bg-muted/80', selected && 'border-violet-500/50 bg-violet-500/10')}>
                                            <Image src={sticker.src} alt="" width={72} height={72} unoptimized draggable={false} className="h-full w-full object-contain transition-transform group-hover:scale-105"/>
                                            {locked && <span className="absolute bottom-1 right-1 rounded bg-popover/90 p-0.5 text-muted-foreground"><LockKeyhole aria-hidden="true" className="h-3 w-3"/></span>}
                                            {selected && <span className="absolute right-1 top-1 rounded-full bg-violet-600 p-0.5 text-white"><Check aria-hidden="true" className="h-2.5 w-2.5"/></span>}
                                        </button>
                                    </li>;
                                })}
                            </ul>
                        ) : <div role="status" className="flex min-h-36 flex-col items-center justify-center px-3 text-center">
                            <Search aria-hidden="true" className="mb-3 h-7 w-7 text-muted-foreground/60"/>
                            <p className="text-sm font-medium">No stickers found</p>
                            <p className="mt-1 text-xs text-muted-foreground">Try a name or a mood, like happy.</p>
                        </div>}
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-3 border-t bg-muted/30 px-3 py-2.5">
                    <Image src={preview.src} alt={`${preview.name} sticker preview`} width={56} height={56} unoptimized className="h-12 w-12 shrink-0 object-contain"/>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{preview.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{isSelected(preview) ? 'Select to remove your reaction.'
                            : !vipActive ? `Unlock ${VIP_REACTIONS.length} stickers with allchat VIP.`
                            : mode === 'reaction' ? 'Select to react to this message.' : 'Select to send this sticker.'}</p>
                    </div>
                </div>
                {!vipActive && <div className="shrink-0 border-t border-violet-500/15 bg-violet-500/5 p-3">
                    <Button type="button" disabled={pending} onClick={onUpgrade} className="w-full gap-2 bg-violet-600 text-white hover:bg-violet-700"><Diamond aria-hidden="true" className="h-4 w-4"/>Unlock with allchat VIP</Button>
                </div>}
            </TabsContent>}
        </Tabs>
    );
}
