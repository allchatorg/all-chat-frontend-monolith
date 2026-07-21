"use client";
import {useParams} from "next/navigation";
import {useState} from "react";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@ads/components/ui/card";
import {PromotedMessagesTable, PromotedMessageStatusFilter} from "@ads/components/promoted-messages-table";
import {PromotedMessageStatus} from "@ads/models/promoted-message";
import {useGetUserByIdQuery} from "@ads/store/services/adminUsersApi";
import {
    useGetBanPromotionsSummaryQuery,
    useSearchPromotedMessagesQuery,
} from "@ads/store/services/adminPromotedMessagesApi";

const PAGE_SIZE = 10;

export default function UserPromotedMessagesPage() {
    const params = useParams();
    const userId = Number(params.id);
    // Per-user browsing, not a review queue, so default to All rather than Pending.
    const [status, setStatus] = useState<PromotedMessageStatusFilter>("ALL");
    const [sort, setSort] = useState("submittedAt,desc");
    const [page, setPage] = useState(0);

    const {data: user, isLoading: isUserLoading, error: userError} = useGetUserByIdQuery(userId);

    const {
        data: promotionsResponse,
        isLoading: isPromotionsLoading,
        error: promotionsError
    } = useSearchPromotedMessagesQuery({
        userId,
        status: status === "ALL" ? undefined : status,
        page,
        size: PAGE_SIZE,
        sort,
    });

    const {
        data: summary,
        isLoading: isSummaryLoading,
        error: summaryError
    } = useGetBanPromotionsSummaryQuery(userId);

    const handleStatusChange = (nextStatus: PromotedMessageStatusFilter) => {
        setStatus(nextStatus);
        setPage(0);
    };

    const handleSortChange = (value: string) => {
        setSort(value);
        setPage(0);
    };

    if (isUserLoading || isPromotionsLoading || isSummaryLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-muted-foreground">Loading...</div>
            </div>
        );
    }

    if (userError || promotionsError || summaryError) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-destructive">
                    Error loading data. Please try again later.
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-lg text-muted-foreground">User not found</div>
            </div>
        );
    }

    const userName = `${user.firstName} ${user.lastName}`;

    const counts = {
        ALL: summary?.totalPromotions ?? 0,
        [PromotedMessageStatus.PENDING]: summary?.pendingCount ?? 0,
        [PromotedMessageStatus.APPROVED]: summary?.approvedCount ?? 0,
        [PromotedMessageStatus.DENIED]: summary?.deniedCount ?? 0,
        [PromotedMessageStatus.CANCELED]: summary?.canceledCount ?? 0,
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Promotion Statistics</CardTitle>
                    <CardDescription>Summary of user&#39;s message promotion activity</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex flex-col items-center justify-center p-4 border border-border rounded-lg bg-muted/30">
                            <p className="text-2xl font-bold text-foreground">{summary?.totalPromotions ?? 0}</p>
                            <p className="text-sm text-muted-foreground">Total Promotions</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 border border-border rounded-lg bg-muted/30">
                            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {summary?.pendingCount ?? 0}
                            </p>
                            <p className="text-sm text-muted-foreground">Pending Promotions</p>
                        </div>
                        <div className="flex flex-col items-center justify-center p-4 border border-border rounded-lg bg-muted/30">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {summary?.approvedCount ?? 0}
                            </p>
                            <p className="text-sm text-muted-foreground">Approved Promotions</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>User Promoted Messages</CardTitle>
                    <CardDescription>
                        All message promotions submitted by {userName}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <PromotedMessagesTable
                        promotions={promotionsResponse?.content || []}
                        status={status}
                        onStatusChange={handleStatusChange}
                        page={page}
                        totalPages={promotionsResponse?.totalPages || 0}
                        onPageChange={setPage}
                        isAdmin={false}
                        viewDetailsPath="/portal/admin/promoted-messages"
                        counts={counts}
                        sort={sort}
                        onSortChange={handleSortChange}
                    />
                </CardContent>
            </Card>
        </div>
    );
}
