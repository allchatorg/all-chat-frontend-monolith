import {User} from "./User";
import {Message} from "@/models/message";

export interface ReportCaseSummary {
    id: number;
    message: Message;
    reportCount: number;
    resolver: User;
    needsAttentionAt: string | null;
    resolutionDate: string | null;
    csamCase: boolean;
}