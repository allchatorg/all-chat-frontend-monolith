"use client"

import {StatCard} from "@ads/components/stat-card";
import {NotifyCard} from "@ads/components/NotifyCard";
import {CompletionCard} from "@ads/components/CompletionCard";
import Link from "next/link";
import {AdStatus, AdStatusCount} from "@ads/models/ad";
import {useGetMyPromotionSpendSummaryQuery} from "@ads/store/services/promotedMessagesApi";
import {useGetUserAdViewsSummaryQuery} from "@ads/store/services/adsApi";

interface SectionCardsProps {
    statusCounts?: AdStatusCount[];
    isLoading?: boolean;
    // When false (promotion-only user with no ads), only the Promotion Spend card renders
    showAdStats?: boolean;
}

// Helper to get count for a specific status
function getStatusCount(statusCounts: AdStatusCount[] | undefined, status: AdStatus): number {
    if (!statusCounts) return 0;
    const found = statusCounts.find(sc => sc.status === status);
    return found?.count ?? 0;
}

const formatUsd = (value: number) =>
    new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD'}).format(value);

export function SectionCards({statusCounts, isLoading, showAdStats = true}: SectionCardsProps) {
    const pendingAdsCount = getStatusCount(statusCounts, AdStatus.PENDING);
    const activeCount = getStatusCount(statusCounts, AdStatus.ACTIVE);
    const completedCount = getStatusCount(statusCounts, AdStatus.COMPLETED);
    const rejectedCount = getStatusCount(statusCounts, AdStatus.REJECTED);
    const totalAds = pendingAdsCount + activeCount + completedCount + rejectedCount;

    const {data: spendData, isLoading: isSpendLoading} = useGetMyPromotionSpendSummaryQuery();
    const pendingCount = spendData?.pendingCount ?? 0;

    const {data: viewsSummary, isLoading: isClicksLoading} = useGetUserAdViewsSummaryQuery(undefined, {
        skip: !showAdStats,
    });
    const totalClicks = viewsSummary?.totalClicks ?? 0;
    const overallCtrPct = ((viewsSummary?.overallCtr ?? 0) * 100).toFixed(2);

    const promotionSpendCard = (
        <StatCard
            title="Promotion Spend"
            value={isSpendLoading ? "..." : formatUsd(spendData?.totalSpent ?? 0)}
            trend="up"
            trendValue=""
            footerText={`${pendingCount} pending promotion${pendingCount === 1 ? "" : "s"}`}
            description={`${formatUsd(spendData?.pendingHoldTotal ?? 0)} on hold awaiting review`}
        />
    );

    if (!showAdStats) {
        return (
            <div
                className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:shadow-sm lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
                {promotionSpendCard}
            </div>
        );
    }

    return (
        <div
            className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:shadow-sm lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
            <StatCard
                title="Total Ads"
                value={isLoading ? "..." : totalAds.toLocaleString()}
                trend="up"
                trendValue=""
                footerText="All your ads"
                description="Total ads across all statuses"
            />

            <Link href="/portal/ads?status=PENDING" className="contents">
                <NotifyCard
                    title="Pending Ads"
                    value={isLoading ? 0 : pendingAdsCount}
                    label="Review"
                    description="Ads waiting for approval"
                    variant="warning"
                />
            </Link>

            <Link href="/portal/ads?status=ACTIVE" className="contents">
                <NotifyCard
                    title="Active Ads"
                    value={isLoading ? 0 : activeCount}
                    label="View"
                    description="Currently active ads"
                    variant="success"
                />
            </Link>

            <CompletionCard
                title="Completed Ads"
                current={isLoading ? 0 : completedCount}
                total={totalAds || 0}
                description={`${completedCount} ads have completed`}
            />

            <StatCard
                title="Total Photo & Video Clicks"
                value={isClicksLoading ? "..." : totalClicks.toLocaleString()}
                trend="up"
                trendValue=""
                footerText={`Overall CTR ${overallCtrPct}%`}
                description={totalClicks === 0
                    ? "No photo or video clicks recorded yet"
                    : "Clicks across all your photo & video ads"}
            />

            {promotionSpendCard}
        </div>
    );
}
