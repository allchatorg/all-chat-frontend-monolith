import {User} from "./User";
import {BanTypeEnum} from "@/models/BanTypeEnum";
import {Message} from "@/models/message";
import {ReportType} from "@/models/ReportTypeEnum";

export enum AuditLogActorType {
    USER = "USER",
    SYSTEM = "SYSTEM",
}

export enum AuditLogType {
    BAN = "BAN",
    CHANGE_USERNAME = "CHANGE_USERNAME",
    MESSAGE_DELETE = "MESSAGE_DELETE",
    REVOKE_BAN = "REVOKE_BAN",
    WARNING = "WARNING",
    RESOLVE_CASE = "RESOLVE_CASE",
    PROMOTE_ROLE = "PROMOTE_ROLE",
    DEMOTE_ROLE = "DEMOTE_ROLE",
    NCMEC_REPORT = "NCMEC_REPORT",
    ARCHIVE_CHATROOM = "ARCHIVE_CHATROOM",
    UNARCHIVE_CHATROOM = "UNARCHIVE_CHATROOM",
    BAN_APPEAL_RESOLVE = "BAN_APPEAL_RESOLVE",
}

export interface AuditLog {
    id: number;
    createdAt: string;
    createdBy: User | null;
    createdByType: AuditLogActorType;
    targetUser: User | null;
    action: string;
    description: string;
    auditLogType: AuditLogType;
}

export interface BanAuditLog extends AuditLog {
    auditLogType: AuditLogType.BAN;
    targetUser: User;
    banType: BanTypeEnum;
    reportType: ReportType;
    banDurationSeconds: number;
    deleteMessages: boolean;
    deleteMessagesDurationSeconds: number;
}

export interface RevokeBanAuditLog extends AuditLog {
    auditLogType: AuditLogType.REVOKE_BAN;
    targetUser: User;
}

export interface MessageDeleteAuditLog extends AuditLog {
    auditLogType: AuditLogType.MESSAGE_DELETE;
    deletedMessage: Message;
}

export interface ChangeUsernameAuditLog extends AuditLog {
    auditLogType: AuditLogType.CHANGE_USERNAME;
    oldUsername: string;
    newUsername: string;
}

export interface WarningAuditLog extends AuditLog {
    auditLogType: AuditLogType.WARNING;
    targetUser: User;
    warnedUser: User;
    reason: string;
}

export interface ResolveCaseAuditLog extends AuditLog {
    auditLogType: AuditLogType.RESOLVE_CASE;
    reportCaseId: number;
}

export interface RoleChangeAuditLog extends AuditLog {
    auditLogType: AuditLogType.PROMOTE_ROLE | AuditLogType.DEMOTE_ROLE;
    targetUser: User;
    previousRole: string; // using string to align with backend Role enum textual value
    newRole: string;
}

export interface NcmecReportAuditLog extends AuditLog {
    auditLogType: AuditLogType.NCMEC_REPORT;
    ncmecReportId: number;
    reportCaseId: number;
    xmlContent: string;
    status: string;
}

export interface ChatRoomAuditLog extends AuditLog {
    auditLogType: AuditLogType.ARCHIVE_CHATROOM | AuditLogType.UNARCHIVE_CHATROOM;
    chatRoomId: number;
    chatRoomName: string;
    targetUser: null;
}

export interface BanAppealResolveAuditLog extends AuditLog {
    auditLogType: AuditLogType.BAN_APPEAL_RESOLVE;
    targetUser: User;
    appealId: number;
    banId: number;
    decision: string;
}

export type AuditLogUnion =
    | BanAuditLog
    | RevokeBanAuditLog
    | BanAppealResolveAuditLog
    | MessageDeleteAuditLog
    | ChangeUsernameAuditLog
    | WarningAuditLog
    | ResolveCaseAuditLog
    | RoleChangeAuditLog
    | NcmecReportAuditLog
    | ChatRoomAuditLog;

export const isBan = (log: AuditLog): log is BanAuditLog =>
    log.auditLogType === AuditLogType.BAN;

export const isRevokeBan = (log: AuditLog): log is RevokeBanAuditLog =>
    log.auditLogType === AuditLogType.REVOKE_BAN;

export const isMessageDelete = (log: AuditLog): log is MessageDeleteAuditLog =>
    log.auditLogType === AuditLogType.MESSAGE_DELETE;

export const isChangeUsername = (log: AuditLog): log is ChangeUsernameAuditLog =>
    log.auditLogType === AuditLogType.CHANGE_USERNAME;

export const isWarning = (log: AuditLog): log is WarningAuditLog =>
    log.auditLogType === AuditLogType.WARNING;

export const isNcmecReport = (log: AuditLog): log is NcmecReportAuditLog =>
    log.auditLogType === AuditLogType.NCMEC_REPORT;

export const isChatRoomAuditLog = (log: AuditLog): log is ChatRoomAuditLog =>
    log.auditLogType === AuditLogType.ARCHIVE_CHATROOM || log.auditLogType === AuditLogType.UNARCHIVE_CHATROOM;

export const getAuditLogActorLabel = (log: AuditLog): string => {
    if (log.createdByType === AuditLogActorType.SYSTEM) {
        return "System";
    }

    return log.createdBy?.username ?? "Unknown User";
};

export const processAuditLog = (log: AuditLogUnion) => {
    switch (log.auditLogType) {
        case AuditLogType.BAN:
            console.log(`User ${log.targetUser.username} was banned for ${log.reportType}`);
            break;
        case AuditLogType.REVOKE_BAN:
            console.log(`Ban revoked for user ${log.targetUser.username}`);
            break;
        case AuditLogType.MESSAGE_DELETE:
            console.log(`Message deleted: ${log.deletedMessage.content}`);
            break;
        case AuditLogType.CHANGE_USERNAME:
            console.log(`User changed username from ${log.oldUsername} to ${log.newUsername}`);
            break;
        case AuditLogType.WARNING:
            console.log(`User ${log.warnedUser.username} received a warning: ${log.reason}`);
            break;
        case AuditLogType.RESOLVE_CASE:
            console.log(`Report case #${log.reportCaseId} was resolved by ${getAuditLogActorLabel(log)}`);
            break;
        case AuditLogType.PROMOTE_ROLE:
        case AuditLogType.DEMOTE_ROLE:
            console.log(`User ${log.targetUser.username} role changed from ${(log as any).previousRole} to ${(log as any).newRole}`);
            break;
        case AuditLogType.NCMEC_REPORT:
            console.log(`NCMEC report #${log.ncmecReportId} submitted for case #${log.reportCaseId} — status: ${log.status}`);
            break;
        case AuditLogType.ARCHIVE_CHATROOM:
            console.log(`Chat room ${log.chatRoomName} was archived`);
            break;
        case AuditLogType.UNARCHIVE_CHATROOM:
            console.log(`Chat room ${log.chatRoomName} was unarchived`);
            break;
    }
};
