'use client';
import {createContext, ReactNode, useContext, useState} from "react";
import {Dialog, DialogContent, DialogTitle} from "../ui/dialog";
import {VisuallyHidden} from "@radix-ui/react-visually-hidden";
import {cn} from "@/lib/utils";

type DialogContextType = {
    open: (content: ReactNode, options?: { className?: string; overlayClassName?: string }) => void;
    close: () => void;
};

const DialogContext = createContext<DialogContextType | null>(null);

export const DialogProvider = ({children}: { children: ReactNode }) => {
    const [openDialog, setOpenDialog] = useState(false);
    const [content, setContent] = useState<ReactNode | null>(null);
    const [className, setClassName] = useState<string | undefined>(undefined);
    const [overlayClassName, setOverlayClassName] = useState<string | undefined>(undefined);


    const open = (content: ReactNode, options?: { className?: string; overlayClassName?: string }) => {
        setContent(null);
        setContent(content);
        setClassName(options?.className);
        setOverlayClassName(options?.overlayClassName);
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
                    <DialogTitle>Dialog</DialogTitle>
                </VisuallyHidden>
                <DialogContent
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
