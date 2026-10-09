export type VipInterval = 'MONTHLY' | 'YEARLY';

export interface VipSubscription {
    billingAvailable: boolean;
    yearlyBillingEnabled: boolean;
    canPurchase: boolean;
    canContinueCheckout: boolean;
    canManageBilling: boolean;
    canChangePlan: boolean;
    canResume: boolean;
    status: string;
    interval: VipInterval | null;
    vipActive: boolean;
    showVipBadge: boolean;
    vipBadgeVisible: boolean;
    vipBadgeRevision: number;
    currentPeriodEnd: string | null;
    paidThrough: string | null;
    cancelAtPeriodEnd: boolean;
    scheduledInterval: VipInterval | null;
    scheduledChangeAt: string | null;
    checkoutPending: boolean;
    checkoutInterval: VipInterval | null;
    pendingInterval: VipInterval | null;
    pendingUpdateExpiresAt: string | null;
    pendingInvoiceId: string | null;
    renewalPaymentMethodId: string | null;
}

export type VipAppearance = Pick<VipSubscription, 'vipActive' | 'showVipBadge' | 'vipBadgeVisible' | 'vipBadgeRevision'>;

export interface VipInvoice {
    id: string; number: string | null; status: string; currency: string;
    total: number; amountPaid: number; amountRemaining: number; created: string;
    periodStart: string | null; periodEnd: string | null; canPay: boolean;
}
export interface VipInvoices {invoices: VipInvoice[]; nextCursor: string | null;}
export interface VipPaymentResult {
    subscription: VipSubscription; clientSecret: string | null; invoiceId: string | null; paymentStatus: string | null;
}
export interface VipPlanPreview {
    previewToken: string; interval: VipInterval; amountDue: number; currency: string;
    effectiveAt: string; nextRenewalAt: string; immediate: boolean; expiresAt: string;
}
