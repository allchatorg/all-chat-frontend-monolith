import {UserMinimalDTO} from "@/models/UserMinimalDTO";
import {Message} from "@/models/message";

/**
 * Admin/moderation view of one of a reviewed user's private conversations.
 * Exposes BOTH participants (unlike PrivateChatDTO, which is relative to the current user).
 */
export interface AdminConversationDTO {
    roomId: number;
    target: UserMinimalDTO;
    counterpart: UserMinimalDTO | null;
    lastMessage: Message | null;
    totalMessageCount: number;
    lastMessageAt: string | null;
    blocked: boolean;
}
