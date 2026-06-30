import {Message} from "@/models/message";
import {AuditLogUnion} from "./AuditLog";
import {User} from "@/models/User";
import {Report} from "@/models/Report";

export interface ReportCase {
    id: number;
    message: Message;
    reports: Report[];
    auditLogs: AuditLogUnion[];
    resolver: User;
    needsAttentionAt: string | null;
    resolutionDate: string | null;
    csamCase: boolean;
}