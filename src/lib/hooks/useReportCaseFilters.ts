import {useCallback} from 'react';
import {useRouter, useSearchParams} from 'next/navigation';
import {ReportType} from '@/models/ReportTypeEnum';
import {ColumnSort} from "@tanstack/react-table";
import {ReportCasesSearchFilters} from "@/app/(admin)/report-cases/components/ReportCasesSearchFilters";

export function useReportCaseFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const resolvedParam = searchParams.get("resolved");
    const resolved: ReportCasesSearchFilters["resolved"] =
        resolvedParam !== null ? resolvedParam === "true" : false;

    const reportTypes = searchParams.get("reportTypes")
        ? (searchParams.get("reportTypes")!.split(",") as ReportType[])
        : undefined;

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
        : 2;

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
        reportedUserUsernameOrId,
        needsAttention,
        page,
        size,
        sort,
    };

    const setFilters = useCallback((filters: ReportCasesSearchFilters) => {
        const params = new URLSearchParams(searchParams.toString());

        if (filters.resolved !== undefined) {
            params.set('resolved', filters.resolved.toString());
        }
        if (filters.reportTypes) {
            params.set('reportTypes', filters.reportTypes.join(','));
        }
        if (filters.reportedUserUsernameOrId) {
            params.set('reportedUserUsernameOrId', filters.reportedUserUsernameOrId);
        } else {
            params.delete('reportedUserUsernameOrId');
        }
        if (filters.needsAttention !== undefined) {
            params.set("needsAttention", String(filters.needsAttention));
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