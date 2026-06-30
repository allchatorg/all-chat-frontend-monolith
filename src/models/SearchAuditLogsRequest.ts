import {AuditLogActorType, AuditLogType} from "@/models/AuditLog";

export interface SearchAuditLogsRequest {
    userId?: number;
    createdByUserId?: number;
    createdByType?: AuditLogActorType;
    targetUserId?: number;
    auditLogType?: AuditLogType;
    sort?: string;
    page: number;
    size: number;
}
