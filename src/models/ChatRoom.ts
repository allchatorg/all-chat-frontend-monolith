import {Message} from "@/models/message";

export interface ChatRoom {
    id: number;
    name: string;
    messages: Message[];
    isArchived: boolean;
    totalMessages: number;
    hasPrevious: boolean;
    hasNext: boolean;
    firstMessageId: number | null;
    lastMessageId: number | null;
    lastReadMessage?: number;
}
