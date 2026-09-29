export type ProInterval = 'MONTHLY' | 'YEARLY';

export interface ProSubscription {
    billingAvailable: boolean;
    yearlyBillingEnabled: boolean;
    canPurchase: boolean;
    canContinueCheckout: boolean;
    canManageBilling: boolean;
    canChangePlan: boolean;
    canResume: boolean;
    status: string;
    interval: ProInterval | null;
    proActive: boolean;
    showProBadge: boolean;
    proBadgeVisible: boolean;
    proBadgeRevision: number;
    currentPeriodEnd: string | null;
    paidThrough: string | null;
    cancelAtPeriodEnd: boolean;
    scheduledInterval: ProInterval | null;
    scheduledChangeAt: string | null;
    checkoutPending: boolean;
    checkoutInterval: ProInterval | null;
    pendingInterval: ProInterval | null;
    pendingUpdateExpiresAt: string | null;
    pendingInvoiceId: string | null;
    renewalPaymentMethodId: string | null;
}

export type ProAppearance = Pick<ProSubscription, 'proActive' | 'showProBadge' | 'proBadgeVisible' | 'proBadgeRevision'>;

export interface ProInvoice {
    id: string; number: string | null; status: string; currency: string;
    total: number; amountPaid: number; amountRemaining: number; created: string;
    periodStart: string | null; periodEnd: string | null; canPay: boolean;
}
export interface ProInvoices {invoices: ProInvoice[]; nextCursor: string | null;}
export interface ProPaymentResult {
    subscription: ProSubscription; clientSecret: string | null; invoiceId: string | null; paymentStatus: string | null;
}
export interface ProPlanPreview {
    previewToken: string; interval: ProInterval; amountDue: number; currency: string;
    effectiveAt: string; nextRenewalAt: string; immediate: boolean; expiresAt: string;
}
