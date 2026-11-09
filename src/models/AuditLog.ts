import {User} from "./User";
import {BanTypeEnum} from "@/models/BanTypeEnum";
import {Message} from "@/models/message";
import {ReportType} from "@/models/ReportTypeEnum";

/** Action of the audit log for a case recorded as not CSAM. Must match the backend's ResolveCaseAuditLog.NOT_CSAM_ACTION. */
export const NOT_CSAM_ACTION = "RESOLVE_CASE_NOT_CSAM";

export enum AuditLogActorType {
    USER = "USER",
    SYSTEM = "SYSTEM",
}

export enum AuditLogType {
    BAN = "BAN",
    CHANGE_USERNAME = "CHANGE_USERNAME",
    MESSAGE_DELETE = "MESSAGE_DELETE",
    MESSAGE_RESTORE = "MESSAGE_RESTORE",
    REVOKE_BAN = "REVOKE_BAN",
    WARNING = "WARNING",
    RESOLVE_CASE = "RESOLVE_CASE",
    REOPEN_CASE = "REOPEN_CASE",
    PROMOTE_ROLE = "PROMOTE_ROLE",
    DEMOTE_ROLE = "DEMOTE_ROLE",
    NCMEC_REPORT = "NCMEC_REPORT",
    ARCHIVE_CHATROOM = "ARCHIVE_CHATROOM",
    UNARCHIVE_CHATROOM = "UNARCHIVE_CHATROOM",
    BAN_APPEAL_RESOLVE = "BAN_APPEAL_RESOLVE",
    REQUIRE_ID_VERIFICATION = "REQUIRE_ID_VERIFICATION",
    CLEAR_ID_VERIFICATION = "CLEAR_ID_VERIFICATION",
    ID_VERIFICATION_PASSED = "ID_VERIFICATION_PASSED",
    ID_VERIFICATION_FAILED = "ID_VERIFICATION_FAILED",
    REQUEST_ELEVATION = "REQUEST_ELEVATION",
    AD_APPROVE = "AD_APPROVE",
    AD_REJECT = "AD_REJECT",
    AD_STOP = "AD_STOP",
    AD_REFUND = "AD_REFUND",
    PROMOTION_APPROVE = "PROMOTION_APPROVE",
    PROMOTION_DENY = "PROMOTION_DENY",
    PROMOTION_CANCEL = "PROMOTION_CANCEL",
    PROMOTION_REFUND = "PROMOTION_REFUND",
    VIP_CANCEL = "VIP_CANCEL",
    VIP_REFUND = "VIP_REFUND",
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
    deleteAllMessages: boolean | null;
    deleteMessagesDurationSeconds: number | null;
}

export interface RevokeBanAuditLog extends AuditLog {
    auditLogType: AuditLogType.REVOKE_BAN;
    targetUser: User;
}

export interface MessageDeleteAuditLog extends AuditLog {
    auditLogType: AuditLogType.MESSAGE_DELETE;
    deletedMessage: Message;
}

export interface MessageRestoreAuditLog extends AuditLog {
    auditLogType: AuditLogType.MESSAGE_RESTORE;
    restoredMessage: Message;
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

export interface ReopenCaseAuditLog extends AuditLog {
    auditLogType: AuditLogType.REOPEN_CASE;
    reportCaseId: number;
}

export interface RequestElevationAuditLog extends AuditLog {
    auditLogType: AuditLogType.REQUEST_ELEVATION;
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

export interface IdVerificationAuditLog extends AuditLog {
    auditLogType:
        | AuditLogType.REQUIRE_ID_VERIFICATION
        | AuditLogType.CLEAR_ID_VERIFICATION
        | AuditLogType.ID_VERIFICATION_PASSED
        | AuditLogType.ID_VERIFICATION_FAILED;
    reportCaseId?: number | null;
}

export interface PurchaseAuditLog extends AuditLog {
    auditLogType:
        | AuditLogType.AD_APPROVE
        | AuditLogType.AD_REJECT
        | AuditLogType.AD_STOP
        | AuditLogType.AD_REFUND
        | AuditLogType.PROMOTION_APPROVE
        | AuditLogType.PROMOTION_DENY
        | AuditLogType.PROMOTION_CANCEL
        | AuditLogType.PROMOTION_REFUND
        | AuditLogType.VIP_CANCEL
        | AuditLogType.VIP_REFUND;
    targetUser: User;
    purchaseType: string;
    purchaseReference: string;
    reason: string | null;
    amount: number | null;
    currency: string | null;
    paymentStatus: string | null;
}

export type AuditLogUnion =
    | PurchaseAuditLog
    | BanAuditLog
    | RevokeBanAuditLog
    | BanAppealResolveAuditLog
    | MessageDeleteAuditLog
    | MessageRestoreAuditLog
    | ChangeUsernameAuditLog
    | WarningAuditLog
    | ResolveCaseAuditLog
    | ReopenCaseAuditLog
    | RequestElevationAuditLog
    | RoleChangeAuditLog
    | NcmecReportAuditLog
    | ChatRoomAuditLog
    | IdVerificationAuditLog;

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

const PURCHASE_LABELS: Record<string, string> = {
    AD: "Ad #",
    PROMOTED_MESSAGE: "Promoted message #",
    ROOM_PROMOTION: "Room promotion #",
    VIP: "VIP ",
};

export const getPurchaseLabel = (log: PurchaseAuditLog): string =>
    `${PURCHASE_LABELS[log.purchaseType] ?? `${log.purchaseType} `}${log.purchaseReference}`;

export const formatPurchaseAmount = (log: PurchaseAuditLog): string | null =>
    log.amount == null
        ? null
        : new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: (log.currency ?? "USD").toUpperCase(),
        }).format(log.amount);

export const formatAuditDuration = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
    if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""}`;
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
};

export const getBanMessageDeletionLabel = (log: BanAuditLog): string => {
    // Bans logged before deleteAllMessages existed recorded "Delete All" as a missing duration.
    if (log.deleteAllMessages || log.deleteMessagesDurationSeconds == null) {
        return "All messages deleted";
    }

    // Older bans could be submitted with no period, which sent 0 and deleted nothing.
    if (log.deleteMessagesDurationSeconds === 0) {
        return "No messages deleted";
    }

    return `Messages deleted (${formatAuditDuration(log.deleteMessagesDurationSeconds)})`;
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
