"use client";

import * as React from "react";
import {ReportCasesTable} from "@/app/(admin)/report-cases/components/ReportCasesTable";
import {useThunk} from "@/lib/hooks/useThunk";
import {useSelector} from "react-redux";
import {selectReportCases} from "@/redux/report-cases/reportCasesSelector";
import {getReportCasesThunk} from "@/redux/report-cases/reportCasesThunk";
import {ReportSearchRequest} from "@/models/ReportSearchRequest";

interface Props {
}

export function ReportCasesOverview({}: Props) {
    const reportsState = useSelector(selectReportCases);
    const [searchReportCases, searchReportIsLoading, searchReportError] = useThunk(getReportCasesThunk);

    const reports = reportsState.content;

    const handleSearchParamsChange = (params: ReportSearchRequest) => {
        console.log(params);
        searchReportCases({
            ...params,
            page: params.page - 1,
        });
    }

    return (
        <div className="h-full w-full">
            <ReportCasesTable
                handleSearchParamsChange={handleSearchParamsChange}
                isLoading={searchReportIsLoading}
                totalPages={reportsState.totalPages}
                content={reports}
            />
        </div>
    );
}
