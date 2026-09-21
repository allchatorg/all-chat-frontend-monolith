'use client';

import {useId, useMemo, useRef, useState} from 'react';
import Image from 'next/image';
import {Check, Diamond, LockKeyhole, Search, Sparkles, Sticker, X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {useProDialog} from '@/features/pro/useProDialog';
import {cn} from '@/lib/utils';
import {PRO_STICKERS, ProSticker} from './catalog';

interface StickerPickerProps {
    proActive: boolean;
    disabled?: boolean;
    selectedStickerId?: string;
    onSelect: (sticker: ProSticker) => void;
}

export function StickerPicker({proActive, disabled, selectedStickerId, onSelect}: StickerPickerProps) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [preview, setPreview] = useState<ProSticker>(PRO_STICKERS[0]);
    const searchRef = useRef<HTMLInputElement>(null);
    const selectedOnCloseRef = useRef(false);
    const headingId = useId();
    const searchId = useId();
    const descriptionId = useId();
    const openPro = useProDialog();
    const stickers = useMemo(() => {
        const normalized = query.trim().toLocaleLowerCase();
        return PRO_STICKERS.filter(sticker =>
            [sticker.name, sticker.id, ...sticker.tags].some(value => value.toLocaleLowerCase().includes(normalized)));
    }, [query]);

    const handleSelect = (sticker: ProSticker) => {
        setPreview(sticker);
        if (!proActive || disabled) return;
        selectedOnCloseRef.current = true;
        onSelect(sticker);
        setOpen(false);
    };

    return (
        <Popover open={open && !disabled} onOpenChange={nextOpen => {
            setOpen(nextOpen);
            if (nextOpen) setQuery('');
        }}>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={disabled}
                    aria-label="Choose a sticker"
                    title="Stickers"
                    className={cn('glass-control relative h-10 w-10 shrink-0',
                        (open || selectedStickerId) && 'border-violet-400/60 text-violet-600 dark:text-violet-300')}
                >
                    <Sticker aria-hidden="true" className="h-[18px] w-[18px]"/>
                    {selectedStickerId && <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-violet-500"/>}
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="end"
                side="top"
                sideOffset={10}
                collisionPadding={12}
                aria-labelledby={headingId}
                aria-describedby={descriptionId}
                className="flex max-h-[min(580px,var(--radix-popover-content-available-height))] w-[min(390px,calc(100vw-24px))] flex-col overflow-hidden rounded-xl border border-border bg-popover p-0 text-popover-foreground shadow-2xl"
                onOpenAutoFocus={event => {
                    event.preventDefault();
                    searchRef.current?.focus({preventScroll: true});
                }}
                onCloseAutoFocus={event => {
                    // The composer receives focus after attaching a sticker.
                    if (selectedOnCloseRef.current) event.preventDefault();
                    selectedOnCloseRef.current = false;
                }}
            >
                <div className="flex shrink-0 items-center justify-between border-b px-4">
                    <h2 id={headingId} className="flex items-center gap-2 border-b-2 border-violet-500 py-3.5 text-sm font-semibold">
                        <Sticker aria-hidden="true" className="h-4 w-4"/>Stickers
                    </h2>
                    <span className="flex items-center gap-1.5 rounded-md bg-violet-500/10 px-2 py-1 text-[11px] font-semibold text-violet-600 dark:text-violet-300">
                        <Diamond aria-hidden="true" className="h-3 w-3"/>allchat Pro
                    </span>
                </div>

                <div className="shrink-0 px-3 pb-3 pt-3">
                    <label htmlFor={searchId} className="sr-only">Search stickers</label>
                    <div className="flex items-center gap-2 rounded-lg border border-transparent bg-muted/70 px-3 focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/15">
                        <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground"/>
                        <input
                            ref={searchRef}
                            id={searchId}
                            value={query}
                            onChange={event => setQuery(event.target.value)}
                            placeholder="Find the right reaction"
                            autoComplete="off"
                            className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                        {query && <button type="button" onClick={() => {setQuery(''); searchRef.current?.focus();}} aria-label="Clear sticker search" className="rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-violet-500"><X aria-hidden="true" className="h-3.5 w-3.5"/></button>}
                    </div>
                </div>

                <div className="flex min-h-0 flex-1">
                    <div aria-hidden="true" className="flex w-12 shrink-0 justify-center border-r bg-muted/20 pt-2">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/15 text-violet-600 dark:text-violet-300"><Sparkles className="h-5 w-5"/></div>
                    </div>
                    <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-3">
                        <div className="flex items-center justify-between px-1 pb-2 pt-1">
                            <h3 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Internet classics</h3>
                            <span className="text-[11px] tabular-nums text-muted-foreground" aria-live="polite">{stickers.length} stickers</span>
                        </div>
                        {stickers.length > 0 ? (
                            <ul aria-label="Internet classics sticker pack" className="grid grid-cols-4 gap-1">
                                {stickers.map(sticker => (
                                    <li key={sticker.id}>
                                        <button
                                            type="button"
                                            aria-label={proActive ? `Add ${sticker.name} sticker` : `Preview ${sticker.name} sticker, requires allchat Pro`}
                                            aria-pressed={selectedStickerId === sticker.id}
                                            onMouseEnter={() => setPreview(sticker)}
                                            onFocus={() => setPreview(sticker)}
                                            onClick={() => handleSelect(sticker)}
                                            title={sticker.name}
                                            className={cn('group relative flex aspect-square w-full items-center justify-center rounded-lg border border-transparent p-1.5 transition-colors hover:bg-muted focus-visible:border-violet-500 focus-visible:bg-violet-500/10 focus-visible:outline-none',
                                                preview.id === sticker.id && 'bg-muted/80', selectedStickerId === sticker.id && 'border-violet-500/50 bg-violet-500/10')}
                                        >
                                            <Image src={sticker.src} alt="" width={96} height={96} unoptimized draggable={false} className="h-full w-full object-contain transition-transform group-hover:scale-105"/>
                                            {!proActive && <span className="absolute bottom-1 right-1 rounded bg-popover/90 p-0.5 text-muted-foreground"><LockKeyhole aria-hidden="true" className="h-3 w-3"/></span>}
                                            {selectedStickerId === sticker.id && <span className="absolute right-1 top-1 rounded-full bg-violet-600 p-0.5 text-white"><Check aria-hidden="true" className="h-2.5 w-2.5"/></span>}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div role="status" className="flex min-h-36 flex-col items-center justify-center px-3 text-center">
                                <Search aria-hidden="true" className="mb-3 h-7 w-7 text-muted-foreground/60"/>
                                <p className="text-sm font-medium">No stickers found</p>
                                <p className="mt-1 text-xs text-muted-foreground">Try a name or a mood, like happy.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex shrink-0 items-center gap-3 border-t bg-muted/30 px-4 py-2.5">
                    <Image src={preview.src} alt={`${preview.name} sticker preview`} width={64} height={64} unoptimized className="h-14 w-14 shrink-0 object-contain"/>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{preview.name}</p>
                        <p id={descriptionId} className="mt-0.5 text-xs text-muted-foreground">{proActive ? 'Click a sticker to add it to your message.' : 'Preview the pack. Unlock every sticker with Pro.'}</p>
                    </div>
                </div>
                {!proActive && <div className="shrink-0 border-t border-violet-500/15 bg-violet-500/5 p-3">
                    <Button type="button" onClick={() => {selectedOnCloseRef.current = true; setOpen(false); openPro();}} className="w-full gap-2 bg-violet-600 text-white hover:bg-violet-700"><Diamond aria-hidden="true" className="h-4 w-4"/>Unlock with allchat Pro</Button>
                </div>}
            </PopoverContent>
        </Popover>
    );
}
