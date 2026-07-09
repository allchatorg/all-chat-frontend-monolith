'use client'

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import React, {useEffect, useState} from 'react';
import {useRouter} from "next/navigation";
import {Scale, User} from "lucide-react";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Badge} from "@/components/ui/badge";
import PaginationFooter from "@/components/PaginationFooter";
import {useThunk} from "@/lib/hooks/useThunk";
import {useSelector} from "react-redux";
import {AdminPageHeader} from "@/components/AdminPageHeader";
import {searchAppealsThunk} from "@/redux/appeals/appealsThunk";
import {selectAppeals} from "@/redux/appeals/appealsSelector";
import {BanAppealStatus} from "@/models/BanAppeal";
import {getReportTypeLabel} from "@/lib/reportUtils";
import {BanTypeEnum} from "@/models/BanTypeEnum";
import {AppealStatusBadge} from "./components/AppealStatusBadge";

const PAGE_SIZE = 10;
const OPEN_FILTER = "OPEN";
const ALL_FILTER = "ALL";

type StatusFilter = typeof OPEN_FILTER | typeof ALL_FILTER | BanAppealStatus;

export default function Appeals() {
    const router = useRouter();
    const [fetchAppeals, isLoading] = useThunk(searchAppealsThunk);

    const {content = [], totalPages = 0, number: pageIndex = 0, totalElements} = useSelector(selectAppeals);

    const [statusFilter, setStatusFilter] = useState<StatusFilter>(OPEN_FILTER);
    const current = pageIndex + 1;

    const buildRequest = (page: number) => ({
        page,
        pageSize: PAGE_SIZE,
        status: statusFilter === OPEN_FILTER || statusFilter === ALL_FILTER
            ? undefined
            : statusFilter,
        openOnly: statusFilter === OPEN_FILTER,
    });

    useEffect(() => {
        fetchAppeals(buildRequest(0));
    }, [statusFilter, fetchAppeals]);

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        fetchAppeals(buildRequest(page - 1));
    };

    return (
        <div className="flex h-full w-full flex-col px-2 sm:px-4 space-y-2 sm:space-y-4">
            <AdminPageHeader
                title="Ban Appeals"
                description="Appeals submitted by banned users, oldest first. Approving an appeal lifts the ban; denying keeps it in place. Both require a resolution note."
                icon={Scale}
            />

            <Card className="min-h-0 flex-1 overflow-y-auto flex flex-col">
                <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <CardTitle className="text-lg sm:text-xl">
                                Appeals ({totalElements ?? 0})
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base">
                                Reviewed in submission order
                            </CardDescription>
                        </div>
                        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                            <SelectTrigger className="w-full sm:w-56">
                                <SelectValue placeholder="Filter by status"/>
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={OPEN_FILTER}>All open</SelectItem>
                                <SelectItem value={ALL_FILTER}>All statuses</SelectItem>
                                <SelectItem value={BanAppealStatus.PENDING}>Pending</SelectItem>
                                <SelectItem value={BanAppealStatus.UNDER_REVIEW}>Under review</SelectItem>
                                <SelectItem value={BanAppealStatus.APPROVED}>Approved</SelectItem>
                                <SelectItem value={BanAppealStatus.DENIED}>Denied</SelectItem>
                                <SelectItem value={BanAppealStatus.EXPIRED}>Expired</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0 flex-1 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="space-y-3">
                            {isLoading ? (
                                <div className="py-8 text-center">
                                    <div
                                        className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                                    <p className="text-muted-foreground">Loading appeals...</p>
                                </div>
                            ) : content.length === 0 ? (
                                <div className="py-8 text-center text-muted-foreground">
                                    No appeals found.
                                </div>
                            ) : (
                                content.map((appeal) => (
                                    <Card
                                        key={appeal.id}
                                        className="cursor-pointer transition-colors hover:bg-accent/50"
                                        onClick={() => router.push(`/appeals/${appeal.id}`)}
                                    >
                                        <CardContent className="p-4 space-y-2">
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground shrink-0"/>
                                                    <span className="font-medium">{appeal.username}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        #{appeal.id}
                                                    </span>
                                                </div>
                                                <AppealStatusBadge status={appeal.status}/>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                                <Badge
                                                    variant={appeal.banType === BanTypeEnum.PERMANENT ? "destructive" : "secondary"}>
                                                    {appeal.banType}
                                                </Badge>
                                                <Badge variant="outline">
                                                    {getReportTypeLabel(appeal.reportType)}
                                                </Badge>
                                                {appeal.bannedByUsername && (
                                                    <span className="text-muted-foreground">
                                                        banned by <span
                                                        className="font-medium text-foreground">{appeal.bannedByUsername}</span>
                                                    </span>
                                                )}
                                                {appeal.reviewerUsername && (
                                                    <span className="text-muted-foreground">
                                                        · reviewer <span
                                                        className="font-medium text-foreground">{appeal.reviewerUsername}</span>
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Submitted {new Date(appeal.submittedAt).toLocaleString()}
                                                {appeal.resolvedAt && ` · Resolved ${new Date(appeal.resolvedAt).toLocaleString()}`}
                                            </p>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="p-4 sm:p-6 border-t">
                    <PaginationFooter
                        className="w-full p-0 border-0 mt-0"
                        totalPages={totalPages || 0}
                        currentPage={current}
                        onPageChange={handlePageChange}
                    />
                </CardFooter>
            </Card>
        </div>
    );
}
