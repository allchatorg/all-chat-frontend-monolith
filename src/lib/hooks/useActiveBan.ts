import {useEffect, useState} from "react";
import {format} from "date-fns";
import {searchActiveBans} from "@/api/admin/adminAPI";
import {Ban} from "@/models/Ban";
import {BanTypeEnum} from "@/models/BanTypeEnum";
import {getReportTypeLabel, isCsamReportType} from "@/lib/reportUtils";

// Older data can hold several active bans for one user; the one a new ban has to match is the strongest.
const strength = (ban: Ban): number =>
    (isCsamReportType(ban.reportType) ? 2e15 : 0)
    + (ban.type === BanTypeEnum.PERMANENT ? 1e15 : ban.expiresAt ? new Date(ban.expiresAt).getTime() : 0);

/**
 * The ban a new one would replace: undefined while loading, null when the user isn't banned.
 * A failed lookup reads as "not banned": the server still refuses a ban that would weaken the current one.
 */
export function useActiveBan(userId: number | undefined, refreshKey?: unknown): Ban | null | undefined {
    const [ban, setBan] = useState<Ban | null | undefined>(undefined);

    useEffect(() => {
        if (!userId) {
            setBan(null);
            return;
        }

        let cancelled = false;
        searchActiveBans(String(userId), 0, 10)
            .then((page) => {
                if (cancelled) return;
                // The search also matches a username made of these digits.
                const bans = page.content.filter((found) => found.userId === userId);
                setBan(bans.sort((a, b) => strength(b) - strength(a))[0] ?? null);
            })
            .catch(() => {
                if (!cancelled) setBan(null);
            });

        return () => {
            cancelled = true;
        };
    }, [userId, refreshKey]);

    return ban;
}

/** "permanently, for Spam" or "until Nov 14th, 2026 at 1:05 PM, for Spam". */
export const describeBan = (ban: Ban): string => {
    const length = ban.type === BanTypeEnum.PERMANENT || !ban.expiresAt
        ? "permanently"
        : `until ${format(new Date(ban.expiresAt), "PPP 'at' p")}`;
    return `${length}, for ${getReportTypeLabel(ban.reportType)}`;
};
