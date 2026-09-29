'use client';

import {useEffect, useRef, type ReactNode} from 'react';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {useStripeInteraction} from './stripe';

export function CardDialog({open, onOpenChange, busy, trigger, children}: {
    open: boolean; onOpenChange: (open: boolean) => void; busy?: boolean; trigger: ReactNode; children: ReactNode;
}) {
    const {active, busy: stripeBusy} = useStripeInteraction();
    const content = useRef<HTMLDivElement>(null);
    const lastFocus = useRef<HTMLElement | null>(null);
    const locked = busy || stripeBusy;
    useEffect(() => {
        if (!open) return;
        const overflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {document.body.style.overflow = overflow;};
    }, [open]);
    return <Dialog modal={false} open={open} onOpenChange={value => {if (!locked) onOpenChange(value);}}>
        <DialogTrigger asChild>{trigger}</DialogTrigger>
        <DialogContent ref={content} nonModalBackdrop aria-modal="true" showCloseButton={!locked} className="sm:max-w-[425px]"
            onFocusCapture={event => {lastFocus.current = event.target as HTMLElement;}}
            onPointerDownOutside={event => event.preventDefault()}
            onEscapeKeyDown={event => {if (locked) event.preventDefault();}}
            onFocusOutside={event => {event.preventDefault(); if (!active) (lastFocus.current?.isConnected ? lastFocus.current : content.current)?.focus({preventScroll: true});}}>
            <DialogHeader><DialogTitle>Add payment method</DialogTitle><DialogDescription>Add a credit or debit card to your account.</DialogDescription></DialogHeader>
            {children}
        </DialogContent>
    </Dialog>;
}
