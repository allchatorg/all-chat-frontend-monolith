import {useCallback} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {ReportType} from '@/models/ReportTypeEnum';
import {ReportSeverity} from "@/models/ReportSeverity";
import {ReportAssignmentFilter} from "@/models/ReportAssignmentFilter";
import {ColumnSort} from "@tanstack/react-table";
import {ReportCasesSearchFilters} from "@/app/(admin)/report-cases/components/ReportCasesSearchFilters";

export function useReportCaseFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const ncmecDecisionPending = searchParams.get("ncmecDecisionPending") === "true" ? true : undefined;

    // The decision can be owed on a resolved case as well as an open one, so that view spans both tabs.
    const resolvedParam = searchParams.get("resolved");
    const resolved: ReportCasesSearchFilters["resolved"] = ncmecDecisionPending
        ? undefined
        : resolvedParam !== null ? resolvedParam === "true" : false;

    const reportTypes = searchParams.get("reportTypes")
        ? (searchParams.get("reportTypes")!.split(",") as ReportType[])
        : undefined;

    const severities = searchParams.get("severities")
        ? (searchParams.get("severities")!.split(",") as ReportSeverity[])
        : undefined;

    const assignment = (searchParams.get("assignment") as ReportAssignmentFilter | null) || undefined;

    const reportedUserUsernameOrId =
        searchParams.get("reportedUserUsernameOrId") || undefined;

    const needsAttentionParam = searchParams.get("needsAttention");
    const needsAttention: ReportCasesSearchFilters["needsAttention"] =
        needsAttentionParam !== null ? needsAttentionParam === "true" : undefined;

    const page = searchParams.get("page")
        ? parseInt(searchParams.get("page")!)
        : 1;

    const size = searchParams.get("size")
        ? parseInt(searchParams.get("size")!)
        : 25;

    const sortParam = searchParams.get("sort");
    let sort: ColumnSort[] | undefined = undefined;

    if (sortParam) {
        try {
            sort = JSON.parse(sortParam) as ColumnSort[];
        } catch {
            sort = undefined;
        }
    }

    const filters: ReportCasesSearchFilters = {
        resolved,
        reportTypes,
        severities,
        assignment,
        reportedUserUsernameOrId,
        needsAttention,
        ncmecDecisionPending,
        page,
        size,
        sort,
    };

    const setFilters = useCallback((filters: ReportCasesSearchFilters) => {
        const params = new URLSearchParams(searchParams.toString());

        if (filters.resolved !== undefined) {
            params.set('resolved', filters.resolved.toString());
        }
        if (filters.reportTypes && filters.reportTypes.length > 0) {
            params.set('reportTypes', filters.reportTypes.join(','));
        } else {
            params.delete('reportTypes');
        }
        if (filters.severities && filters.severities.length > 0) {
            params.set('severities', filters.severities.join(','));
        } else {
            params.delete('severities');
        }
        if (filters.assignment) {
            params.set('assignment', filters.assignment);
        } else {
            params.delete('assignment');
        }
        if (filters.reportedUserUsernameOrId) {
            params.set('reportedUserUsernameOrId', filters.reportedUserUsernameOrId);
        } else {
            params.delete('reportedUserUsernameOrId');
        }
        if (filters.needsAttention !== undefined) {
            params.set("needsAttention", String(filters.needsAttention));
        }
        if (filters.ncmecDecisionPending) {
            params.set("ncmecDecisionPending", "true");
        } else {
            params.delete("ncmecDecisionPending");
        }
        if (filters.page !== undefined) {
            params.set('page', filters.page.toString());
        }
        if (filters.size !== undefined) {
            params.set('size', filters.size.toString());
        }
        if (filters.sort) {
            params.set("sort", JSON.stringify(filters.sort));
        }
        router.replace(`?${params.toString()}`, {scroll: false});
    }, [router, filters]);

    return {
        filters,
        setFilters
    };
}