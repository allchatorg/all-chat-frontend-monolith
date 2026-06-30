import {ReportType} from "@/models/ReportTypeEnum";
import {ColumnSort} from "@tanstack/react-table";

export interface ReportCasesSearchFilters {
    resolved?: boolean;
    reportTypes?: ReportType[];
    reportedUserUsernameOrId?: string;
    needsAttention?: boolean;
    page: number;
    size: number;
    sort?: ColumnSort[];
}