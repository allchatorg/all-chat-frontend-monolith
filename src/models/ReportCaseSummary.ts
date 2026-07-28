import {User} from "./User";
import {Message} from "@/models/message";
import {ReportType} from "@/models/ReportTypeEnum";

export interface ReportCaseSummary {
    id: number;
    message: Message;
    reportCount: number;
    reportTypes?: ReportType[];
    resolver: User;
    needsAttentionAt: string | null;
    resolutionDate: string | null;
    csamCase: boolean;
}