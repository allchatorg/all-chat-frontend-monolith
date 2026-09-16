"use client";

import * as React from 'react';
import {Drawer} from 'vaul';
import {X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {cn} from '@/lib/utils';

type FocusEventHandler = (event: Event) => void;

export interface BottomSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    description?: React.ReactNode;
    children: React.ReactNode;
    /** An optional trigger gives Radix a stable target for returning focus. */
    trigger?: React.ReactElement;
    /** Use tall for lists and search; content fits compact controls like radio. */
    size?: 'content' | 'tall';
    /** Disable when the feature already owns a scroll area and fixed controls. */
    scrollable?: boolean;
    bodyClassName?: string;
    contentClassName?: string;
    closeLabel?: string;
    initialFocusRef?: React.RefObject<HTMLElement | null>;
    onOpenAutoFocus?: FocusEventHandler;
    onCloseAutoFocus?: FocusEventHandler;
}

/**
 * Shared mobile modal surface. Features own their data and open state; this
 * component owns the glass shell, focus, dismissal, safe areas and drag handle.
 * Render it at the feature's mobile breakpoint; it does not change desktop UI.
 */
export function BottomSheet({
    open, onOpenChange, title, description, children, trigger,
    size = 'content', scrollable = true, bodyClassName, contentClassName,
    closeLabel = 'Close panel', initialFocusRef, onOpenAutoFocus, onCloseAutoFocus,
}: BottomSheetProps) {
    const closeRef = React.useRef<HTMLButtonElement>(null);
    const previousFocusRef = React.useRef<HTMLElement | null>(null);
    const descriptionId = React.useId();

    return (
        <Drawer.Root open={open} onOpenChange={onOpenChange} handleOnly autoFocus>
            {trigger && <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>}
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50"/>
                <Drawer.Content
                    aria-describedby={description ? descriptionId : undefined}
                    className={cn(
                        'glass-dialog fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-3xl outline-none',
                        size === 'tall' && 'h-[90dvh]',
                        contentClassName,
                    )}
                    onOpenAutoFocus={(event) => {
                        previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
                        onOpenAutoFocus?.(event);
                        if (event.defaultPrevented) return;
                        event.preventDefault();
                        (initialFocusRef?.current ?? closeRef.current)?.focus({preventScroll: true});
                    }}
                    onCloseAutoFocus={(event) => {
                        onCloseAutoFocus?.(event);
                        if (event.defaultPrevented || trigger) return;
                        event.preventDefault();
                        if (previousFocusRef.current?.isConnected) previousFocusRef.current.focus({preventScroll: true});
                    }}
                >
                    <div className="flex shrink-0 justify-center py-4">
                        <Drawer.Handle className="bg-muted-foreground/35"/>
                    </div>
                    <div className="flex shrink-0 items-start justify-between gap-4 px-5 pb-4">
                        <div className="min-w-0 space-y-1">
                            <Drawer.Title className="break-words text-lg font-semibold">{title}</Drawer.Title>
                            {description && <Drawer.Description id={descriptionId} className="text-sm text-muted-foreground">{description}</Drawer.Description>}
                        </div>
                        <Drawer.Close asChild>
                            <Button ref={closeRef} type="button" variant="ghost" size="icon" className="glass-control h-11 w-11 shrink-0 rounded-full" aria-label={closeLabel}>
                                <X className="h-5 w-5" aria-hidden="true"/>
                            </Button>
                        </Drawer.Close>
                    </div>
                    <div
                        data-vaul-no-drag
                        className={cn(
                            'min-h-0 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]',
                            scrollable ? 'overflow-y-auto overscroll-contain' : 'flex flex-1 flex-col overflow-hidden',
                            bodyClassName,
                        )}
                    >
                        {children}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}
