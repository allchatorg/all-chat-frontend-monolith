"use client";

import {ReactNode, useCallback, useEffect, useSyncExternalStore} from "react";
import {ProBadge} from "@/components/ProBadge";
import {applyProBadgeUpdate, getProBadge, subscribeProBadge} from "@/lib/proBadgeStore";
import {cn} from "@/lib/utils";
import {fontPresetStyle, type FontSnapshot} from "@/lib/fontPresets";
import {useUserFonts} from "@/lib/hooks/useUserFonts";

export interface UserNameProps extends Partial<FontSnapshot> {
    userId?: number;
    username: string;
    proBadgeVisible?: boolean;
    proBadgeRevision?: number;
    className?: string;
    onProClick?: () => void;
    renderUsername?: (username: ReactNode) => ReactNode;
}

export function UserName({userId, username, proBadgeVisible, proBadgeRevision = 0, usernameFont, messageFont, fontRevision, className, onProClick, renderUsername}: UserNameProps) {
    const fonts = useUserFonts(userId, {usernameFont, messageFont, fontRevision});
    const subscribe = useCallback((listener: () => void) => subscribeProBadge(userId, listener), [userId]);
    const getSnapshot = useCallback(() => getProBadge(userId), [userId]);
    const badge = useSyncExternalStore(subscribe, getSnapshot, () => undefined);

    useEffect(() => {
        if (userId !== undefined && proBadgeVisible !== undefined) {
            applyProBadgeUpdate({userId, proBadgeVisible, proBadgeRevision});
        }
    }, [userId, proBadgeVisible, proBadgeRevision]);

    const visible = badge && badge.proBadgeRevision >= proBadgeRevision
        ? badge.proBadgeVisible && !(badge.proBadgeRevision === proBadgeRevision && proBadgeVisible === false)
        : proBadgeVisible === true;

    const name = <span className="min-w-0 truncate" style={fontPresetStyle(fonts.usernameFont)}>{username}</span>;

    return (
        <span className={cn("inline-flex min-w-0 max-w-full items-center gap-1 align-bottom", className)}>
            {renderUsername ? renderUsername(name) : name}
            {visible && <ProBadge onClick={onProClick}/>}
        </span>
    );
}
