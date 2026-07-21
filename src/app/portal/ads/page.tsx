"use client"
import {Suspense} from 'react';
import {SiteHeader} from "@ads/components/site-header";
import {AdsTable} from "@ads/components/ads-table";
import {useAdsParams} from "@ads/hooks/use-ads-params";
import {useUser} from "@ads/hooks/use-user";
import {UserRole} from "@ads/models/user-role";
import {useGetAdStatusCountsByUserQuery, useSearchAdsQuery} from "@ads/store/services/adsApi";
import {AdFormatType, AdStatus} from "@ads/models/ad";

function AdsPageContent() {
    const {user} = useUser();
    const {
        status,
        type,
        sort,
        page,
        size,
        startDate,
        endDate,
        searchQuery,
        setStatus,
        setType,
        setSort,
        setStartDate,
        setEndDate,
        setSearchQuery,
        clearParams
    } = useAdsParams();

    // Convert sort string to backend format
    const sortParam = sort ? (() => {
        const [field, direction] = sort.split(',');
        return JSON.stringify([{
            field,
            direction: direction.toUpperCase()
        }]);
    })() : undefined;

    // For regular users, enforce userId to match authenticated user
    const {data} = useSearchAdsQuery({
        status: status && status !== 'null' ? (status as AdStatus) : undefined,
        types: type && type !== 'null' ? [type as AdFormatType] : undefined,
        sort: sortParam,
        page,
        size,
        // For regular users, always include their userId (backend enforces this)
        userId: user.role === UserRole.USER ? parseInt(user.id) : undefined,
        // Admin can optionally filter by email using search query
        email: searchQuery && searchQuery !== 'null' ? searchQuery : undefined,
    });

    // Use user-specific counts for regular users, all counts for admins
    const {data: statusCountsData} = useGetAdStatusCountsByUserQuery()

    // Calculate counts from status counts API
    const counts = {
        all: data?.totalElements || 0,
        active: statusCountsData?.find(sc => sc.status === AdStatus.ACTIVE)?.count || 0,
        pending: statusCountsData?.find(sc => sc.status === AdStatus.PENDING)?.count || 0,
        completed: statusCountsData?.find(sc => sc.status === AdStatus.COMPLETED)?.count || 0,
        rejected: statusCountsData?.find(sc => sc.status === AdStatus.REJECTED)?.count || 0,
    };

    return (
        <div className="w-full px-4 lg:px-6 py-4 md:gap-6 md:py-6 ">
            <AdsTable
                ads={data?.content || []}
                status={status}
                type={type}
                sort={sort}
                startDate={startDate}
                endDate={endDate}
                searchQuery={searchQuery}
                onStatusChange={setStatus}
                onTypeChange={setType}
                onSortChange={setSort}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onSearchQueryChange={setSearchQuery}
                onClearFilters={clearParams}
                isAdmin={user.role === UserRole.ADMIN}
                counts={counts}
            />
        </div>
    );
}

export default function AdsPage() {
    return (
        <div className="w-full">
            <SiteHeader
                title="My Campaigns"
                description="Manage your ad campaigns"
            />
            <Suspense fallback={<div>Loading...</div>}>
                <AdsPageContent/>
            </Suspense>
        </div>
    );
}