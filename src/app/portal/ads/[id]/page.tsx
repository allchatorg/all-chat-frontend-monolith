'use client'
import {SiteHeader} from "@ads/components/site-header";
import {AdDetailsStats} from "@/app/portal/ads/[id]/components/ad-details-stats";
import {useGetAdByIdQuery, useGetAdDailyStatsQuery} from "@ads/store/services/adsApi";
import {useParams} from "next/navigation";
import {Card, CardContent} from "@ads/components/ui/card";
import {Loader2} from "lucide-react";
import AdStatusDetails from "@/app/portal/ads/[id]/components/ad-status-details";

export default function UserAdDetailsPage() {
    const params = useParams();
    const adId = Number(params.id);

    const {data: adData, isLoading, error} = useGetAdByIdQuery(adId);
    const {data: statsData} = useGetAdDailyStatsQuery({id: adId});

    if (isLoading) {
        return (
            <div>
                <SiteHeader
                    title={'Ad Campaign Details'}
                    description={''}
                />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <Card className="m-4">
                            <CardContent className="flex items-center justify-center p-12">
                                <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                                    <p className="text-sm text-muted-foreground">Loading ad details...</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !adData) {
        return (
            <div>
                <SiteHeader
                    title={'Ad Campaign Details'}
                    description={''}
                />
                <div className="flex flex-1 flex-col">
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <Card className="m-4">
                            <CardContent className="p-12">
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <p className="text-lg font-semibold text-destructive">Error Loading Ad</p>
                                    <p className="text-sm text-muted-foreground">
                                        {error && 'status' in error
                                            ? `Failed to load ad details. Status: ${error.status}`
                                            : 'An unexpected error occurred while loading the ad.'}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <SiteHeader
                title={adData.title}
                description={'Ad Campaign Details'}
            />
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4">
                        <AdDetailsStats
                            status={adData.status}
                            formatType={adData.formatType}
                            isAdmin={false}
                            stats={statsData}
                        />

                        <AdStatusDetails
                            className="m-4"
                            data={adData}
                            isAdmin={false}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}