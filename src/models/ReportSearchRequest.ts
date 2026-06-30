import {ReportType} from "@/models/ReportTypeEnum";

export interface ReportSearchRequest {
    resolved?: boolean;
    reportTypes?: ReportType[];
    reportedUserUsernameOrId?: string;
    needsAttention?: boolean;
    page: number;
    size: number;
    sort?: string;
}