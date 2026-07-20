import {PromotionStatus} from "@/models/message";

/**
 * Broadcast to the room topic on every promotion state transition
 * (PROMOTED_MESSAGE_UPDATE). DENIED/CANCELED clear the message's promotion;
 * PENDING/APPROVED set it. Visibility of the PENDING indicator is decided
 * on the frontend (owner + staff only).
 */
export interface PromotedMessageEvent {
    messageId: number;
    chatRoomId: number;
    chatRoomName: string;
    promotionId: number;
    status: PromotionStatus;
    ownerId: number;
}
