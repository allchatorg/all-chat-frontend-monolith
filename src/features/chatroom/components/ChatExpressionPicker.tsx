'use client';

import {useEffect, useId, useRef, useState} from 'react';
import {Smile, Sticker} from 'lucide-react';
import {useSelector} from 'react-redux';
import {toast} from 'sonner';
import {Button} from '@/components/ui/button';
import {Popover, PopoverAnchor, PopoverContent} from '@/components/ui/popover';
import {selectUser} from '@/redux/user/userSelectors';
import {useVipDialog} from '@/features/vip/useVipDialog';
import {ExpressionPicker, ExpressionPickerTab} from '@/features/stickers/ExpressionPicker';
import {VipReaction} from '@/features/stickers/catalog';
import type {EmojiSelection} from '@/features/stickers/emojiTypes';

interface ChatExpressionPickerProps {
    disabled?: boolean;
    pending?: boolean;
    allowStickers?: boolean;
    onEmojiSelect: (emoji: EmojiSelection) => void;
    onStickerSelect: (sticker: VipReaction) => Promise<void>;
    onRestoreComposerFocus: () => void;
}

/** Two entry points into one picker; changing entry points switches its active tab. */
export function ChatExpressionPicker({disabled, pending, allowStickers = true, onEmojiSelect, onStickerSelect, onRestoreComposerFocus}: ChatExpressionPickerProps) {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<ExpressionPickerTab>('emoji');
    const [sending, setSending] = useState(false);
    const sendingRef = useRef(false);
    const triggerGroupRef = useRef<HTMLDivElement>(null);
    const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const skipRestoreFocusRef = useRef(false);
    const focusComposerOnCloseRef = useRef(false);
    const contentId = useId();
    const vipActive = useSelector(selectUser)?.vipActive === true;
    const openVip = useVipDialog();
    const busy = sending || pending;
    const visible = open && (!disabled || sending);
    const activeTab = allowStickers ? tab : 'emoji';

    useEffect(() => {
        if (disabled && !sending) setOpen(false);
    }, [disabled, sending]);

    const sendSticker = async (sticker: VipReaction) => {
        if (disabled || busy || sendingRef.current) return;
        sendingRef.current = true;
        setSending(true);
        try {
            await onStickerSelect(sticker);
            focusComposerOnCloseRef.current = true;
            setOpen(false);
        } catch (error) {
            const failure = error as {response?: {data?: {message?: string}}; message?: string} | null;
            toast.error(failure?.response?.data?.message || failure?.message || 'Could not send your sticker. Please try again.');
        } finally {
            sendingRef.current = false;
            setSending(false);
        }
    };

    return (
        <Popover open={visible} onOpenChange={setOpen}>
            <PopoverAnchor asChild>
                <div ref={triggerGroupRef} className="flex shrink-0 items-center gap-1">
                    {([{value: 'stickers', label: 'Stickers', Icon: Sticker}, {value: 'emoji', label: 'Emoji', Icon: Smile}] as const).filter(({value}) => allowStickers || value === 'emoji').map(({value, label, Icon}) => (
                        <Button key={value} type="button" variant="ghost" size="icon"
                                disabled={disabled || busy}
                                aria-label={value === 'emoji' ? 'Choose an emoji' : 'Choose a sticker'} title={label}
                                aria-haspopup="dialog" aria-expanded={visible && activeTab === value}
                                aria-controls={visible ? contentId : undefined}
                                className="composer-action h-10 w-10 shrink-0 lg:h-8 lg:w-8"
                                onClick={event => {
                                    lastTriggerRef.current = event.currentTarget;
                                    focusComposerOnCloseRef.current = false;
                                    const nextOpen = !visible || activeTab !== value;
                                    setTab(value);
                                    setOpen(nextOpen);
                                    if (visible && nextOpen) requestAnimationFrame(() => {
                                        contentRef.current?.querySelector<HTMLButtonElement>('[role="tab"][data-state="active"]')?.focus();
                                    });
                                }}>
                            <Icon aria-hidden="true" className="h-4 w-4"/>
                        </Button>
                    ))}
                </div>
            </PopoverAnchor>
            <PopoverContent ref={contentRef} id={contentId} align="end" side="top" sideOffset={8} collisionPadding={12}
                            aria-label="Choose emoji or stickers"
                            className="w-[min(380px,calc(100vw-24px))] overflow-hidden rounded-xl border bg-popover p-0 text-popover-foreground shadow-2xl"
                            onOpenAutoFocus={event => {
                                event.preventDefault();
                                contentRef.current?.querySelector<HTMLButtonElement>('[role="tab"][data-state="active"]')?.focus();
                            }}
                            onInteractOutside={event => {
                                // Both buttons belong to this popover even though only one anchor is needed.
                                if (event.target instanceof Node && triggerGroupRef.current?.contains(event.target)) event.preventDefault();
                            }}
                            onCloseAutoFocus={event => {
                                event.preventDefault();
                                if (!skipRestoreFocusRef.current && document.activeElement === document.body) {
                                    if (focusComposerOnCloseRef.current) onRestoreComposerFocus();
                                    else lastTriggerRef.current?.focus();
                                }
                                skipRestoreFocusRef.current = false;
                                focusComposerOnCloseRef.current = false;
                            }}>
                <ExpressionPicker tab={activeTab} onTabChange={setTab} allowStickers={allowStickers} mode="message" vipActive={vipActive} pending={busy || disabled}
                                  onEmojiSelect={emoji => {
                                      if (busy || disabled) throw new Error('The composer is currently unavailable.');
                                      onEmojiSelect(emoji);
                                      skipRestoreFocusRef.current = true;
                                      setOpen(false);
                                  }}
                                  onStickerSelect={sticker => void sendSticker(sticker)}
                                  onUpgrade={() => {
                                      skipRestoreFocusRef.current = true;
                                      setOpen(false);
                                      openVip();
                                  }}/>
            </PopoverContent>
        </Popover>
    );
}
