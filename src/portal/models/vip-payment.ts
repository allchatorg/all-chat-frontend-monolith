export interface VipPayment {
    invoiceId: string;
    paidCents: number;
    refundedCents: number;
    currency: string;
    paidAt: string; // ISO string for Instant
    billingReason: string;
}

export interface VipRefundRequest {
    userId: number;
    invoiceId: string;
    reason: string;
}
