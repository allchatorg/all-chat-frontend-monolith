"use client";

import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {DropdownMenu, DropdownMenuContent} from '@/components/ui/dropdown-menu';
import {useRadio} from '@/components/providers/RadioProvider';
import {useIsMobile} from '@/lib/hooks/useIsMobile';
import {RadioSheet} from './RadioSheet';

const RadioMenuContext = createContext<{
    requestSheet: (item: HTMLElement) => void;
    finishMenuClose: (event: Event) => void;
} | null>(null);

export function useRadioMenu() {
    const context = useContext(RadioMenuContext);
    if (!context) throw new Error('Radio menu controls must be inside RadioMenuRoot');
    return context;
}

// Keep the sheet mounted outside the dropdown content, which unmounts on selection.
export function RadioMenuRoot({children}: {children: React.ReactNode}) {
    const {enabled} = useRadio();
    const isMobile = useIsMobile();
    const [sheetOpen, setSheetOpen] = useState(false);
    const sheetRequested = useRef(false);
    const returnFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => () => {
        sheetRequested.current = false;
    }, []);

    useEffect(() => {
        if (!enabled || !isMobile) {
            sheetRequested.current = false;
            setSheetOpen(false);
        }
    }, [enabled, isMobile]);

    return (
        <RadioMenuContext.Provider value={{
            requestSheet: (item) => {
                // Radix labels the root menu with its trigger's ID. Keep that
                // trigger for focus restoration after the menu has unmounted.
                const triggerId = item.closest('[role="menu"]')?.getAttribute('aria-labelledby');
                returnFocusRef.current = triggerId ? document.getElementById(triggerId) : null;
                sheetRequested.current = true;
            },
            finishMenuClose: (event) => {
                if (!sheetRequested.current) return;
                sheetRequested.current = false;
                if (!enabled || !isMobile) return;
                // Hand focus directly to the sheet after the menu's exit,
                // preventing its delayed autofocus from stealing focus back.
                event.preventDefault();
                setSheetOpen(true);
            },
        }}>
            <DropdownMenu modal={false}>{children}</DropdownMenu>
            <RadioSheet
                open={sheetOpen && enabled && isMobile}
                onOpenChange={setSheetOpen}
                onCloseAutoFocus={(event) => {
                    event.preventDefault();
                    if (returnFocusRef.current?.isConnected) returnFocusRef.current.focus({preventScroll: true});
                }}
            />
        </RadioMenuContext.Provider>
    );
}

export function RadioMenuContent({onCloseAutoFocus, ...props}: React.ComponentPropsWithoutRef<typeof DropdownMenuContent>) {
    const {finishMenuClose} = useRadioMenu();
    return <DropdownMenuContent {...props} onCloseAutoFocus={(event) => {
        onCloseAutoFocus?.(event);
        if (!event.defaultPrevented) finishMenuClose(event);
    }}/>;
}
