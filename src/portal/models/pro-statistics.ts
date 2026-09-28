export type ProStatisticsDays = 7 | 30 | 90;

export interface ProReportingSynchronization {
    status: 'CURRENT' | 'CATCHING_UP' | 'INCOMPLETE' | 'UNAVAILABLE';
    lastSynchronizedAt: string | null;
}

export interface ProStatisticsDailyPoint {
    date: string;
    revenue: number;
    initialPayments: number;
    renewalPayments: number;
    otherPayments: number;
}

export interface ProStatistics {
    synchronization: ProReportingSynchronization;
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
    daily: ProStatisticsDailyPoint[];
}
