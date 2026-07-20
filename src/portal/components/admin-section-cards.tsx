"use client"

import {StatCard} from "@ads/components/stat-card";
import {NotifyCard} from "@ads/components/NotifyCard";
import Link from "next/link";
import {useGetAdStatusCountsQuery, useGetDailyRevenueQuery} from "@ads/store/services/adminAdsApi";
import {useGetPromotedRevenueSummaryQuery} from "@ads/store/services/adminPromotedMessagesApi";
import {AdStatus} from "@ads/models/ad";
import {Skeleton} from "@ads/components/ui/skeleton";


// Map status to display properties
const statusConfig: Record<AdStatus, {
    label: string;
    buttonLabel: string;
    description: string;
    variant: "default" | "success" | "warning" | "destructive";
    href: string
}> = {
    [AdStatus.SUBMITTED]: {
        label: "Submitted Ads",
        buttonLabel: "Review",
        description: "Ads waiting for approval",
        variant: "warning",
        href: "/portal/admin/ads?status=SUBMITTED",
    },
    [AdStatus.ACTIVE]: {
        label: "Active Ads",
        buttonLabel: "View",
        description: "Currently active ads",
        variant: "success",
        href: "/portal/admin/ads?status=ACTIVE",
    },
    [AdStatus.COMPLETED]: {
        label: "Completed Ads",
        buttonLabel: "View",
        description: "Completed ad campaigns",
        variant: "default",
        href: "/portal/admin/ads?status=COMPLETED",
    },
    [AdStatus.REJECTED]: {
        label: "Rejected Ads",
        buttonLabel: "View",
        description: "Rejected ad submissions",
        variant: "destructive",
        href: "/portal/admin/ads?status=REJECTED",
    },
};

// Define the order in which to display the status cards
const statusDisplayOrder: AdStatus[] = [AdStatus.SUBMITTED, AdStatus.ACTIVE, AdStatus.COMPLETED, AdStatus.REJECTED];

const formatUsd = (value: number) =>
    new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(value);

function computeTrend(today: number, yesterday: number): { trend: "up" | "down"; trendValue: string } {
    if (yesterday > 0) {
        const percentage = ((today - yesterday) / yesterday) * 100;
        return {
            trend: percentage >= 0 ? "up" : "down",
            trendValue: `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`,
        };
    }
    if (today > 0) {
        return {trend: "up", trendValue: "+100%"};
    }
    return {trend: "up", trendValue: "0%"};
}

export function AdminSectionCards() {
    const {data: statusCounts, isLoading: isStatusLoading, isError: isStatusError} = useGetAdStatusCountsQuery();
    const {data: revenueData, isLoading: isRevenueLoading} = useGetDailyRevenueQuery();
    const {data: promotedData, isLoading: isPromotedLoading} = useGetPromotedRevenueSummaryQuery();

    // Get count for a specific status
    const getCountForStatus = (status: AdStatus): number => {
        if (!statusCounts) return 0;
        const found = statusCounts.find((item) => item.status === status);
        return found?.count ?? 0;
    };

    const revenueTrend = computeTrend(revenueData?.todayRevenue ?? 0, revenueData?.yesterdayRevenue ?? 0);
    const promotedTrend = computeTrend(promotedData?.todayRevenue ?? 0, promotedData?.yesterdayRevenue ?? 0);

    return (
        <div
            className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:shadow-sm lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">

            {isRevenueLoading ? (
                <Skeleton className="h-28 w-full rounded-xl"/>
            ) : (
                <StatCard
                    title="Today's Revenue"
                    value={formatUsd(revenueData?.todayRevenue ?? 0)}
                    trend={revenueTrend.trend}
                    trendValue={revenueTrend.trendValue}
                    footerText="Compared to yesterday"
                    description="Total revenue from ad purchases"
                    compact
                />
            )}

            {isPromotedLoading ? (
                <>
                    <Skeleton className="h-28 w-full rounded-xl"/>
                    <Skeleton className="h-28 w-full rounded-xl"/>
                    <Skeleton className="h-28 w-full rounded-xl"/>
                </>
            ) : (
                <>
                    <StatCard
                        title="Promoted Revenue Today"
                        value={formatUsd(promotedData?.todayRevenue ?? 0)}
                        trend={promotedTrend.trend}
                        trendValue={promotedTrend.trendValue}
                        footerText="Compared to yesterday"
                        description="Captured from promoted messages"
                        compact
                    />
                    <StatCard
                        title="Pending Promotions"
                        value={formatUsd(promotedData?.pendingHoldTotal ?? 0)}
                        trend="up"
                        trendValue=""
                        footerText=""
                        description={`${promotedData?.pendingCount ?? 0} authorized holds awaiting review`}
                        compact
                    />
                    <StatCard
                        title="Total Promoted Revenue"
                        value={formatUsd(promotedData?.totalRevenue ?? 0)}
                        trend="up"
                        trendValue=""
                        footerText=""
                        description={`All-time · ${promotedData?.approvedCount ?? 0} approved promotions`}
                        compact
                    />
                </>
            )}

            {isStatusLoading ? (
                // Loading skeleton for status cards
                <>
                    <Skeleton className="h-28 w-full rounded-xl"/>
                    <Skeleton className="h-28 w-full rounded-xl"/>
                </>
            ) : isStatusError ? (
                // Error state
                <div className="col-span-2 flex items-center justify-center p-4 text-muted-foreground">
                    Failed to load ad status counts
                </div>
            ) : (
                // Display status cards in defined order
                statusDisplayOrder.map((status) => {
                    const config = statusConfig[status];
                    const count = getCountForStatus(status);
                    return (
                        <Link key={status} href={config.href} className="contents">
                            <NotifyCard
                                title={config.label}
                                value={count}
                                label={config.buttonLabel}
                                description={config.description}
                                variant={config.variant}
                                compact
                            />
                        </Link>
                    );
                })
            )}
        </div>
    );
}
