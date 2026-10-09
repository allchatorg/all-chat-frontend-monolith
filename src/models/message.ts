import type {FontPreset} from "@/lib/fontPresets";
import {Attachment} from "@/models/Attachment";
import {Reaction} from "@/models/Reaction";
import {Role} from "@/models/Role";
import {IdVerificationStatus} from "@/models/IdVerificationStatus";

export interface ReplyInfo {
    id: number;
    senderId: number;
    senderUsername: string;
    senderVipBadgeVisible?: boolean;
    senderVipBadgeRevision?: number;
    senderUsernameFont?: FontPreset;
    senderMessageFont?: FontPreset;
    senderFontRevision?: number;
    color?: string;
    /** null when the replied-to message was removed and the viewer may not see its content */
    content: string | null;
    /** Short allowlisted sticker identity; null when the original content is redacted. */
    stickerId?: string | null;
    deleted: boolean;
    hasAttachment: boolean;
    /** name of the first attachment on the replied-to message, when one is present */
    attachmentName?: string | null;
}

export type PromotionStatus = "PENDING" | "APPROVED" | "DENIED" | "CANCELED";

/** Active promotion attached to a message (only PENDING/APPROVED are ever sent). */
export interface PromotionInfo {
    id: number;
    status: PromotionStatus;
}

export interface Message {
    id: number;
    content: string;
    /** Standalone sticker messages have empty content and no attachments. */
    stickerId?: string | null;
    // Keep API timestamps serializable in Redux; parse only when formatting or comparing.
    createdAt: string;
    senderId: number;
    senderUsername: string;
    senderVipBadgeVisible?: boolean;
    senderVipBadgeRevision?: number;
    senderUsernameFont?: FontPreset;
    senderMessageFont?: FontPreset;
    senderFontRevision?: number;
    senderRole: Role;
    senderCountryCode?: string;
    senderIdVerificationStatus?: IdVerificationStatus;
    chatRoomId: number;
    chatRoomName: string;
    chatRoomVipOnly?: boolean;
    bannedUser: boolean;
    editedAt?: string;
    color: string;
    deleted: boolean;
    attachments: Attachment[];
    reactions: Reaction[];
    advert?: boolean;
    replyTo?: ReplyInfo | null;
    promotion?: PromotionInfo | null;
}
