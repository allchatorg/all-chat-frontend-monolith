import React from "react";
import {AlertTriangle} from "lucide-react";
import {RoomPromotionsSummary} from "@/models/RoomPromotionsSummary";

interface ArchiveRoomPromotionsWarningProps {
    summary: RoomPromotionsSummary | null;
    loadError: boolean;
}

const money = (amount: number, currency: string) => `${amount.toFixed(2)} ${currency}`;
const count = (n: number, noun: string) => `${n} ${noun}${n === 1 ? "" : "s"}`;

// Money breakdown shown inside the archive confirm dialog: what archiving
// refunds, what it merely releases (holds were never charged) and what is kept.
// Promoted messages: every approved one is refunded. Room promotions: approved
// ones are refunded only when approved within the backend's refund window.
const ArchiveRoomPromotionsWarning: React.FC<ArchiveRoomPromotionsWarningProps> = ({summary, loadError}) => {
    if (loadError) {
        return (
            <div
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">
                Could not load this room&apos;s promotions. Any active ones will still be canceled under the usual
                rules: pending holds are released, approved promoted messages are refunded, and approved room
                promotions are refunded only if they were approved within the last 24 hours.
            </div>
        );
    }
    if (!summary) {
        return null;
    }

    const currency = summary.currency || "USD";
    const messagePending = summary.pendingCount;
    const messageApproved = summary.approvedCount;
    const roomPending = summary.roomPromotionPendingCount ?? 0;
    const roomRefundable = summary.roomPromotionApprovedRefundableCount ?? 0;
    const roomKept = summary.roomPromotionApprovedNonRefundableCount ?? 0;
    const windowHours = summary.roomPromotionRefundWindowHours ?? 24;

    if (messagePending + messageApproved + roomPending + roomRefundable + roomKept === 0) {
        return null;
    }

    const refundedTotal = summary.approvedRefundTotal + (summary.roomPromotionApprovedRefundTotal ?? 0);
    const releasedTotal = summary.pendingReleaseTotal + (summary.roomPromotionPendingReleaseTotal ?? 0);
    const keptTotal = summary.roomPromotionApprovedNonRefundableTotal ?? 0;

    const messageParts: string[] = [];
    if (messagePending > 0) {
        messageParts.push(`${count(messagePending, "pending")} (holds released, ${money(summary.pendingReleaseTotal, currency)})`);
    }
    if (messageApproved > 0) {
        messageParts.push(`${count(messageApproved, "approved")} (refunded, ${money(summary.approvedRefundTotal, currency)})`);
    }

    const roomParts: string[] = [];
    if (roomPending > 0) {
        roomParts.push(`${count(roomPending, "pending")} (holds released, ${money(summary.roomPromotionPendingReleaseTotal ?? 0, currency)})`);
    }
    if (roomRefundable > 0) {
        roomParts.push(`${roomRefundable} approved in the last ${windowHours}h (refunded, ${money(summary.roomPromotionApprovedRefundTotal ?? 0, currency)})`);
    }
    if (roomKept > 0) {
        roomParts.push(`${roomKept} approved earlier (canceled, ${money(keptTotal, currency)} kept)`);
    }

    return (
        <div
            className="glass-surface space-y-2 rounded-lg border border-amber-300/70 p-3 text-sm dark:border-amber-500/40">
            <div className="flex items-start gap-2 font-semibold text-amber-800 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0"/>
                <span>
                    Archiving will refund {money(refundedTotal, currency)} to users
                    {releasedTotal > 0 && ` and release ${money(releasedTotal, currency)} in card holds (never charged)`}
                    {keptTotal > 0 && `; ${money(keptTotal, currency)} from older room promotions is kept`}.
                </span>
            </div>
            {messageParts.length > 0 && (
                <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Promoted messages:</span> {messageParts.join(", ")}.
                </p>
            )}
            {roomParts.length > 0 && (
                <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">Room promotions:</span> {roomParts.join(", ")}.
                </p>
            )}
        </div>
    );
};

export default ArchiveRoomPromotionsWarning;
