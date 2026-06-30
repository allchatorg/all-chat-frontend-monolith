import {Attachment} from "@/models/Attachment";

export interface CreateMessageRequest {
    content: string;
    chatRoomId: number;
    attachments?: Attachment[];
    replyToMessageId?: number;
}