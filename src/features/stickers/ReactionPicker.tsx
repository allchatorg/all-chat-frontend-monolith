'use client';

import {useRef, useState} from 'react';
import {Reaction} from '@/models/Reaction';
import {cn} from '@/lib/utils';
import {toCustomReactionToken} from './catalog';
import {EmojiBrowser} from './EmojiBrowser';
import type {EmojiSelection} from './emojiTypes';

interface ReactionPickerProps {
    proActive: boolean;
    reactions: readonly Reaction[];
    onSelect: (emoji: string, emojiId: string) => Promise<void>;
    onClose: () => void;
    onUpgrade: () => void;
    /** Overrides the popover-sized height, e.g. to fill a bottom sheet. */
    className?: string;
}

export function ReactionPicker({proActive, reactions, onSelect, onClose, onUpgrade, className}: ReactionPickerProps) {
    const [pending, setPending] = useState(false);
    const pendingRef = useRef(false);
    const selectedTokens = new Set(reactions.filter(reaction => reaction.reactedByCurrentUser).map(reaction => reaction.emoji));

    const selectReaction = async (selection: EmojiSelection) => {
        if (pendingRef.current) return;
        const emoji = selection.kind === 'custom' ? toCustomReactionToken(selection.id) : selection.native;
        const emojiId = selection.kind === 'custom' ? emoji : selection.id;
        pendingRef.current = true;
        setPending(true);
        try {
            await onSelect(emoji, emojiId);
            onClose();
        } finally {
            pendingRef.current = false;
            setPending(false);
        }
    };

    return <div className={cn('h-[min(520px,var(--radix-popover-content-available-height,520px))] min-h-0', className)}>
        <EmojiBrowser mode="reaction" proActive={proActive} selectedReactionTokens={selectedTokens}
                      pending={pending} onSelect={selectReaction} onUpgrade={onUpgrade}/>
    </div>;
}
