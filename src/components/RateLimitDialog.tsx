"use client";

import React, {useEffect, useMemo, useState} from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {clearRateLimitOpenFlag, rateLimitBus, RateLimitEvent} from "@/lib/rateLimit";
import {ShieldAlert} from "lucide-react";

export default function RateLimitDialog() {
    const [open, setOpen] = useState(false);
    const [event, setEvent] = useState<RateLimitEvent | null>(null);
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

    useEffect(() => {
        const unsub = rateLimitBus.subscribe((e) => {
            setEvent(e);
            setOpen(true);
            if (typeof e.retryAfterSeconds === "number" && e.retryAfterSeconds > 0) {
                setSecondsLeft(e.retryAfterSeconds);
            } else {
                setSecondsLeft(null);
            }
        });

        return () => {
            unsub();
        };
    }, []);

    useEffect(() => {
        if (secondsLeft == null) return;
        if (!open) return;
        if (secondsLeft <= 0) return;

        const id = setInterval(() => {
            setSecondsLeft((s) => (s == null ? s : Math.max(0, s - 1)));
        }, 1000);
        return () => clearInterval(id);
    }, [secondsLeft, open]);

    const description = useMemo(() => {
        const base = event?.message ?? "You're doing that too much right now. Please slow down and try again in a moment.";
        if (secondsLeft != null) {
            const s = secondsLeft;
            if (s > 0) return `${base} You can try again in ${s} second${s === 1 ? "" : "s"}.`;
            return `${base} You can try now.`;
        }
        return base;
    }, [event?.message, secondsLeft]);

    return (
        <AlertDialog
            open={open}
            onOpenChange={(v) => {
                setOpen(v);
                if (!v) {
                    // allow subsequent 429s to show dialog
                    clearRateLimitOpenFlag();
                }
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <ShieldAlert className="h-5 w-5 text-amber-600"/>
                        Too many requests
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction autoFocus>
                        Got it
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
