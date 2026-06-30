import {StatCard} from "@ads/components/stat-card";
import {NotifyCard} from "@ads/components/NotifyCard";
import {CompletionCard} from "@ads/components/CompletionCard";
import Link from "next/link";
import {AdStatus, AdStatusCount} from "@ads/models/ad";

interface SectionCardsProps {
    statusCounts?: AdStatusCount[];
    isLoading?: boolean;
}

// Helper to get count for a specific status
function getStatusCount(statusCounts: AdStatusCount[] | undefined, status: AdStatus): number {
    if (!statusCounts) return 0;
    const found = statusCounts.find(sc => sc.status === status);
    return found?.count ?? 0;
}

export function SectionCards({statusCounts, isLoading}: SectionCardsProps) {
    const submittedCount = getStatusCount(statusCounts, AdStatus.SUBMITTED);
    const activeCount = getStatusCount(statusCounts, AdStatus.ACTIVE);
    const completedCount = getStatusCount(statusCounts, AdStatus.COMPLETED);
    const rejectedCount = getStatusCount(statusCounts, AdStatus.REJECTED);
    const totalAds = submittedCount + activeCount + completedCount + rejectedCount;

    return (
        <div
            className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-sm lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
            <StatCard
                title="Total Ads"
                value={isLoading ? "..." : totalAds.toLocaleString()}
                trend="up"
                trendValue=""
                footerText="All your ads"
                description="Total ads across all statuses"
            />

            <Link href="/portal/ads?status=SUBMITTED" className="contents">
                <NotifyCard
                    title="Submitted Ads"
                    value={isLoading ? 0 : submittedCount}
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
        </div>
    );
}
