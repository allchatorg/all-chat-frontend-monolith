"use client"
import {Suspense, useMemo, useState} from 'react';
import {SiteHeader} from "@ads/components/site-header";
import {AdsTable} from "@ads/components/ads-table";
import {useAdsParams} from "@ads/hooks/use-ads-params";
import {useUser} from "@ads/hooks/use-user";
import {UserRole} from "@ads/models/user-role";
import {useGetAdStatusCountsQuery, useSearchAdsQuery} from "@ads/store/services/adminAdsApi";
import {AdFormatType, AdStatus} from "@ads/models/ad";
import {useDebounce} from "@ads/hooks/useDebounce";

function AdminAdsPageContent() {
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

    // Local search state for immediate UI updates
    const [localSearch, setLocalSearch] = useState(searchQuery || "")

    // Debounced search value
    const debouncedSearch = useDebounce(localSearch)

    // Parse search query to determine if it's a User ID or Email
    const {userId, email} = useMemo(() => {
        if (!debouncedSearch) return {userId: undefined, email: undefined}

        const isNumeric = /^\d+$/.test(debouncedSearch)
        if (isNumeric) {
            return {userId: parseInt(debouncedSearch), email: undefined}
        }
        return {userId: undefined, email: debouncedSearch}
    }, [debouncedSearch])

    // Convert sort string to backend format
    const sortParam = sort ? (() => {
        const [field, direction] = sort.split(',');
        return JSON.stringify([{
            field,
            direction: direction.toUpperCase()
        }]);
    })() : undefined;

    const {data} = useSearchAdsQuery({
        status: status && status !== 'null' ? (status as AdStatus) : undefined,
        types: type && type !== 'null' ? [type as AdFormatType] : undefined,
        sort: sortParam,
        page,
        size,
        approvedAtStart: startDate ? startDate.toISOString() : undefined,
        approvedAtEnd: endDate ? endDate.toISOString() : undefined,
        userId,
        email,
    });

    const {data: statusCountsData} = useGetAdStatusCountsQuery();

    // Calculate counts from status counts API
    const counts = {
        all: data?.totalElements || 0,
        active: statusCountsData?.find(sc => sc.status === AdStatus.ACTIVE)?.count || 0,
        submitted: statusCountsData?.find(sc => sc.status === AdStatus.SUBMITTED)?.count || 0,
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
                searchQuery={localSearch}
                onStatusChange={setStatus}
                onTypeChange={setType}
                onSortChange={setSort}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onSearchQueryChange={setLocalSearch}
                onClearFilters={() => {
                    setLocalSearch("")
                    clearParams()
                }}
                isAdmin={user.role === UserRole.ADMIN}
                counts={counts}
            />
        </div>
    );
}

export default function AdminAdsPage() {
    return (
        <div className="w-full">
            <SiteHeader
                title="Ads Management"
                description="Manage and review all platform advertisements"
            />
            <Suspense fallback={<div>Loading...</div>}>
                <AdminAdsPageContent/>
            </Suspense>
        </div>
    );
}
