export interface TypingUpdate {
    chatRoomId: number;
    userId: number;
    username: string;
    typing: boolean;
    expiresInMs: number;
}
