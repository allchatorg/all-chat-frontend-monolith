"use client"

import {ChartAreaInteractive} from "@ads/components/chart-area-interactive"
import {AdsTable} from "@ads/components/ads-table"
import {SectionCards} from "@ads/components/section-cards"
import {SiteHeader} from "@ads/components/site-header"
import {Card, CardContent, CardHeader, CardTitle} from "@ads/components/ui/card"
import {
    useGetAdStatusCountsByUserQuery,
    useGetUserAdViewsDailyBreakdownQuery,
    useSearchAdsQuery
} from "@ads/store/services/adsApi"
import {AdStatus} from "@ads/models/ad"
import {useUser} from "@ads/hooks/use-user"

export default function Page() {
    const {currentUserId} = useUser();

    // Fetch ad status counts for the current user
    const {data: statusCounts, isLoading: isLoadingCounts} = useGetAdStatusCountsByUserQuery();

    // Fetch user's daily views for the chart
    const {data: dailyViewsData, isLoading: isLoadingChart} = useGetUserAdViewsDailyBreakdownQuery();

    // Fetch active ads for the table
    const {data: activeAdsData, isLoading: isLoadingAds} = useSearchAdsQuery({
        status: AdStatus.ACTIVE,
        page: 0,
        size: 10,
        userId: currentUserId,
    });

    const activeAds = activeAdsData?.content ?? [];

    // Promotion-only users see just their promotion spend — ad statistics are
    // hidden until they buy their first ad (kept visible while counts load to
    // avoid a layout flash for ad owners).
    const totalAds = statusCounts?.reduce((sum, sc) => sum + sc.count, 0) ?? 0;
    const showAdStats = isLoadingCounts || totalAds > 0;

    return (
        <div>
            <SiteHeader title={'Dashboard'} description={'Overview of your ads performance'}/>
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <SectionCards statusCounts={statusCounts} isLoading={isLoadingCounts}
                                      showAdStats={showAdStats}/>
                        {showAdStats && (
                            <>
                                <div className="px-4 lg:px-6">
                                    <ChartAreaInteractive
                                        dailyViews={dailyViewsData?.dailyViews?.slice().reverse() ?? []}
                                        isLoading={isLoadingChart}
                                    />
                                </div>
                                <div className="px-4 lg:px-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Active ads</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            {isLoadingAds ? (
                                                <div className="text-muted-foreground">Loading ads...</div>
                                            ) : activeAds.length === 0 ? (
                                                <div className="text-muted-foreground">No active ads found.</div>
                                            ) : (
                                                <AdsTable ads={activeAds} bare/>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
