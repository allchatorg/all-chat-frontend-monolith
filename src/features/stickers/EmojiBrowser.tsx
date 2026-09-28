'use client';

import {memo, useCallback, useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type RefObject} from 'react';
import Image from 'next/image';
import data from '@emoji-mart/data';
import {Apple, Car, Check, Clock, Diamond, Flag, Hash, Leaf, Lightbulb, Loader2, LockKeyhole, Search, Smile, Sparkles, Trophy, X} from 'lucide-react';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';
import {PRO_REACTIONS, toCustomReactionToken} from './catalog';
import {getEmojiShortcode} from './emojiShortcodes';
import type {EmojiSelection} from './emojiTypes';

interface UnicodeEmoji {
    id: string;
    name: string;
    keywords?: string[];
    emoticons?: string[];
    skins: {native: string}[];
}

interface EmojiData {
    categories: {id: string; emojis: string[]}[];
    emojis: Record<string, UnicodeEmoji>;
    aliases: Record<string, string>;
}

interface EmojiEntry {
    key: string;
    name: string;
    selection: EmojiSelection;
}

interface EmojiSection {
    id: string;
    name: string;
    entries: EmojiEntry[];
}

interface EmojiBrowserProps {
    mode: 'reaction' | 'message';
    proActive: boolean;
    selectedReactionTokens?: ReadonlySet<string>;
    pending?: boolean;
    onSelect: (selection: EmojiSelection) => void | Promise<void>;
    onUpgrade: () => void;
}

const emojiData = data as EmojiData;
const columns = 8;
const recentStorageKey = 'allchat.emoji-browser.recents.v1';
const toneStorageKey = 'allchat.emoji-browser.skin-tone.v1';
const categoryDetails: Record<string, {name: string; Icon: typeof Smile}> = {
    recent: {name: 'Recent', Icon: Clock},
    pro: {name: 'allchat Pro', Icon: Sparkles},
    people: {name: 'Smileys & people', Icon: Smile},
    nature: {name: 'Animals & nature', Icon: Leaf},
    foods: {name: 'Food & drink', Icon: Apple},
    activity: {name: 'Activities', Icon: Trophy},
    places: {name: 'Travel & places', Icon: Car},
    objects: {name: 'Objects', Icon: Lightbulb},
    symbols: {name: 'Symbols', Icon: Hash},
    flags: {name: 'Flags', Icon: Flag},
};
const skinTones = [
    {name: 'Default', native: '👋'},
    {name: 'Light', native: '👋🏻'},
    {name: 'Medium-light', native: '👋🏼'},
    {name: 'Medium', native: '👋🏽'},
    {name: 'Medium-dark', native: '👋🏾'},
    {name: 'Dark', native: '👋🏿'},
];
const customById = new Map(PRO_REACTIONS.map(emoji => [emoji.id, emoji]));
const aliasesById = new Map<string, string[]>();
for (const [alias, id] of Object.entries(emojiData.aliases)) {
    aliasesById.set(id, [...(aliasesById.get(id) ?? []), alias]);
}
const searchableUnicode = new Map(Object.values(emojiData.emojis).map(emoji => [emoji.id,
    [emoji.id, `:${emoji.id}:`, emoji.name, ...(emoji.keywords ?? []), ...(emoji.emoticons ?? []), ...(aliasesById.get(emoji.id) ?? []),
        ...(aliasesById.get(emoji.id) ?? []).map(alias => `:${alias}:`),
        ...emoji.skins.map(skin => getEmojiShortcode({kind: 'unicode', id: emoji.id, native: skin.native})),
        ...emoji.skins.map(skin => skin.native)].join(' ').toLocaleLowerCase().replaceAll('_', ' ')]));
const searchableCustom = new Map(PRO_REACTIONS.map(emoji => [emoji.id,
    ['allchat Pro', emoji.id, getEmojiShortcode({kind: 'custom', id: emoji.id}), emoji.name, ...emoji.tags].join(' ').toLocaleLowerCase().replaceAll('_', ' ')]));

function selectionKey(selection: EmojiSelection): string {
    return selection.kind === 'custom' ? `custom:${selection.id}` : `unicode:${selection.id}:${selection.native}`;
}

function reactionToken(selection: EmojiSelection): string {
    return selection.kind === 'custom' ? toCustomReactionToken(selection.id) : selection.native;
}

