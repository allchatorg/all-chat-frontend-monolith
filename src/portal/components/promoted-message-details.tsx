import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@ads/components/ui/card";
import {Badge} from "@ads/components/ui/badge";
import {clsx} from "clsx";
import {AlertCircle, Calendar, CreditCard, DollarSign, Info, MessageSquare} from "lucide-react";
import * as React from "react";
import {PromotedMessageDetail, PromotedMessageStatus, PromotionCanceledBy} from "@ads/models/promoted-message";
import {getPromotionStatusBadgeClass} from "@ads/components/promoted-messages-table";
import MessageItem from "@/features/chatroom/components/MessageItem";
import {Message} from "@/models/message";
import {Role} from "@/models/Role";

interface PromotedMessageDetailsProps {
    data: PromotedMessageDetail;
    className?: string;
    isAdmin?: boolean;
}

function getCanceledByLabel(canceledBy?: PromotionCanceledBy | null): string {
    switch (canceledBy) {
        case PromotionCanceledBy.USER:
            return "Canceled by the owner";
        case PromotionCanceledBy.ADMIN:
            return "Canceled by an admin";
        case PromotionCanceledBy.SYSTEM_BAN:
            return "Canceled automatically (account ban)";
        default:
            return "Canceled";
    }
}

// Detail card for a promoted message (user + admin views) — modeled on
// ad-status-details.tsx with an inline message preview instead of ad media.
export default function PromotedMessageDetails({data, className, isAdmin = false}: PromotedMessageDetailsProps) {
    const getStatusConfig = () => {
        switch (data.status) {
            case PromotedMessageStatus.APPROVED:
                return {bg: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900"};
            case PromotedMessageStatus.PENDING:
                return {bg: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900"};
            case PromotedMessageStatus.DENIED:
                return {bg: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900"};
            case PromotedMessageStatus.CANCELED:
                return {bg: "bg-muted/50"};
            default:
                return {bg: "bg-muted/50"};
        }
    };

    const statusConfig = getStatusConfig();

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: data.currency || "USD",
        }).format(amount);
    };

    const isDenied = data.status === PromotedMessageStatus.DENIED;
    const isCanceled = data.status === PromotedMessageStatus.CANCELED;

    // Message-shaped view of the promotion detail so the preview reuses the
    // same MessageItem as the purchase flow's confirm step (renders attachments).
    // senderRole/color are unused in search view, so defaults are fine.
    const previewMessage: Message = {
        id: data.messageId,
        content: data.messageContent,
        createdAt: new Date(data.messageCreatedAt),
        senderId: data.userId ?? 0,
        senderUsername: data.messageSenderUsername,
        senderRole: Role.USER,
        chatRoomId: data.chatRoomId,
        chatRoomName: data.chatRoomName,
        bannedUser: false,
        color: "",
        deleted: data.messageDeleted,
        attachments: data.messageAttachments ?? [],
        reactions: [],
    };

    return (
        <Card className={clsx("border shadow-sm", statusConfig.bg, className)}>
            <CardHeader className="border-b">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <CardTitle className="text-xl">Promoted Message</CardTitle>
                        <CardDescription className="mt-1">Promotion ID: #{data.id}</CardDescription>
                    </div>
                    <Badge className={clsx("w-fit", getPromotionStatusBadgeClass(data.status))}>
                        {data.status}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                {/* Message Preview Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                        <MessageSquare className="h-5 w-5 text-primary"/>
                        <h3 className="text-lg font-semibold">Message Preview</h3>
                    </div>

                    <MessageItem
                        message={previewMessage}
                        viewMode="search"
                        handleMessageClick={() => {}}
                        showChatRoomName={true}
                        showSenderName={true}
                        showEditButton={false}
                        interactionsDisabled={true}
                    />
                </div>

                {/* Promotion Details Section */}
                <div>
                    <div className="flex items-center gap-2 pb-2 mb-4 border-b">
                        <Info className="h-5 w-5 text-primary"/>
                        <h3 className="text-lg font-semibold">Promotion Details</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Amount */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-background">
                                <DollarSign className="h-5 w-5 text-muted-foreground"/>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                                <p className="text-base font-semibold">{formatCurrency(data.amount)}</p>
                            </div>
                        </div>

                        {/* Payment Method */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-background">
                                <CreditCard className="h-5 w-5 text-muted-foreground"/>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Payment</p>
                                <p className="text-base font-semibold capitalize">
                                    {data.cardBrand && data.cardLast4
                                        ? `${data.cardBrand} •••• ${data.cardLast4}`
                                        : "-"}
                                    {data.receiptStatus && (
                                        <span className="ml-2 text-xs font-normal uppercase text-muted-foreground">
                                            {data.receiptStatus}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Submitted Date */}
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-background">
                                <Calendar className="h-5 w-5 text-muted-foreground"/>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Submitted Date</p>
                                <p className="text-base font-semibold">{formatDate(data.submittedAt)}</p>
                            </div>
                        </div>

                        {/* Approved Date */}
                        {data.approvedAt && (
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-background">
                                    <Calendar className="h-5 w-5 text-muted-foreground"/>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Approved Date</p>
                                    <p className="text-base font-semibold">{formatDate(data.approvedAt)}</p>
                                </div>
                            </div>
                        )}

                        {/* Resolved Date */}
                        {data.resolvedAt && (
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-background">
                                    <Calendar className="h-5 w-5 text-muted-foreground"/>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Resolved Date</p>
                                    <p className="text-base font-semibold">{formatDate(data.resolvedAt)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Deny / Cancel Reason Section */}
                {(isDenied || isCanceled) && data.reason && (
                    <div
                        className="rounded-lg bg-red-100 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0"/>
                            <div>
                                <h3 className="text-sm font-semibold text-red-900 dark:text-red-100">
                                    {isDenied ? "Denial Reason" : getCanceledByLabel(data.canceledBy)}
                                </h3>
                                <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                                    {data.reason}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Cancellation Request Section (PENDING only) */}
                {data.status === PromotedMessageStatus.PENDING && data.cancelRequested && (
                    <div
                        className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"/>
                            <div>
                                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                    {isAdmin
                                        ? "The user requested cancellation of this promotion"
                                        : "Cancellation requested"}
                                </h3>
                                {data.cancelRequestReason && (
                                    <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                        {data.cancelRequestReason}
                                    </p>
                                )}
                                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                    {isAdmin
                                        ? `Requested on ${formatDate(data.cancelRequestedAt)}. Cancel the promotion to release the hold, or approve/deny it as usual.`
                                        : `Submitted on ${formatDate(data.cancelRequestedAt)}. An admin will review your request — if it is accepted, the hold on your card is released in full.`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pending Review Section (user view) */}
                {data.status === PromotedMessageStatus.PENDING && !isAdmin && (
                    <div
                        className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0"/>
                            <div>
                                <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                                    Promotion Under Review
                                </h3>
                                <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                                    {formatCurrency(data.amount)} is held on your card until an admin reviews this
                                    promotion. The hold is released in full if the promotion is denied or if you
                                    cancel it while it is still pending.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
