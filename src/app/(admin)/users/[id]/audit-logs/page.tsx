"use client";

import React, {useEffect} from "react";
import {useSelector} from "react-redux";
import {useParams} from "next/navigation";
import PaginationFooter from "@/components/PaginationFooter";
import {useThunk} from "@/lib/hooks/useThunk";
import {searchAuditLogs} from "@/redux/audit-logs/auditLogsThunk";
import {auditlogs} from "@/redux/audit-logs/auditLogsSelector";
import {AuditLogAccordion} from "@/components/AuditLogAccordion";
import {ScrollArea} from "@/components/ui/scroll-area";

const PAGE_SIZE = 10;

export default function UserAuditLogsPage() {
    const params = useParams();
    const userId = params.id as string;

    const logsPage = useSelector(auditlogs);
    const currentPage = logsPage.number + 1;

    const [fetchAuditLogs, loading] = useThunk(searchAuditLogs);

    useEffect(() => {
        if (userId) {
            fetchAuditLogs({
                page: 0,
                size: PAGE_SIZE,
                targetUserId: parseInt(userId)
            });
        }
    }, [userId, fetchAuditLogs]);

    const handlePageChange = (page: number) => {
        if (userId) {
            fetchAuditLogs({
                page: page - 1,
                size: PAGE_SIZE,
                targetUserId: parseInt(userId)
            });
        }
    };

    return (
        <div className="h-full w-full flex flex-col">
            {loading ? (
                <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
                    Loading audit logs...
                </div>
            ) : logsPage.content.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    No audit logs found
                </div>

            ) : (
                <>
                    <div className="flex-1 min-h-0 overflow-hidden">
                        <ScrollArea className="h-full w-full p-4">
                            <AuditLogAccordion logs={logsPage.content}/>
                        </ScrollArea>
                    </div>

                    <div className="border-t bg-background flex-shrink-0">
                        <PaginationFooter
                            totalPages={logsPage.totalPages}
                            currentPage={currentPage}
                            onPageChange={handlePageChange}
                        />
                    </div>
                </>
            )}
        </div>
    );
}