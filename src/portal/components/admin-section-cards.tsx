"use client"

import {StatCard} from "@ads/components/stat-card";
import {NotifyCard} from "@ads/components/NotifyCard";
import Link from "next/link";
import {useGetAdStatusCountsQuery, useGetDailyRevenueQuery} from "@ads/store/services/adminAdsApi";
import {useGetPromotedRevenueSummaryQuery} from "@ads/store/services/adminPromotedMessagesApi";
import {useGetRoomPromotedRevenueSummaryQuery} from "@ads/store/services/adminRoomPromotionsApi";
import {AdStatus} from "@ads/models/ad";
import {Skeleton} from "@ads/components/ui/skeleton";
import {dashboardRevenueQueryOptions, useGetVipStatisticsQuery} from "@ads/store/services/adminVipApi";
import {computeRevenueTrend, formatUsd} from "@ads/lib/revenue-format";


// Map status to display properties
const statusConfig: Record<AdStatus, {
    label: string;
    buttonLabel: string;
    description: string;
    variant: "default" | "success" | "warning" | "destructive";
    href: string
}> = {
    [AdStatus.PENDING]: {
        label: "Pending Ads",
        buttonLabel: "Review",
        description: "Ads waiting for approval",
        variant: "warning",
        href: "/portal/admin/ads?status=PENDING",
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
const statusDisplayOrder: AdStatus[] = [AdStatus.PENDING, AdStatus.ACTIVE, AdStatus.COMPLETED, AdStatus.REJECTED];

export function AdminSectionCards() {
    const {data: statusCounts, isLoading: isStatusLoading, isError: isStatusError} = useGetAdStatusCountsQuery();
    const {data: revenueData, isLoading: isRevenueLoading, isFetching: isRevenueFetching, isError: isRevenueError} = useGetDailyRevenueQuery(undefined, dashboardRevenueQueryOptions);
    const {data: promotedData, isLoading: isPromotedLoading, isFetching: isPromotedFetching, isError: isPromotedError} = useGetPromotedRevenueSummaryQuery(undefined, dashboardRevenueQueryOptions);
    const {data: roomPromotedData, isLoading: isRoomPromotedLoading, isFetching: isRoomPromotedFetching, isError: isRoomPromotedError} = useGetRoomPromotedRevenueSummaryQuery(undefined, dashboardRevenueQueryOptions);
    const {data: vipData, isFetching: isVipFetching, isError: isVipError} = useGetVipStatisticsQuery(90, dashboardRevenueQueryOptions);

    // Get count for a specific status
    const getCountForStatus = (status: AdStatus): number => {
        if (!statusCounts) return 0;
        const found = statusCounts.find((item) => item.status === status);
        return found?.count ?? 0;
    };

    const revenueUnavailable = isRevenueError || !revenueData;
    const promotedUnavailable = isPromotedError || !promotedData;
    const roomPromotedUnavailable = isRoomPromotedError || !roomPromotedData;
    const totalLoading = isRevenueFetching || isPromotedFetching || isRoomPromotedFetching || isVipFetching;
    const totalUnavailable = revenueUnavailable || promotedUnavailable || roomPromotedUnavailable || isVipError || !vipData
        || vipData.synchronization.status === 'UNAVAILABLE';
    const totalPartial = vipData?.synchronization.status !== 'CURRENT';
    const totalToday = !totalUnavailable
        ? revenueData.todayRevenue + promotedData.todayRevenue + roomPromotedData.todayRevenue + vipData.revenue.today
        : null;
    const totalYesterday = !totalUnavailable && !totalPartial
        ? revenueData.yesterdayRevenue + promotedData.yesterdayRevenue + roomPromotedData.yesterdayRevenue + vipData.revenue.yesterday
        : null;
    const noTrend = {trend: 'up' as const, trendValue: ''};
    const revenueTrend = revenueUnavailable ? noTrend : computeRevenueTrend(revenueData.todayRevenue, revenueData.yesterdayRevenue);
    const promotedTrend = promotedUnavailable ? noTrend : computeRevenueTrend(promotedData.todayRevenue, promotedData.yesterdayRevenue);
    const roomPromotedTrend = roomPromotedUnavailable ? noTrend : computeRevenueTrend(roomPromotedData.todayRevenue, roomPromotedData.yesterdayRevenue);
    const totalTrend = totalToday !== null && totalYesterday !== null ? computeRevenueTrend(totalToday, totalYesterday) : noTrend;

    return (
        <div
            className="grid grid-cols-2 gap-3 px-4 *:data-[slot=card]:shadow-sm lg:px-6 @xl/main:gap-4 @5xl/main:grid-cols-4">

            {totalLoading ? <Skeleton className="h-24 w-full rounded-xl"/> : (
                <StatCard
                    title={`Total revenue today${!totalUnavailable && totalPartial ? ' (partial)' : ''}`}
                    value={totalToday === null ? 'Unavailable' : formatUsd(totalToday)}
                    {...totalTrend}
                    footerText={totalYesterday !== null ? 'Compared to yesterday' : ''}
                    description={totalUnavailable ? 'One or more revenue sources could not be loaded' : 'Ads, message and room promotions, and allchat VIP'}
                    compact
                />
            )}

            {isRevenueLoading ? (
                <Skeleton className="h-24 w-full rounded-xl"/>
            ) : (
                <StatCard
                    title="Ad Revenue Today"
                    value={revenueUnavailable ? 'Unavailable' : formatUsd(revenueData.todayRevenue)}
                    trend={revenueTrend.trend}
                    trendValue={revenueTrend.trendValue}
                    footerText="Compared to yesterday"
                    description={revenueUnavailable ? 'Could not load ad revenue' : 'Revenue from ad purchases only'}
                    compact
                />
            )}

            {isPromotedLoading ? (
                <>
                    <Skeleton className="h-24 w-full rounded-xl"/>
                    <Skeleton className="h-24 w-full rounded-xl"/>
                    <Skeleton className="h-24 w-full rounded-xl"/>
                </>
            ) : (
                <>
                    <StatCard
                        title="Message Promotions Revenue Today"
                        value={promotedUnavailable ? 'Unavailable' : formatUsd(promotedData.todayRevenue)}
                        trend={promotedTrend.trend}
                        trendValue={promotedTrend.trendValue}
                        footerText="Compared to yesterday"
                        description={promotedUnavailable ? 'Could not load message promotion revenue' : 'Captured from message promotions'}
                        compact
                    />
                    <StatCard
                        title="Pending Message Promotions"
                        value={promotedUnavailable ? 'Unavailable' : formatUsd(promotedData.pendingHoldTotal)}
                        trend="up"
                        trendValue=""
                        footerText=""
                        description={promotedUnavailable ? 'Could not load pending promotions' : `${promotedData.pendingCount} authorized holds awaiting review`}
                        compact
                    />
                    <StatCard
                        title="Total Message Promotions Revenue"
                        value={promotedUnavailable ? 'Unavailable' : formatUsd(promotedData.totalRevenue)}
                        trend="up"
                        trendValue=""
                        footerText=""
                        description={promotedUnavailable ? 'Could not load message promotion revenue' : `All-time · ${promotedData.approvedCount} approved promotions`}
                        compact
                    />
                </>
            )}

            {isRoomPromotedLoading ? (
                <>
                    <Skeleton className="h-24 w-full rounded-xl"/>
                    <Skeleton className="h-24 w-full rounded-xl"/>
                    <Skeleton className="h-24 w-full rounded-xl"/>
                </>
            ) : (
                <>
                    <StatCard
                        title="Room Promotions Revenue Today"
                        value={roomPromotedUnavailable ? 'Unavailable' : formatUsd(roomPromotedData.todayRevenue)}
                        trend={roomPromotedTrend.trend}
                        trendValue={roomPromotedTrend.trendValue}
                        footerText="Compared to yesterday"
                        description={roomPromotedUnavailable ? 'Could not load room promotion revenue' : 'Captured from room promotions'}
                        compact
                    />
                    <StatCard
                        title="Pending Room Promotions"
                        value={roomPromotedUnavailable ? 'Unavailable' : formatUsd(roomPromotedData.pendingHoldTotal)}
                        trend="up"
                        trendValue=""
                        footerText=""
                        description={roomPromotedUnavailable ? 'Could not load pending promotions' : `${roomPromotedData.pendingCount} authorized holds awaiting review`}
                        compact
                    />
                    <StatCard
                        title="Total Room Promotions Revenue"
                        value={roomPromotedUnavailable ? 'Unavailable' : formatUsd(roomPromotedData.totalRevenue)}
                        trend="up"
                        trendValue=""
                        footerText=""
                        description={roomPromotedUnavailable ? 'Could not load room promotion revenue' : `All-time · ${roomPromotedData.approvedCount} approved promotions`}
                        compact
                    />
                </>
            )}

            {isStatusLoading ? (
                // Loading skeleton for status cards
                <>
                    <Skeleton className="h-24 w-full rounded-xl"/>
                    <Skeleton className="h-24 w-full rounded-xl"/>
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
