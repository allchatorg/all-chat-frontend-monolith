"use client"

import {StatCard} from "@ads/components/stat-card";
import {NotifyCard} from "@ads/components/NotifyCard";
import Link from "next/link";
import {useGetAdStatusCountsQuery, useGetDailyRevenueQuery} from "@ads/store/services/adminAdsApi";
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

export function AdminSectionCards() {
    const {data: statusCounts, isLoading: isStatusLoading, isError: isStatusError} = useGetAdStatusCountsQuery();
    const {data: revenueData, isLoading: isRevenueLoading} = useGetDailyRevenueQuery();

    // Get count for a specific status
    const getCountForStatus = (status: AdStatus): number => {
        if (!statusCounts) return 0;
        const found = statusCounts.find((item) => item.status === status);
        return found?.count ?? 0;
    };

    // Calculate revenue stats
    const todayRevenue = revenueData?.todayRevenue || 0;
    const yesterdayRevenue = revenueData?.yesterdayRevenue || 0;

    let trend: "up" | "down" = "up";
    let trendValue = "0%";

    if (yesterdayRevenue > 0) {
        const diff = todayRevenue - yesterdayRevenue;
        const percentage = (diff / yesterdayRevenue) * 100;
        trend = percentage >= 0 ? "up" : "down";
        trendValue = `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
    } else if (todayRevenue > 0) {
        trend = "up";
        trendValue = "+100%";
    }

    const revenueStat = {
        id: 1,
        title: "Today's Revenue",
        value: new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(todayRevenue),
        trend: trend,
        trendValue: trendValue,
        footerText: "Compared to yesterday",
        description: "Total revenue from ad purchases",
    };

    return (
        <div
            className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:shadow-sm lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">

            {isRevenueLoading ? (
                <Skeleton className="h-32 w-full rounded-xl"/>
            ) : (
                <StatCard
                    key={revenueStat.id}
                    title={revenueStat.title}
                    value={revenueStat.value}
                    trend={revenueStat.trend}
                    trendValue={revenueStat.trendValue}
                    footerText={revenueStat.footerText}
                    description={revenueStat.description}
                />
            )}

            {isStatusLoading ? (
                // Loading skeleton for status cards
                <>
                    <Skeleton className="h-32 w-full rounded-xl"/>
                    <Skeleton className="h-32 w-full rounded-xl"/>
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
                            />
                        </Link>
                    );
                })
            )}
        </div>
    );
}
