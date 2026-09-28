import {ProReportingSynchronization} from '@ads/models/pro-statistics';

export const formatUsd = (value: number | null | undefined) =>
    typeof value === 'number' && Number.isFinite(value)
        ? new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(value)
        : 'Unavailable';

export const formatSynchronizationTime = (value: string) =>
    new Date(value).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    });

// Date-only reporting buckets must not shift when viewed west of UTC.
export const formatReportingDay = (value: string) =>
    new Date(`${value}T12:00:00`).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});

export function reportingStatusMessage(synchronization?: ProReportingSynchronization): string | null {
    switch (synchronization?.status) {
        case 'CURRENT': return null;
        case 'CATCHING_UP': return 'Subscription payments are syncing. Revenue and payment counts may be incomplete.';
        case 'INCOMPLETE': return 'Subscription reporting is incomplete: a gap exceeds the available payment history. Revenue and payment counts are partial.';
        default: return 'Subscription revenue is unavailable while payment reporting cannot synchronize.';
    }
}

export function computeRevenueTrend(today: number, yesterday: number): {trend: 'up' | 'down'; trendValue: string} {
    if (yesterday > 0) {
        const percentage = ((today - yesterday) / yesterday) * 100;
        return {trend: percentage >= 0 ? 'up' : 'down', trendValue: `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`};
    }
    // A percentage comparison against zero is undefined.
    return {trend: today >= yesterday ? 'up' : 'down', trendValue: today === yesterday ? '0%' : ''};
}
