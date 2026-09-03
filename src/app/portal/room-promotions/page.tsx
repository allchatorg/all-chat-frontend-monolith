"use client"
import {useState} from 'react';
import {SiteHeader} from "@ads/components/site-header";
import {RoomPromotionsTable, RoomPromotionStatusFilter} from "@ads/components/room-promotions-table";
import {useGetMyRoomPromotionsQuery} from "@ads/store/services/roomPromotionsApi";

const PAGE_SIZE = 10;

function RoomPromotionsPageContent() {
    const [status, setStatus] = useState<RoomPromotionStatusFilter>("ALL");
    const [page, setPage] = useState(0);

    // Newest first (backend default: submittedAt desc)
    const {data} = useGetMyRoomPromotionsQuery({
        status: status === "ALL" ? undefined : status,
        page,
        size: PAGE_SIZE,
    });

    const handleStatusChange = (nextStatus: RoomPromotionStatusFilter) => {
        setStatus(nextStatus);
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
            />
        </div>
    );
}

export default function RoomPromotionsPage() {
    return (
        <div className="w-full">
            <SiteHeader
                title="My Room Promotions"
                description="Manage the chat rooms you have promoted"
            />
            <RoomPromotionsPageContent/>
        </div>
    );
}
