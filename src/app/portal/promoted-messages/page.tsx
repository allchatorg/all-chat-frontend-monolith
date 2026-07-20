"use client"
import {useState} from 'react';
import {SiteHeader} from "@ads/components/site-header";
import {PromotedMessagesTable, PromotedMessageStatusFilter} from "@ads/components/promoted-messages-table";
import {useGetMyPromotedMessagesQuery} from "@ads/store/services/promotedMessagesApi";

const PAGE_SIZE = 10;

function PromotedMessagesPageContent() {
    const [status, setStatus] = useState<PromotedMessageStatusFilter>("ALL");
    const [page, setPage] = useState(0);

    // Newest first (backend default: submittedAt desc)
    const {data} = useGetMyPromotedMessagesQuery({
        status: status === "ALL" ? undefined : status,
        page,
        size: PAGE_SIZE,
    });

    const handleStatusChange = (nextStatus: PromotedMessageStatusFilter) => {
        setStatus(nextStatus);
        setPage(0);
    };

    return (
        <div className="w-full px-4 lg:px-6 py-4 md:gap-6 md:py-6">
            <PromotedMessagesTable
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

export default function PromotedMessagesPage() {
    return (
        <div className="w-full">
            <SiteHeader
                title="My Promoted Messages"
                description="Manage the messages you have promoted in chat rooms"
            />
            <PromotedMessagesPageContent/>
        </div>
    );
}
