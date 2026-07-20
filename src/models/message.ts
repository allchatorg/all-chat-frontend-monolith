import {Attachment} from "@/models/Attachment";
import {Reaction} from "@/models/Reaction";
import {Role} from "@/models/Role";

export interface ReplyInfo {
    id: number;
    senderId: number;
    senderUsername: string;
    color?: string;
    /** null when the replied-to message was removed and the viewer may not see its content */
    content: string | null;
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
    createdAt: Date;
    senderId: number;
    senderUsername: string;
    senderRole: Role;
    senderCountryCode?: string;
    chatRoomId: number;
    chatRoomName: string;
    bannedUser: boolean;
    editedAt?: Date;
    color: string;
    deleted: boolean;
    attachments: Attachment[];
    reactions: Reaction[];
    advert?: boolean;
    replyTo?: ReplyInfo | null;
    promotion?: PromotionInfo | null;
}