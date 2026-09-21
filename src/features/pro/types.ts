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
}

export type ProAppearance = Pick<ProSubscription, 'proActive' | 'showProBadge' | 'proBadgeVisible' | 'proBadgeRevision'>;
