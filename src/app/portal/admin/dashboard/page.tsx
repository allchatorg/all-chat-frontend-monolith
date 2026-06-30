"use client"

import {SiteHeader} from "@ads/components/site-header"
import {AdminSectionCards} from "@ads/components/admin-section-cards"
import {ChartAreaPurchasedAds} from "@ads/components/chart-area-purchased-ads"
import {ChartBarRevenue} from "@ads/components/chart-bar-revenue"
import {AdsTable} from "@ads/components/ads-table"
import {useSearchAdsQuery} from "@ads/store/services/adminAdsApi"
import {AdStatus} from "@ads/models/ad"

export default function AdminDashboardPage() {
    const {data} = useSearchAdsQuery({
        status: AdStatus.SUBMITTED,
        size: 100,
        page: 0,
        sort: "submittedDate,desc"
    })

    return (
        <div>
            <SiteHeader
                title="Admin Dashboard"
                description="Overview of platform analytics and metrics"
            />
            <div className="w-full flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        <AdminSectionCards/>
                        <div className="px-4 lg:px-6">
                            <ChartAreaPurchasedAds/>
                        </div>
                        <div className="px-4 lg:px-6">
                            <ChartBarRevenue/>
                        </div>
                        <div className="px-4 lg:px-6">
                            <h2 className="text-lg font-semibold mb-4">Submitted Ads</h2>
                            <AdsTable
                                ads={data?.content || []}
                                isAdmin={true}
                                viewDetailsPath="/portal/admin/ads"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
