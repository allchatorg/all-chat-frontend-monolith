"use client";

import {ReactNode, useCallback, useEffect, useSyncExternalStore} from "react";
import {VipBadge} from "@/components/VipBadge";
import {applyVipBadgeUpdate, getVipBadge, subscribeVipBadge} from "@/lib/vipBadgeStore";
import {cn} from "@/lib/utils";
import {fontPresetStyle, type FontSnapshot} from "@/lib/fontPresets";
import {useUserFonts} from "@/lib/hooks/useUserFonts";

export interface UserNameProps extends Partial<FontSnapshot> {
    userId?: number;
    username: string;
    vipBadgeVisible?: boolean;
    vipBadgeRevision?: number;
    className?: string;
    onVipClick?: () => void;
    renderUsername?: (username: ReactNode) => ReactNode;
}

export function UserName({userId, username, vipBadgeVisible, vipBadgeRevision = 0, usernameFont, messageFont, fontRevision, className, onVipClick, renderUsername}: UserNameProps) {
    const fonts = useUserFonts(userId, {usernameFont, messageFont, fontRevision});
    const subscribe = useCallback((listener: () => void) => subscribeVipBadge(userId, listener), [userId]);
    const getSnapshot = useCallback(() => getVipBadge(userId), [userId]);
    const badge = useSyncExternalStore(subscribe, getSnapshot, () => undefined);

    useEffect(() => {
        if (userId !== undefined && vipBadgeVisible !== undefined) {
            applyVipBadgeUpdate({userId, vipBadgeVisible, vipBadgeRevision});
        }
    }, [userId, vipBadgeVisible, vipBadgeRevision]);

    const visible = badge && badge.vipBadgeRevision >= vipBadgeRevision
        ? badge.vipBadgeVisible && !(badge.vipBadgeRevision === vipBadgeRevision && vipBadgeVisible === false)
        : vipBadgeVisible === true;

    const name = <span className="min-w-0 truncate" style={fontPresetStyle(fonts.usernameFont)}>{username}</span>;

    return (
        <span className={cn("inline-flex min-w-0 max-w-full items-center gap-1 align-bottom", className)}>
            {renderUsername ? renderUsername(name) : name}
            {visible && <VipBadge onClick={onVipClick}/>}
        </span>
    );
}
