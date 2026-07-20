import {Attachment} from "@/models/Attachment";

export enum PromotedMessageStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    DENIED = "DENIED",
    CANCELED = "CANCELED"
}

export enum PromotionCanceledBy {
    USER = "USER",
    ADMIN = "ADMIN",
    SYSTEM_BAN = "SYSTEM_BAN"
}

// List row returned by GET /promoted-messages and GET /admin/promoted-messages.
export interface PromotedMessage {
    id: number;
    messageId: number;
    messageContent: string;
    chatRoomId: number;
    chatRoomName: string;
    status: PromotedMessageStatus;
    amount: number;
    currency: string;
    submittedAt: string; // ISO string for LocalDateTime
    // Present on admin rows only
    email?: string;
    userId?: number;
    // Owner asked for this PENDING promotion to be canceled (admin reviews it)
    cancelRequested: boolean;
}

// Detail view returned by GET /promoted-messages/{id} and the admin variant:
// list fields + inline message preview + payment card info + resolution data.
export interface PromotedMessageDetail extends PromotedMessage {
    approvedAt?: string | null;
    resolvedAt?: string | null;
    // Deny/cancel reason entered by an admin, when present
    reason?: string | null;
    canceledBy?: PromotionCanceledBy | null;
    // Inline message preview
    messageSenderUsername: string;
    messageCreatedAt: string;
    messageDeleted: boolean;
    messageAttachments: Attachment[];
    // Payment info
    cardBrand?: string | null;
    cardLast4?: string | null;
    receiptStatus?: string | null; // AUTHORIZED / CAPTURED / RELEASED / REFUNDED
    // Owner-submitted cancellation request (PENDING promotions only)
    cancelRequestReason?: string | null;
    cancelRequestedAt?: string | null;
}

export interface PromoteMessageRequest {
    messageId: number;
    paymentMethodId: string;
}

export interface PromotionReasonRequest {
    promotionId: number;
    reason: string;
}

export interface MyPromotedMessagesRequest {
    status?: PromotedMessageStatus;
    page?: number;
    size?: number;
}

export interface PromotedMessageSearchRequest {
    status?: PromotedMessageStatus;
    email?: string;
    userId?: number;
    page?: number;
    size?: number;
    sort?: string;
}

// Per-user summary shown in the staff ban form: counts by status plus the
// totals a permanent ban releases (pending holds) and refunds (approved).
export interface BanPromotionsSummary {
    totalPromotions: number;
    pendingCount: number;
    approvedCount: number;
    deniedCount: number;
    canceledCount: number;
    pendingReleaseTotal: number;
    approvedRefundTotal: number;
    currency: string;
}

// Platform promoted-revenue summary (GET /admin/promoted-messages/revenue/summary).
// Revenue figures are captured payments only; pendingHoldTotal is authorized holds.
export interface PromotedRevenueSummary {
    todayRevenue: number;
    yesterdayRevenue: number;
    totalRevenue: number;
    pendingCount: number;
    pendingHoldTotal: number;
    approvedCount: number;
    currency: string;
}

export interface PromotedRevenueDailyPoint {
    date: string; // ISO date string YYYY-MM-DD
    revenue: number;
}

// GET /admin/promoted-messages/revenue/daily — totalRevenue is for the range
export interface PromotedRevenueDailyResponse {
    dailyRevenue: PromotedRevenueDailyPoint[];
    totalRevenue: number;
}

// Current user's spend (GET /promoted-messages/summary)
export interface PromotionSpendSummary {
    pendingCount: number;
    pendingHoldTotal: number;
    approvedCount: number;
    totalSpent: number;
    currency: string;
}
