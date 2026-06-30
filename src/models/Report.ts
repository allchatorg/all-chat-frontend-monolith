import {User} from "@/models/User";
import {ReportType} from "./ReportTypeEnum";

export enum ReportOrigin {
    USER = "USER",
    SYSTEM = "SYSTEM",
}

export interface Report {
    id: number;
    reportCaseId: number;
    messageId: number;
    reportedUserId: number;
    reporter: User | null;
    reporterOrigin: ReportOrigin;
    reportType: ReportType;
    description?: string;
    createdAt: string;
}
