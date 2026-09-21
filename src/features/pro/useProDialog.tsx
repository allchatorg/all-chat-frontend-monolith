'use client';

import {useId, useRef} from 'react';
import {useDialog} from '@/components/providers/DialogProvider';
import {ProDialog} from './ProDialog';

export function useProDialog() {
    const {open} = useDialog();
    const instanceId = useId();
    const opening = useRef(0);

    return () => open(<ProDialog key={`${instanceId}-${++opening.current}`}/>, {
        title: 'allchat Pro',
        focusContent: true,
        className: 'h-dvh w-screen max-w-none grid-rows-[minmax(0,1fr)] overflow-hidden rounded-none border-0 p-0 sm:h-[min(900px,90dvh)] sm:w-[92vw] sm:max-w-4xl sm:rounded-2xl [&>button]:z-10 [&>button]:rounded-full [&>button]:bg-background [&>button]:p-2 [&>button]:opacity-100',
    });
}
