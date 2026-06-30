import {Message} from "@/models/message";

export interface MessagePage {
    messages: Message[];
    hasPrevious: boolean;
    hasNext: boolean;
    firstMessageId: number | null;
    lastMessageId: number | null;
}