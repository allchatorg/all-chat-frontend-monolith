import {User} from "./User";
import {Message} from "@/models/message";
import {ReportType} from "@/models/ReportTypeEnum";
import {ReportCaseTriage} from "@/models/ReportCaseTriage";

export interface ReportCaseSummary extends ReportCaseTriage {
    id: number;
    message: Message;
    reportCount: number;
    reportTypes?: ReportType[];
    resolver: User;
    needsAttentionAt: string | null;
    resolutionDate: string | null;
    csamCase: boolean;
}