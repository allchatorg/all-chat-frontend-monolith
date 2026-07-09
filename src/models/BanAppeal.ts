import {Ban} from "@/models/Ban";
import {BanTypeEnum} from "@/models/BanTypeEnum";
import {ReportType} from "@/models/ReportTypeEnum";

/** Full lifecycle, visible to admins. */
export enum BanAppealStatus {
    PENDING = "PENDING",
    UNDER_REVIEW = "UNDER_REVIEW",
    APPROVED = "APPROVED",
    DENIED = "DENIED",
    EXPIRED = "EXPIRED",
}

/** Collapsed statuses shown to the banned user (PENDING/UNDER_REVIEW -> IN_REVIEW). */
export enum BanAppealUserStatus {
    IN_REVIEW = "IN_REVIEW",
    APPROVED = "APPROVED",
    DENIED = "DENIED",
    EXPIRED = "EXPIRED",
}

export enum BanAppealDecision {
    APPROVED = "APPROVED",
    DENIED = "DENIED",
}

export interface BanAppealUserView {
    id: number;
    status: BanAppealUserStatus;
    submittedAt: string;
    resolvedAt: string | null;
    appealText: string;
    whatWillChange: string | null;
    userFacingMessage: string | null;
}

export interface MyBanContext {
    ban: Ban;
    appealable: boolean;
    appeal: BanAppealUserView | null;
}

export interface BanAppealRequest {
    appealText: string;
    whatWillChange?: string;
}

export interface BanAppealAdminList {
    id: number;
    status: BanAppealStatus;
    submittedAt: string;
    userId: number;
    username: string;
    banId: number;
    banType: BanTypeEnum;
    reportType: ReportType;
    banDescription: string | null;
    bannedByUserId: number | null;
    bannedByUsername: string | null;
    reviewerUserId: number | null;
    reviewerUsername: string | null;
    resolvedAt: string | null;
}

export interface BanAppealAdminDetail {
    summary: BanAppealAdminList;
    appealText: string;
    whatWillChange: string | null;
    internalNote: string | null;
    userFacingMessage: string | null;
    resolvedByUserId: number | null;
    resolvedByUsername: string | null;
    banCreatedAt: string;
    banExpiresAt: string | null;
    banActive: boolean;
    priorBanCount: number;
    priorBans: Ban[];
}

export interface BanAppealResolutionRequest {
    decision: BanAppealDecision;
    internalNote: string;
    userFacingMessage?: string;
}
