import {useEffect, useRef} from "react";
import {User} from "@/models/User";
import {updateTimeZone} from "@/api/settings/settingsAPI";

/**
 * Persists the browser's IANA time zone on the user once per session when it
 * differs from what the backend has. Used to deliver scheduled notifications
 * (e.g. the community-night reminder) at the user's local hour.
 */
export const useTimeZoneSync = (user: User | null) => {
    const syncedFor = useRef<number | null>(null);

    useEffect(() => {
        if (!user || syncedFor.current === user.id) return;
        let zone: string | undefined;
        try {
            zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        } catch {
            return;
        }
        if (!zone) return;
        syncedFor.current = user.id;
        if (zone === user.timeZone) return;
        updateTimeZone(zone).catch(() => {
            // Best-effort; retried on next session.
        });
    }, [user]);
};
