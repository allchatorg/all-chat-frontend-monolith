import {ReportType} from "@/models/ReportTypeEnum";
import {ReportSeverity} from "@/models/ReportSeverity";
import {ReportAssignmentFilter} from "@/models/ReportAssignmentFilter";
import {ColumnSort} from "@tanstack/react-table";

export interface ReportCasesSearchFilters {
    resolved?: boolean;
    reportTypes?: ReportType[];
    severities?: ReportSeverity[];
    assignment?: ReportAssignmentFilter;
    reportedUserUsernameOrId?: string;
    needsAttention?: boolean;
    ncmecDecisionPending?: boolean;
    page: number;
    size: number;
    sort?: ColumnSort[];
}