'use client';
import {createContext, ReactNode, useContext, useRef, useState} from "react";
import {Dialog, DialogContent, DialogTitle} from "../ui/dialog";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
import {cn} from "@/lib/utils";

type DialogContextType = {
    open: (content: ReactNode, options?: { className?: string; overlayClassName?: string; title?: string; focusContent?: boolean }) => void;
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
    const contentRef = useRef<HTMLDivElement>(null);


    const open = (content: ReactNode, options?: { className?: string; overlayClassName?: string; title?: string; focusContent?: boolean }) => {
        setContent(null);
        setContent(content);
        setClassName(options?.className);
        setOverlayClassName(options?.overlayClassName);
        setTitle(options?.title || 'Dialog');
        setFocusContent(options?.focusContent === true);
        setOpenDialog(true);
    };

    const close = () => {
        setOpenDialog(false);
    };

    return (
        <DialogContext.Provider value={{open, close}}>
            {children}
            <Dialog open={openDialog} onOpenChange={(open) => !open && close()}>
                <VisuallyHidden>
                    <DialogTitle>{title}</DialogTitle>
                </VisuallyHidden>
                <DialogContent
                    ref={contentRef}
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
