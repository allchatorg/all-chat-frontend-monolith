import {Attachment} from "@/models/Attachment";

export interface CreateMessageRequest {
    content: string;
    stickerId?: string | null;
    chatRoomId: number;
    attachments?: Attachment[];
    replyToMessageId?: number;
}
