// @flow
import * as React from 'react';
import {useEffect} from 'react';
import {useSelector} from "react-redux";
import {selectModPanelAuditLogs, selectModPanelUserInfo} from "@/redux/modPanel/modPanelSelector";
import {useThunk} from "@/lib/hooks/useThunk";
import {getAuditLogsThunk} from "@/redux/modPanel/modPanelThunk";
import AuditLogCardList from "@/components/AuditLogCardList";
import PaginationFooter from "@/components/PaginationFooter";

type Props = {};

export function ModPanelAuditLogView(props: Props) {
    const selectedUserInfo = useSelector(selectModPanelUserInfo);
    const auditLogsPage = useSelector(selectModPanelAuditLogs);
    const currentPage = auditLogsPage.number + 1;

    const [searchUserAuditLogs, auditLogsLoading, auditLogsError] = useThunk(getAuditLogsThunk);

    useEffect(() => {
        searchUserAuditLogs({
            userId: selectedUserInfo.selectedUserId!,
            page: 0,
            size: 10,
        });
    }, [])

    const handlePageChange = (page: number): void => {
        searchUserAuditLogs({
            userId: selectedUserInfo.selectedUserId!,
            page: page - 1,
            size: 10,
        })
    };

    return (
        <div className="flex h-full w-full flex-col justify-between">
            <AuditLogCardList height={"100%"} logs={auditLogsPage.content}/>
            <div className="flex-shrink-0 border-t">
                <PaginationFooter
                    totalPages={auditLogsPage.totalPages}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}
