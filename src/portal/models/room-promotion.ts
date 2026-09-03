import {PromotionCanceledBy, PromotionReasonRequest} from "@ads/models/promoted-message";

export enum RoomPromotionStatus {
    PENDING = "PENDING",
    APPROVED = "APPROVED",
    DENIED = "DENIED",
    CANCELED = "CANCELED"
}

export type {PromotionReasonRequest};
export {PromotionCanceledBy};

// List row returned by GET /room-promotions and GET /admin/room-promotions.
export interface RoomPromotion {
    id: number;
    chatRoomId: number;
    chatRoomName: string;
    status: RoomPromotionStatus;
    amount: number;
    currency: string;
    submittedAt: string; // ISO string
    approvedAt?: string | null;
    // Present on admin rows only
    email?: string;
    userId?: number;
    // Owner asked for this PENDING promotion to be canceled (admin reviews it)
    cancelRequested: boolean;
}

// Detail view returned by GET /room-promotions/{id} and the admin variant:
// list fields + room state + payment card info + resolution data.
export interface RoomPromotionDetail extends RoomPromotion {
    chatRoomArchived: boolean;
    resolvedAt?: string | null;
    // Deny/cancel reason entered by an admin, when present
    reason?: string | null;
    canceledBy?: PromotionCanceledBy | null;
    // Payment info
    cardBrand?: string | null;
    cardLast4?: string | null;
    receiptStatus?: string | null; // AUTHORIZED / CAPTURED / CANCELLED / REFUNDED
    // Owner-submitted cancellation request (PENDING promotions only)
    cancelRequestReason?: string | null;
    cancelRequestedAt?: string | null;
}

export interface PromoteRoomRequest {
    chatRoomId: number;
    paymentMethodId: string;
}

export interface MyRoomPromotionsRequest {
    status?: RoomPromotionStatus;
    page?: number;
    size?: number;
}

export interface RoomPromotionSearchRequest {
    status?: RoomPromotionStatus;
    email?: string;
    userId?: number;
    chatRoomId?: number;
    page?: number;
    size?: number;
    sort?: string;
}

// Per-user summary for the staff ban form: counts by status plus the
// totals a permanent ban releases (pending holds) and refunds (approved).
export interface BanRoomPromotionsSummary {
    totalPromotions: number;
    pendingCount: number;
    approvedCount: number;
    deniedCount: number;
    canceledCount: number;
    pendingReleaseTotal: number;
    approvedRefundTotal: number;
    currency: string;
}