function toEntry(selection: EmojiSelection): EmojiEntry | undefined {
    if (selection.kind === 'custom') {
        const custom = customById.get(selection.id);
        return custom ? {key: selectionKey(selection), name: custom.name, selection} : undefined;
    }
    const unicode = emojiData.emojis[selection.id];
    return unicode?.skins.some(skin => skin.native === selection.native)
        ? {key: selectionKey(selection), name: unicode.name, selection} : undefined;
}

function readRecents(): EmojiSelection[] {
    try {
        const stored: unknown = JSON.parse(localStorage.getItem(recentStorageKey) ?? '[]');
        if (!Array.isArray(stored)) return [];
        const seen = new Set<string>();
        return stored.filter((value): value is EmojiSelection => {
            if (!value || typeof value !== 'object' || typeof value.id !== 'string'
                || (value.kind !== 'custom' && value.kind !== 'unicode')) return false;
            const entry = toEntry(value);
            if (!entry || seen.has(entry.key)) return false;
            seen.add(entry.key);
            return true;
        }).slice(0, 32);
    } catch {
        return [];
    }
}

const customEntries = PRO_REACTIONS.map(emoji => toEntry({kind: 'custom', id: emoji.id})!);

interface EmojiGridProps {
    section: EmojiSection;
    headingId: string;
    focusedKey?: string;
    busy: boolean;
    mode: 'reaction' | 'message';
    proActive: boolean;
    selectedReactionTokens?: ReadonlySet<string>;
    buttonRefs: RefObject<Map<string, HTMLButtonElement>>;
    onPreview: (entry: EmojiEntry) => void;
    onFocus: (sectionId: string, entry: EmojiEntry) => void;
    onNavigate: (event: KeyboardEvent<HTMLButtonElement>, section: EmojiSection, index: number) => void;
    onSelect: (entry: EmojiEntry) => Promise<void>;
}

// Hover previews do not need to rerender the entire Unicode collection.
const EmojiGrid = memo(function EmojiGrid({section, headingId, focusedKey, busy, mode, proActive, selectedReactionTokens,
    buttonRefs, onPreview, onFocus, onNavigate, onSelect}: EmojiGridProps) {
    const focusKey = focusedKey && section.entries.some(entry => entry.key === focusedKey) ? focusedKey : section.entries[0]?.key;
    return <div role="grid" aria-labelledby={headingId} aria-colcount={columns} aria-rowcount={Math.ceil(section.entries.length / columns)}>
        {Array.from({length: Math.ceil(section.entries.length / columns)}, (_, row) => <div key={row} role="row" className="grid grid-cols-8 gap-0.5">
            {section.entries.slice(row * columns, (row + 1) * columns).map((entry, column) => {
                const index = row * columns + column;
                const custom = entry.selection.kind === 'custom' ? customById.get(entry.selection.id) : undefined;
                const selected = mode === 'reaction' && selectedReactionTokens?.has(reactionToken(entry.selection)) === true;
                const locked = Boolean(custom) && !proActive && !selected;
                const label = selected ? `Remove ${entry.name} reaction` : locked ? `${entry.name} emoji, unlock with allchat Pro`
                    : mode === 'reaction' ? `React with ${entry.name}` : `Insert ${entry.name} emoji`;
                return <div key={entry.key} role="gridcell" aria-selected={mode === 'reaction' ? selected : undefined}>
                    <button type="button" data-emoji-button ref={element => {const key = `${section.id}:${entry.key}`; if (element) buttonRefs.current?.set(key, element); else buttonRefs.current?.delete(key);}}
                        disabled={busy} aria-label={label} aria-pressed={mode === 'reaction' ? selected : undefined}
                        title={`${entry.name} ${getEmojiShortcode(entry.selection)}`}
                        tabIndex={entry.key === focusKey ? 0 : -1} onMouseEnter={() => onPreview(entry)}
                        onFocus={() => onFocus(section.id, entry)}
                        onKeyDown={event => onNavigate(event, section, index)} onClick={() => void onSelect(entry)}
                        className={cn('relative flex aspect-square w-full items-center justify-center rounded-md border border-transparent p-0.5 text-2xl hover:bg-muted focus-visible:border-violet-500 focus-visible:bg-violet-500/10 focus-visible:outline-none disabled:cursor-wait disabled:opacity-50', selected && 'border-violet-500/50 bg-violet-500/10')}>
                        {custom ? <Image src={custom.src} alt="" width={32} height={32} unoptimized draggable={false} className="h-full w-full object-contain"/>
                            : entry.selection.kind === 'unicode' && <span aria-hidden="true">{entry.selection.native}</span>}
                        {locked && <span className="absolute -bottom-0.5 -right-0.5 rounded bg-popover/95 p-0.5 text-muted-foreground"><LockKeyhole aria-hidden="true" className="h-2.5 w-2.5"/></span>}
                        {selected && <span className="absolute -right-0.5 -top-0.5 rounded-full bg-violet-600 p-0.5 text-white"><Check aria-hidden="true" className="h-2 w-2"/></span>}
                    </button>
                </div>;
            })}
        </div>)}
    </div>;
});

