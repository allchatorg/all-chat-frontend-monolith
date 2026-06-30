export interface SearchMessageRequest {
    chatRoomId?: number;
    senderUsername?: string;
    content?: string;
    attachmentName?: string;
    page: number;
    size: number;
}