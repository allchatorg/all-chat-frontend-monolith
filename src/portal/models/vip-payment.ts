export interface VipPayment {
    invoiceId: string;
    paidCents: number;
    refundedCents: number;
    currency: string;
    paidAt: string; // ISO string for Instant
    billingReason: string;
    // Paid for the VIP period running now: refunding it ends VIP and cancels renewal.
    current: boolean;
}

export interface VipRefundRequest {
    userId: number;
    invoiceId: string;
    reason: string;
}
