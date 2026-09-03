"use client"
import {useMemo, useState} from 'react';
import {SiteHeader} from "@ads/components/site-header";
import {RoomPromotionsTable, RoomPromotionStatusFilter} from "@ads/components/room-promotions-table";
import {useSearchRoomPromotionsQuery} from "@ads/store/services/adminRoomPromotionsApi";
import {RoomPromotionStatus} from "@ads/models/room-promotion";
import {useDebounce} from "@ads/hooks/useDebounce";

const PAGE_SIZE = 10;

function AdminRoomPromotionsPageContent() {
    // Review queue defaults: PENDING promotions, oldest first.
    const [status, setStatus] = useState<RoomPromotionStatusFilter>(RoomPromotionStatus.PENDING);
    const [sort, setSort] = useState("submittedAt,asc");
    const [page, setPage] = useState(0);
    const [localSearch, setLocalSearch] = useState("");

    const debouncedSearch = useDebounce(localSearch);

    // Numeric search input means User ID, anything else means email.
    const {userId, email} = useMemo(() => {
        if (!debouncedSearch) return {userId: undefined, email: undefined};

        const isNumeric = /^\d+$/.test(debouncedSearch);
        if (isNumeric) {
            return {userId: parseInt(debouncedSearch), email: undefined};
        }
        return {userId: undefined, email: debouncedSearch};
    }, [debouncedSearch]);

    const {data} = useSearchRoomPromotionsQuery({
        status: status === "ALL" ? undefined : status,
        email,
        userId,
        page,
        size: PAGE_SIZE,
        sort,
    });

    const handleStatusChange = (nextStatus: RoomPromotionStatusFilter) => {
        setStatus(nextStatus);
        setPage(0);
    };

    const handleSearchQueryChange = (value: string) => {
        setLocalSearch(value);
        setPage(0);
    };

    const handleSortChange = (value: string) => {
        setSort(value);
        setPage(0);
    };

    return (
        <div className="w-full px-4 lg:px-6 py-4 md:gap-6 md:py-6">
            <RoomPromotionsTable
                promotions={data?.content || []}
                status={status}
                onStatusChange={handleStatusChange}
                page={page}
                totalPages={data?.totalPages || 0}
                onPageChange={setPage}
                isAdmin={true}
                searchQuery={localSearch}
                onSearchQueryChange={handleSearchQueryChange}
                sort={sort}
                onSortChange={handleSortChange}
            />
        </div>
    );
}

export default function AdminRoomPromotionsPage() {
    return (
        <div className="w-full">
            <SiteHeader
                title="Room Promotions"
                description="Review and manage chat room promotions"
            />
            <AdminRoomPromotionsPageContent/>
        </div>
    );
}
