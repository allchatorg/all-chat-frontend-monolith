export type RoomPromotionStatus = "PENDING" | "APPROVED" | "DENIED" | "CANCELED";

/**
 * Broadcast to /topic/public-chat and /topic/user.{ownerId} on every room
 * promotion state transition (ROOM_PROMOTION_UPDATE). The Promoted list is
 * global, so the frontend just bumps a counter and refetches.
 */
export interface RoomPromotionEvent {
    chatRoomId: number;
    chatRoomName: string;
    promotionId: number;
    status: RoomPromotionStatus;
    ownerId: number;
    approvedAt: string | null;
}
