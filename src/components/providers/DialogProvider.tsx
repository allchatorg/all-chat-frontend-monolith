'use client';
import {createContext, ReactNode, useContext, useEffect, useRef, useState} from "react";
import {Dialog, DialogContent, DialogTitle} from "../ui/dialog";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
import {cn} from "@/lib/utils";
import {useStripeInteraction} from '@/components/billing/stripe';

type DialogContextType = {
    open: (content: ReactNode, options?: { className?: string; overlayClassName?: string; title?: string; focusContent?: boolean; allowStripe?: boolean }) => void;
    close: () => void;
};

const DialogContext = createContext<DialogContextType | null>(null);

export const DialogProvider = ({children}: { children: ReactNode }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [content, setContent] = useState<ReactNode | null>(null);
    const [className, setClassName] = useState<string | undefined>(undefined);
    const [overlayClassName, setOverlayClassName] = useState<string | undefined>(undefined);
    const [title, setTitle] = useState('Dialog');
    const [focusContent, setFocusContent] = useState(false);
    const [allowStripe, setAllowStripe] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const {active: stripeActive, busy: stripeBusy} = useStripeInteraction();
    const lastFocus = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (!openDialog || !allowStripe) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {document.body.style.overflow = previous;};
    }, [openDialog, allowStripe]);


    const open = (content: ReactNode, options?: { className?: string; overlayClassName?: string; title?: string; focusContent?: boolean; allowStripe?: boolean }) => {
        setContent(null);
        setContent(content);
        setClassName(options?.className);
        setOverlayClassName(options?.overlayClassName);
        setTitle(options?.title || 'Dialog');
        setFocusContent(options?.focusContent === true);
        setAllowStripe(options?.allowStripe === true);
        setOpenDialog(true);
    };

    const close = () => {
        if (stripeBusy) return;
        setOpenDialog(false);
    };

    return (
        <DialogContext.Provider value={{open, close}}>
            {children}
            {/* Keep the same content mounted while Stripe moves focus to its 3DS iframe. */}
            <Dialog modal={!allowStripe} open={openDialog} onOpenChange={(open) => !open && close()}>
                <VisuallyHidden>
                    <DialogTitle>{title}</DialogTitle>
                </VisuallyHidden>
                <DialogContent
                    ref={contentRef}
                    nonModalBackdrop={allowStripe}
                    aria-modal="true"
                    showCloseButton={!stripeBusy}
                    onFocusCapture={event => {lastFocus.current = event.target as HTMLElement;}}
                    onPointerDownOutside={event => {if (allowStripe) event.preventDefault();}}
                    onFocusOutside={event => {
                        if (!allowStripe) return;
                        event.preventDefault();
                        const target = event.target as HTMLElement | null;
                        if (stripeActive || target?.closest('[role="dialog"], [role="alertdialog"], [role="listbox"], [role="menu"], [data-radix-popper-content-wrapper]')) return;
                        const destination = lastFocus.current?.isConnected ? lastFocus.current : contentRef.current;
                        destination?.focus({preventScroll: true});
                    }}
                    onEscapeKeyDown={event => {if (stripeBusy) event.preventDefault();}}
                    tabIndex={focusContent ? -1 : undefined}
                    onOpenAutoFocus={event => {
                        if (!focusContent) return;
                        event.preventDefault();
                        contentRef.current?.focus({preventScroll: true});
                    }}
                    aria-describedby={undefined}
                    className={cn("px-4 py-4 rounded-lg", className)}
                    overlayClassName={overlayClassName}
                >
                    {content}
                </DialogContent>
            </Dialog>
        </DialogContext.Provider>
    );
};

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) throw new Error("useDialog must be used inside DialogProvider");
    return context;
};
