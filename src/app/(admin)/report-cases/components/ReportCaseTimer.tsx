"use client";

import {useEffect, useState} from "react";
import {ReportCaseTriage} from "@/models/ReportCaseTriage";
import {formatElapsed} from "@/lib/reportUtils";

const TICK_MS = 30_000;

type Props = Pick<ReportCaseTriage, "createdAt" | "firstActionDueAt" | "firstActionAt"> & {
    resolutionDate: string | null
};

function getFirstActionStatus({firstActionDueAt, firstActionAt, resolutionDate}: Props, now: number) {
    if (!firstActionDueAt) {
        return null;
    }

    const due = new Date(firstActionDueAt).getTime();
    if (firstActionAt) {
        const actedAt = new Date(firstActionAt).getTime();
        return actedAt <= due
            ? {label: "Acted in time", className: "text-green-600 dark:text-green-400"}
            : {label: `Acted ${formatElapsed(actedAt - due)} late`, className: "text-amber-600 dark:text-amber-400"};
    }

    if (resolutionDate) {
        return null;
    }

    return due > now
        ? {label: `Act within ${formatElapsed(due - now)}`, className: "text-foreground"}
        : {label: `Overdue ${formatElapsed(now - due)}`, className: "text-red-600 dark:text-red-400"};
}

/** Time left for the case's first action (policy P-1) and how long the case has been open. */
export function ReportCaseTimer(props: Props) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const interval = setInterval(() => setNow(Date.now()), TICK_MS);
        return () => clearInterval(interval);
    }, []);

    const status = getFirstActionStatus(props, now);
    const openedAt = new Date(props.createdAt).getTime();
    const openUntil = props.resolutionDate ? new Date(props.resolutionDate).getTime() : now;

    return (
        <div className="flex flex-col whitespace-nowrap text-xs">
            {status && <span className={`font-medium ${status.className}`}>{status.label}</span>}
            <span className="text-muted-foreground">
                {props.resolutionDate ? "Was open" : "Open"} {formatElapsed(openUntil - openedAt)}
            </span>
        </div>
    );
}
