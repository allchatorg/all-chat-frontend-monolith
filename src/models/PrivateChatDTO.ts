import {UserMinimalDTO} from "@/models/UserMinimalDTO";
import {Message} from "@/models/message";

export interface PrivateChatDTO {
    id: number;
    counterpart: UserMinimalDTO | null;
    unreadMessagesCount: number | null;
    lastReadMessage: Message | null;
    lastMessage: Message | null;
    blocked: boolean;
}
