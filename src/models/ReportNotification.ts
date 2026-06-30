import {ReportCase} from "@/models/ReportCase";

export interface ReportNotification {
    reporterId: number | null;
    reportCaseId: number;
    reportCase: ReportCase;
}