/** Both composer and reaction pickers use the same native and paid emoji collection. */
export function EmojiBrowser({mode, proActive, selectedReactionTokens, pending = false, onSelect, onUpgrade}: EmojiBrowserProps) {
    const [query, setQuery] = useState('');
    const [tone, setTone] = useState(0);
    const [recents, setRecents] = useState<EmojiSelection[]>([]);
    const [preview, setPreview] = useState<EmojiEntry>(customEntries[0]);
    const [selecting, setSelecting] = useState(false);
    const [focusedKeys, setFocusedKeys] = useState<Record<string, string>>({});
    const selectingRef = useRef(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const sectionRefs = useRef(new Map<string, HTMLElement>());
    const buttonRefs = useRef(new Map<string, HTMLButtonElement>());
    const searchId = useId();
    const headingPrefix = useId();
    const busy = pending || selecting;

    useEffect(() => {
        setRecents(readRecents());
        try {
            const savedTone = Number(localStorage.getItem(toneStorageKey));
            if (Number.isInteger(savedTone) && savedTone >= 0 && savedTone < skinTones.length) setTone(savedTone);
        } catch { /* Storage is optional in private browsing. */ }
    }, []);

    const sections = useMemo<EmojiSection[]>(() => {
        const nativeSections = emojiData.categories.map(category => ({
            id: category.id,
            name: categoryDetails[category.id]?.name ?? category.id,
            entries: category.emojis.flatMap(id => {
                const emoji = emojiData.emojis[id];
                if (!emoji) return [];
                return [toEntry({kind: 'unicode', id, native: (emoji.skins[tone] ?? emoji.skins[0]).native})!];
            }),
        }));
        const normalized = query.trim().toLocaleLowerCase().replaceAll('_', ' ');
        if (normalized) {
            const terms = normalized.split(/\s+/);
            const matches = [...customEntries, ...nativeSections.flatMap(section => section.entries)].filter(entry => {
                const searchable = entry.selection.kind === 'custom'
                    ? searchableCustom.get(entry.selection.id) : searchableUnicode.get(entry.selection.id);
                return terms.every(term => searchable?.includes(term));
            });
            return [{id: 'search', name: 'Search results', entries: matches}];
        }
        const recentEntries = recents.flatMap(selection => toEntry(selection) ?? []);
        return [
            ...(recentEntries.length ? [{id: 'recent', name: 'Recent', entries: recentEntries}] : []),
            {id: 'pro', name: 'allchat Pro', entries: customEntries},
            ...nativeSections,
        ];
    }, [query, recents, tone]);

    const isSelected = (entry: EmojiEntry) => mode === 'reaction' && selectedReactionTokens?.has(reactionToken(entry.selection)) === true;
    const isLocked = (entry: EmojiEntry) => entry.selection.kind === 'custom' && !proActive && !isSelected(entry);

    const select = useCallback(async (entry: EmojiEntry) => {
        if (pending || selectingRef.current) return;
        setPreview(entry);
        const removing = mode === 'reaction' && selectedReactionTokens?.has(reactionToken(entry.selection)) === true;
        if (entry.selection.kind === 'custom' && !proActive && !removing) {
            onUpgrade();
            return;
        }
        selectingRef.current = true;
        setSelecting(true);
        try {
            await onSelect(entry.selection);
            if (!removing) {
                const next = [entry.selection, ...readRecents().filter(value => selectionKey(value) !== entry.key)].slice(0, 32);
                setRecents(next);
                try { localStorage.setItem(recentStorageKey, JSON.stringify(next)); } catch { /* Storage is optional. */ }
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : mode === 'reaction'
                ? 'Could not update your reaction. Please try again.' : 'Could not add your emoji. Please try again.');
        } finally {
            selectingRef.current = false;
            setSelecting(false);
        }
    }, [pending, mode, selectedReactionTokens, proActive, onUpgrade, onSelect]);

    const focusEntry = useCallback((section: EmojiSection, index: number) => {
        const entry = section.entries[Math.max(0, Math.min(section.entries.length - 1, index))];
        if (entry) buttonRefs.current.get(`${section.id}:${entry.key}`)?.focus();
    }, []);

    const navigateGrid = useCallback((event: KeyboardEvent<HTMLButtonElement>, section: EmojiSection, index: number) => {
        let next: number;
        switch (event.key) {
            case 'ArrowRight': next = index + 1; break;
            case 'ArrowLeft': next = index - 1; break;
            case 'ArrowDown': next = index + columns; break;
            case 'ArrowUp': next = index - columns; break;
            case 'Home': next = event.ctrlKey || event.metaKey ? 0 : index - index % columns; break;
            case 'End': next = event.ctrlKey || event.metaKey ? section.entries.length - 1 : index - index % columns + columns - 1; break;
            default: return;
        }
        event.preventDefault();
        focusEntry(section, next);
    }, [focusEntry]);

    const onEntryFocus = useCallback((sectionId: string, entry: EmojiEntry) => {
        setPreview(entry);
        setFocusedKeys(current => current[sectionId] === entry.key ? current : {...current, [sectionId]: entry.key});
    }, []);

    const jumpToCategory = (id: string) => {
        if (query) setQuery('');
        // Clearing a search restores the category sections on the next render.
        requestAnimationFrame(() => {
            const section = sectionRefs.current.get(id);
            section?.scrollIntoView({block: 'start'});
            section?.querySelector<HTMLButtonElement>('[data-emoji-button]')?.focus({preventScroll: true});
        });
    };

    const previewCustom = preview.selection.kind === 'custom' ? customById.get(preview.selection.id) : undefined;
    const previewShortcode = getEmojiShortcode(preview.selection);
    const count = sections.reduce((total, section) => total + section.entries.length, 0);

    return <div aria-label={mode === 'reaction' ? 'Emoji reactions' : 'Emoji browser'} aria-busy={busy}
                className="flex h-full min-h-0 flex-col overflow-x-hidden overflow-y-auto overscroll-contain">
        <div className="shrink-0 px-3 pb-2 pt-3">
            <label htmlFor={searchId} className="sr-only">Search emojis</label>
            <div className="flex items-center gap-2 rounded-lg border border-transparent bg-muted/70 px-3 focus-within:border-violet-500/60 focus-within:ring-2 focus-within:ring-violet-500/15">
                <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground"/>
                <input ref={searchRef} id={searchId} value={query} disabled={busy}
                       onChange={event => setQuery(event.target.value)} placeholder="Find an emoji" autoComplete="off"
                       onKeyDown={event => {
                           if (event.key === 'ArrowDown' && sections[0]?.entries.length) {
                               event.preventDefault();
                               focusEntry(sections[0], 0);
                           }
                       }}
                       className="h-10 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"/>
                {busy ? <Loader2 aria-label={mode === 'reaction' ? 'Updating reaction' : 'Adding emoji'} className="h-4 w-4 animate-spin text-muted-foreground"/>
                    : query && <button type="button" onClick={() => {setQuery(''); searchRef.current?.focus();}}
                                       aria-label="Clear emoji search" className="rounded p-1 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-violet-500"><X aria-hidden="true" className="h-3.5 w-3.5"/></button>}
            </div>
            <div role="group" aria-label="Skin tone" className="mt-2 flex items-center justify-between gap-1">
                <span className="text-xs text-muted-foreground">Skin tone</span>
                <div className="flex gap-0.5">{skinTones.map((skin, index) => <button key={skin.name} type="button" disabled={busy}
                    aria-label={`${skin.name} skin tone`} aria-pressed={tone === index} title={`${skin.name} skin tone`}
                    className={cn('grid h-7 w-7 place-items-center rounded-md text-lg hover:bg-muted focus-visible:outline-2 focus-visible:outline-violet-500', tone === index && 'bg-violet-500/15 ring-1 ring-violet-500/40')}
                    onClick={() => {
                        setTone(index);
                        try { localStorage.setItem(toneStorageKey, String(index)); } catch { /* Storage is optional. */ }
                        if (preview.selection.kind === 'unicode') {
                            const emoji = emojiData.emojis[preview.selection.id];
                            setPreview(toEntry({kind: 'unicode', id: emoji.id, native: (emoji.skins[index] ?? emoji.skins[0]).native})!);
                        }
                    }}><span aria-hidden="true">{skin.native}</span></button>)}</div>
            </div>
        </div>
        <div className="flex min-h-28 flex-1 shrink-0">
            <nav aria-label="Emoji categories" className="flex w-11 shrink-0 flex-col items-center gap-0.5 overflow-x-hidden overflow-y-auto overscroll-contain border-r bg-muted/20 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {Object.entries(categoryDetails).map(([id, {name, Icon}]) => <button key={id} type="button" title={name}
                    disabled={busy || (id === 'recent' && recents.length === 0)} aria-label={name}
                    onClick={() => jumpToCategory(id)}
                    className={cn('grid h-8 w-8 max-w-full shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-violet-500 disabled:opacity-30', id === 'pro' && 'bg-violet-500/10 text-violet-600 dark:text-violet-300')}>
                    <Icon aria-hidden="true" className="h-4 w-4"/>
                </button>)}
            </nav>
            <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain px-2 pb-3">
                {query.trim() && <p role="status" className="px-1 pt-1 text-[10px] text-muted-foreground">{count} {count === 1 ? 'emoji' : 'emojis'} found</p>}
                {sections.map(section => <section key={section.id} ref={element => {if (element) sectionRefs.current.set(section.id, element); else sectionRefs.current.delete(section.id);}}
                    aria-labelledby={`${headingPrefix}-${section.id}`} className="scroll-mt-1 pb-2">
                    <h3 id={`${headingPrefix}-${section.id}`} className="flex items-center gap-2 px-1 pb-2 pt-3 text-[11px] font-semibold text-muted-foreground">
                        <span className="shrink-0">{section.name}</span>
                        <span aria-hidden="true" className="h-px min-w-0 flex-1 bg-current opacity-15"/>
                    </h3>
                    <EmojiGrid section={section} headingId={`${headingPrefix}-${section.id}`} focusedKey={focusedKeys[section.id]}
                               busy={busy} mode={mode} proActive={proActive} selectedReactionTokens={selectedReactionTokens}
                               buttonRefs={buttonRefs} onPreview={setPreview} onFocus={onEntryFocus} onNavigate={navigateGrid} onSelect={select}/>
                </section>)}
                {count === 0 && <div role="status" className="flex min-h-36 flex-col items-center justify-center px-3 text-center">
                    <Search aria-hidden="true" className="mb-3 h-7 w-7 text-muted-foreground/60"/>
                    <p className="text-sm font-medium">No emojis found</p>
                    <p className="mt-1 text-xs text-muted-foreground">Try a name or a mood, like happy.</p>
                </div>}
            </div>
        </div>
        <div className="flex min-h-18 shrink-0 items-center gap-3 border-t bg-muted/30 px-3 py-2.5">
            <div aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center text-4xl">
                {previewCustom ? <Image src={previewCustom.src} alt="" width={44} height={44} unoptimized className="h-full w-full object-contain"/>
                    : preview.selection.kind === 'unicode' && preview.selection.native}
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{preview.name}</p>
                <p className="mt-0.5 text-xs leading-4 text-muted-foreground">
                    {mode === 'reaction' ? 'Shortcode' : 'Type'} <code className="select-text break-all font-mono text-[11px]">{previewShortcode}</code>
                </p>
                {(isSelected(preview) || isLocked(preview)) && <p className="mt-1 text-xs text-muted-foreground">
                    {isSelected(preview) ? 'Select to remove your reaction.' : 'Unlock this emoji with allchat Pro.'}
                </p>}
            </div>
        </div>
        {!proActive && <div className="shrink-0 border-t border-violet-500/15 bg-violet-500/5 p-3">
            <Button type="button" disabled={busy} onClick={onUpgrade} className="w-full gap-2 bg-violet-600 text-white hover:bg-violet-700"><Diamond aria-hidden="true" className="h-4 w-4"/>Unlock with allchat Pro</Button>
        </div>}
    </div>;
}
