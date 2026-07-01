"use client";
import {useParams} from "next/navigation";
import {useMemo, useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@ads/components/ui/card";
import {AdsTable} from "@ads/components/ads-table";
import {useGetUserByIdQuery} from "@ads/store/services/adminUsersApi";
import {useGetAdStatusCountsByUserIdQuery, useSearchAdsQuery} from "@ads/store/services/adminAdsApi";
import {AdStatus} from "@ads/models/ad";

export default function UserAdsPage() {
    const params = useParams();
    const userId = Number(params.id);
    const [status, setStatus] = useState<string | null>(null);
    const [type, setType] = useState<string | null>(null);
    const [sort, setSort] = useState<string>("submittedAt,desc");
    const [page] = useState<number>(0);
    const [size] = useState<number>(100); // Large page size to get all user ads

    const {data: user, isLoading: isUserLoading, error: userError} = useGetUserByIdQuery(userId);

    const sortParam = sort ? (() => {
        const [field, direction] = sort.split(',');
        return JSON.stringify([{
            field,
            direction: direction.toUpperCase()
        }]);
    })() : undefined;

    const {
        data: adsResponse,
        isLoading: isAdsLoading,
        error: adsError
    } = useSearchAdsQuery({
        userId,
        ...(status && {status: status as AdStatus}),
        page,
        size,
        sort: sortParam,
    });

    // Fetch status counts (these remain fixed regardless of filters)
    const {
        data: statusCounts,
        isLoading: isStatusCountsLoading,
        error: statusCountsError
    } = useGetAdStatusCountsByUserIdQuery(userId);

    const userAds = useMemo(() => {
        return adsResponse?.content || [];
    }, [adsResponse]);

    // Apply type filter (not supported by API, so filter client-side)
    const filteredAds = useMemo(() => {
        if (!type) return userAds;
        return userAds.filter(ad => ad.formatType === type);
    }, [userAds, type]);

    // Convert status counts array to counts object
    const counts = useMemo(() => {
        if (!statusCounts) {
            return {
                all: 0,
                active: 0,
                submitted: 0,
                completed: 0,
                rejected: 0,
            };
        }

        const countMap = statusCounts.reduce((acc, item) => {
            acc[item.status.toLowerCase()] = item.count;
            return acc;
        }, {} as Record<string, number>);

        const total = statusCounts.reduce((sum, item) => sum + item.count, 0);

        return {
            all: total,
            active: countMap['active'] || 0,
            submitted: countMap['submitted'] || 0,
            completed: countMap['completed'] || 0,
            rejected: countMap['rejected'] || 0,
        };
    }, [statusCounts]);

    const handleClearFilters = () => {
        setStatus(null);
        setType(null);
    };

    // Loading state
    if (isUserLoading || isAdsLoading || isStatusCountsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-muted-foreground">Loading...</div>
            </div>
        );
    }

    // Error state
    if (userError || adsError || statusCountsError) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-destructive">
                    Error loading data. Please try again later.
                </div>
            </div>
        );
    }

    // User not found
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-muted-foreground">User not found</div>
            </div>
        );
    }

    const userName = `${user.firstName} ${user.lastName}`;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Ad Statistics</CardTitle>
                    <CardDescription>Summary of user&#39;s advertising activity</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col items-center justify-center p-4 border border-border rounded-lg bg-muted/30">
                            <p className="text-2xl font-bold text-foreground">{user.totalPurchasedAdsCount}</p>
                            <p className="text-sm text-muted-foreground">Total Ads</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 border border-border rounded-lg bg-muted/30">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {counts.active}
                            </p>
                            <p className="text-sm text-muted-foreground">Active Ads</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 border border-border rounded-lg bg-muted/30">
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {counts.submitted}
                            </p>
                            <p className="text-sm text-muted-foreground">Submitted Ads</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>User Ads</CardTitle>
                    <CardDescription>
                        All advertisements created by {userName}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AdsTable
                        ads={filteredAds}
                        status={status}
                        type={type}
                        sort={sort}
                        onStatusChange={setStatus}
                        onTypeChange={setType}
                        onSortChange={setSort}
                        onClearFilters={handleClearFilters}
                        counts={counts}
                        isAdmin={false}
                        viewDetailsPath={"/portal/admin/ads"}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
