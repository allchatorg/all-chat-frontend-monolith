export type VipStatisticsDays = 7 | 30 | 90;

export interface VipReportingSynchronization {
    status: 'CURRENT' | 'CATCHING_UP' | 'INCOMPLETE' | 'UNAVAILABLE';
    lastSynchronizedAt: string | null;
}

export interface VipStatisticsDailyPoint {
    date: string;
    revenue: number;
    initialPayments: number;
    renewalPayments: number;
    otherPayments: number;
}

export interface VipStatistics {
    synchronization: VipReportingSynchronization;
    memberships: {
        active: number;
        monthly: number;
        yearly: number;
        scheduledCancellations: number;
        paymentIssues: number;
    };
    // USD major units, net of refunds and before Stripe fees.
    revenue: {
        today: number;
        yesterday: number;
        total: number;
    };
    daily: VipStatisticsDailyPoint[];
}
