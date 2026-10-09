'use client';

import {useCallback, useEffect, useSyncExternalStore} from 'react';
import {DEFAULT_FONT_SNAPSHOT, FontSnapshot, resolveFontSnapshot} from '@/lib/fontPresets';
import {applyFontUpdate, getFontSnapshot, subscribeFonts} from '@/lib/fontStore';
import {subscribeVipBadge} from '@/lib/vipBadgeStore';

export function useUserFonts(userId?: number, snapshot?: Partial<FontSnapshot>): FontSnapshot {
    const {usernameFont, messageFont, fontRevision} = snapshot ?? {};
    const subscribe = useCallback((listener: () => void) => {
        const unsubscribe = subscribeFonts(userId, listener);
        // Share the existing batched identity lookup/reconnect registration,
        // including message-only views that do not render a username.
        const unregister = subscribeVipBadge(userId, () => {});
        return () => {unsubscribe(); unregister();};
    }, [userId]);
    const getSnapshot = useCallback(() => getFontSnapshot(userId), [userId]);
    const cached = useSyncExternalStore(subscribe, getSnapshot, () => undefined);

    useEffect(() => {
        applyFontUpdate({userId, usernameFont, messageFont, fontRevision});
    }, [userId, usernameFont, messageFont, fontRevision]);

    return resolveFontSnapshot(cached, snapshot) ?? DEFAULT_FONT_SNAPSHOT;
}
