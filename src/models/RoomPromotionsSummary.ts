export interface RoomPromotionsSummary {
    pendingCount: number;
    approvedCount: number;
    pendingReleaseTotal: number;
    approvedRefundTotal: number;
    currency: string;
    // Room promotions (paid room listings) — optional until the backend that
    // fills them is deployed; readers must default to 0.
    roomPromotionPendingCount?: number;
    roomPromotionApprovedCount?: number;
    roomPromotionPendingReleaseTotal?: number;
    roomPromotionApprovedRefundTotal?: number; // refundable (approved within the window) only
    roomPromotionApprovedRefundableCount?: number;
    roomPromotionApprovedNonRefundableCount?: number;
    roomPromotionApprovedNonRefundableTotal?: number; // captured money that is kept
    roomPromotionRefundWindowHours?: number; // 24 on the backend
}
