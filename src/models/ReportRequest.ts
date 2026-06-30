import {ReportType} from "@/models/ReportTypeEnum";

export interface ReportRequest {
    messageId: number;
    reportType: ReportType;
    description?: string;
}